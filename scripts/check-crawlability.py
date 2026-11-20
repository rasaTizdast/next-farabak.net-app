"""Read-only HTTP regression checks. Python 3 stdlib; no browser scripts execute.

Usage: python scripts/check-crawlability.py [--origin http://localhost:3300] [--output result.json]
Exit 1 means a check failed. Stored Google indexing is deliberately not a deployment gate.
"""

import argparse
import datetime
import json
import pathlib
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser


class Document(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.visible = []
        self.h1 = []
        self.canonical = []
        self.head_canonical = []
        self.robots = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href"))
            if any(t == "head" for t, _ in self.stack):
                self.head_canonical.append(attrs.get("href"))
        if tag == "meta" and attrs.get("name") in {"robots", "googlebot"}:
            self.robots.append(attrs.get("content", ""))
        if tag not in self.VOID:
            self.stack.append((tag, attrs))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        if not text.strip() or any(
            tag in {"script", "style", "template"}
            or "hidden" in attrs
            or "display:none" in attrs.get("style", "").replace(" ", "").lower()
            for tag, attrs in self.stack
        ):
            return
        self.visible.append(text.strip())
        if any(tag == "h1" for tag, _ in self.stack):
            self.h1.append(text.strip())


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", default="https://farabak.net")
    parser.add_argument("--output")
    args = parser.parse_args()
    origin = args.origin.rstrip("/")
    opener = urllib.request.build_opener(NoRedirect)
    results = []

    def check(name, path, *, status=200, accept="text/html", agent="Mozilla/5.0", tokens=(), html=False, indexable=False, canonical=None, visible_h1=False, redirect=None, xml=False, vary=False):
        started = time.monotonic()
        record = {"name": name, "path": path, "accept": accept, "user_agent": agent}
        failures = []
        try:
            headers = {"Accept": accept, "User-Agent": agent}
            if origin != "https://farabak.net":
                headers.update({"Host": "farabak.net", "X-Forwarded-Host": "farabak.net", "X-Forwarded-Proto": "https"})
            request = urllib.request.Request(origin + path, headers=headers)
            try:
                response = opener.open(request, timeout=25)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                body = response.read().decode("utf-8", errors="replace")
                code = response.code
                response_headers = response.headers
            record.update({"status": code, "content_type": response_headers.get("Content-Type"), "location": response_headers.get("Location"), "vary": response_headers.get("Vary"), "cache_control": response_headers.get("Cache-Control"), "x_robots_tag": response_headers.get("X-Robots-Tag"), "link": response_headers.get("Link")})
            if code != status:
                failures.append(f"expected HTTP {status}, received {code}")
            if redirect and urllib.parse.urljoin("https://farabak.net" + path, response_headers.get("Location", "")) != redirect:
                failures.append("wrong redirect destination")
            if indexable and "noindex" in response_headers.get("X-Robots-Tag", "").lower():
                failures.append("public representation has X-Robots-Tag noindex")
            if vary and "accept" not in [v.strip().lower() for v in ",".join(response_headers.get_all("Vary", [])).split(",")]:
                directives = {part.strip().lower() for part in response_headers.get("Cache-Control", "").split(",")}
                if not {"private", "no-store"}.issubset(directives):
                    failures.append("missing Accept variance or private no-store cache policy")
            text = body
            if html:
                document = Document()
                document.feed(body)
                text = " ".join(document.visible)
                record.update({"visible_h1": document.h1, "canonical": document.canonical, "head_canonical": document.head_canonical, "robots": document.robots, "visible_text_length": len(text)})
                if visible_h1 and not document.h1:
                    failures.append("no visible initial H1 without executing scripts")
                if canonical and document.canonical != [canonical]:
                    failures.append("missing, duplicate or incorrect canonical")
                if canonical and canonical not in document.head_canonical:
                    failures.append("canonical is absent from initial head")
                if indexable and any("noindex" in value.lower() for value in document.robots):
                    failures.append("public HTML has meta noindex")
                if not indexable and code == 404 and not any("noindex" in value.lower() for value in document.robots):
                    failures.append("404 has no noindex directive")
            elif "text/markdown" in accept:
                if "text/markdown" not in response_headers.get("Content-Type", ""):
                    failures.append("expected Markdown content type")
                if indexable and canonical and f'<{canonical}>; rel="canonical"' not in response_headers.get("Link", ""):
                    failures.append("Markdown canonical Link missing")
            for token in tokens:
                if token not in text:
                    failures.append(f"required readable content missing: {token}")
            if xml:
                root = ET.fromstring(body)
                urls = [e.text for e in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
                record["sitemap_url_count"] = len(urls)
                if len(urls) <= 10 or len(urls) != len(set(urls)):
                    failures.append("sitemap is reduced to fallback coverage or contains duplicates")
                if any(urllib.parse.urlsplit(u).scheme != "https" or urllib.parse.urlsplit(u).netloc != "farabak.net" or urllib.parse.urlsplit(u).query for u in urls):
                    failures.append("sitemap contains noncanonical origin/query URLs")
        except Exception as error:
            failures.append(f"{type(error).__name__}: {error}")
        record.update({"seconds": round(time.monotonic() - started, 3), "passed": not failures, "failures": failures})
        results.append(record)
        print(("PASS" if not failures else "FAIL") + " " + name + (": " + "; ".join(failures) if failures else ""))

    category = "/products/reolink-cctv-camera"
    product = category + "/bullet/B400"
    for agent in ["Mozilla/5.0", "Googlebot", "OAI-SearchBot", "ChatGPT-User"]:
        check("category HTML " + agent, category, html=True, indexable=True, canonical="https://farabak.net" + category, visible_h1=True, tokens=("Reolink",), agent=agent, vary=True)
        check("B400 HTML " + agent, product, html=True, indexable=True, canonical="https://farabak.net" + product, visible_h1=True, tokens=("B400", "2560x1440"), agent=agent, vary=True)
    for accept in ["text/markdown", "text/markdown, text/html;q=0.9"]:
        check("category Markdown " + accept, category, accept=accept, agent="ChatGPT-User", indexable=True, tokens=("Reolink",), canonical="https://farabak.net" + category, vary=True)
        check("B400 Markdown " + accept, product, accept=accept, agent="ChatGPT-User", indexable=True, tokens=("B400", "Reolink", "2560x1440"), canonical="https://farabak.net" + product, vary=True)
    check("homepage Markdown indexability", "/", accept="text/markdown", indexable=True, tokens=("فرابک",), canonical="https://farabak.net/", vary=True)
    check("contact initial HTML", "/contact-us", html=True, indexable=True, canonical="https://farabak.net/contact-us", visible_h1=True, tokens=("برای پروژه‌تان",), vary=True)
    check("robots", "/robots.txt", accept="*/*", tokens=("Sitemap: https://farabak.net/sitemap.xml",))
    check("sitemap", "/sitemap.xml", accept="*/*", xml=True)
    check("B400 alias", category + "/ip/B400", status=308, redirect="https://farabak.net" + product)
    check("missing public resource", "/no-such-crawlability-check-page", status=404, html=True)
    check("admin remains private", "/admin", status=307, redirect="https://farabak.net/auth/login")
    check("dashboard remains private", "/dashboard", status=307, redirect="https://farabak.net/auth/login")
    summary = {"observed_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "origin": origin, "passed": all(r["passed"] for r in results), "results": results}
    if args.output:
        path = pathlib.Path(args.output)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f'{sum(r["passed"] for r in results)}/{len(results)} checks passed')
    return 0 if summary["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
