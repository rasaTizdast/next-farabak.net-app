export type ToolPdfMetric = {
  label: string;
  value: string;
};

export type ToolPdfSection = {
  title: string;
  rows?: Array<{ label: string; value: string }>;
  paragraphs?: string[];
};

export type ToolPdfReport = {
  title: string;
  subtitle: string;
  fileName: string;
  metrics: ToolPdfMetric[];
  pages: ToolPdfSection[][];
  disclaimer: string;
};

const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
}

function style(node: HTMLElement, rules: Partial<CSSStyleDeclaration>) {
  Object.assign(node.style, rules);
}

function addReportPage(
  report: ToolPdfReport,
  sections: ToolPdfSection[],
  index: number,
  total: number
) {
  const page = element("section");
  page.dir = "rtl";
  style(page, {
    boxSizing: "border-box",
    position: "relative",
    width: `${PAGE_WIDTH_PX}px`,
    height: `${PAGE_HEIGHT_PX}px`,
    padding: "52px 58px 130px",
    background: "#ffffff",
    color: "#10243b",
    fontFamily: getComputedStyle(document.body).fontFamily,
    direction: "rtl",
  });

  const topLine = element("div");
  style(topLine, {
    height: "5px",
    marginBottom: "28px",
    borderRadius: "5px",
    background: "linear-gradient(90deg, #1265e8, #42c6d9)",
  });
  page.append(topLine);

  const brand = element("p", "فرابک  /  گزارش برآورد تجهیزات");
  style(brand, { margin: "0 0 12px", color: "#1265e8", fontSize: "12px", fontWeight: "700" });
  page.append(brand);

  const title = element("h1", report.title);
  style(title, {
    margin: "0",
    color: "#061a30",
    fontSize: "26px",
    lineHeight: "1.5",
    fontWeight: "800",
  });
  page.append(title);

  const subtitle = element("p", report.subtitle);
  style(subtitle, { margin: "9px 0 0", color: "#526275", fontSize: "12px", lineHeight: "1.9" });
  page.append(subtitle);

  const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "long" }).format(
    new Date()
  );
  const dateLine = element("p", `تاریخ تهیه: ${date}`);
  style(dateLine, { margin: "8px 0 0", color: "#778598", fontSize: "10px" });
  page.append(dateLine);

  if (index === 0 && report.metrics.length > 0) {
    const metrics = element("div");
    style(metrics, {
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(report.metrics.length, 3)}, 1fr)`,
      gap: "10px",
      marginTop: "24px",
    });
    for (const metric of report.metrics) {
      const card = element("div");
      style(card, {
        padding: "14px 16px",
        border: "1px solid #dbe4ef",
        borderRadius: "10px",
        background: "#f6f9fc",
      });
      const label = element("p", metric.label);
      style(label, { margin: "0", color: "#627388", fontSize: "10px" });
      const value = element("p", metric.value);
      style(value, {
        margin: "6px 0 0",
        color: "#061a30",
        fontSize: "17px",
        lineHeight: "1.5",
        fontWeight: "800",
        overflowWrap: "anywhere",
      });
      card.append(label, value);
      metrics.append(card);
    }
    page.append(metrics);
  }

  const content = element("div");
  style(content, { display: "grid", gap: "14px", marginTop: "22px" });
  for (const section of sections) {
    const card = element("section");
    style(card, {
      padding: "17px 19px",
      border: "1px solid #dbe4ef",
      borderRadius: "10px",
      background: "#ffffff",
    });
    const heading = element("h2", section.title);
    style(heading, {
      margin: "0 0 10px",
      color: "#12375c",
      fontSize: "14px",
      lineHeight: "1.6",
      fontWeight: "800",
    });
    card.append(heading);
    if (section.rows?.length) {
      const list = element("div");
      style(list, { display: "grid", gap: "0" });
      for (const row of section.rows) {
        const item = element("div");
        style(item, {
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
          gap: "12px",
          padding: "8px 0",
          borderTop: "1px solid #edf1f5",
          fontSize: "11px",
          lineHeight: "1.8",
        });
        const label = element("span", row.label);
        style(label, { color: "#64748b", fontWeight: "600" });
        const value = element("span", row.value || "ثبت نشده");
        const containsLatin = /[A-Za-z]/.test(row.value);
        style(value, {
          color: "#132a42",
          fontWeight: "700",
          overflowWrap: "anywhere",
          direction: containsLatin ? "ltr" : "rtl",
          textAlign: containsLatin ? "left" : "right",
        });
        item.append(label, value);
        list.append(item);
      }
      card.append(list);
    }
    for (const paragraphText of section.paragraphs ?? []) {
      const paragraph = element("p", paragraphText);
      style(paragraph, {
        margin: "8px 0 0",
        color: "#475569",
        fontSize: "11px",
        lineHeight: "1.9",
        overflowWrap: "anywhere",
      });
      card.append(paragraph);
    }
    content.append(card);
  }
  page.append(content);

  const footer = element("div", `farabak.net  ·  صفحه ${index + 1} از ${total}`);
  style(footer, {
    marginTop: "24px",
    paddingTop: "12px",
    borderTop: "1px solid #e5eaf0",
    color: "#8591a0",
    fontSize: "9px",
    textAlign: "left",
  });
  page.append(footer);

  const disclaimer = element("p", report.disclaimer);
  style(disclaimer, {
    position: "absolute",
    right: "58px",
    bottom: "58px",
    left: "58px",
    margin: "0",
    padding: "12px 14px",
    borderRight: "3px solid #f0b84a",
    borderRadius: "4px",
    background: "#fff9eb",
    color: "#604b26",
    fontSize: "9px",
    lineHeight: "1.8",
  });
  page.append(disclaimer);
  return page;
}

export async function downloadToolReportPdf(report: ToolPdfReport) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const container = element("div");
  style(container, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    zIndex: "-1",
    width: `${PAGE_WIDTH_PX}px`,
  });
  document.body.append(container);

  const pageSections = report.pages.length ? report.pages : [[]];
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  pdf.setProperties({
    title: report.title,
    subject: report.subtitle,
    creator: "Farabak Support Tools",
  });

  try {
    await document.fonts.ready;
    for (let index = 0; index < pageSections.length; index += 1) {
      const page = addReportPage(report, pageSections[index], index, pageSections.length);
      container.replaceChildren(page);
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
      });
      if (index > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      canvas.width = 0;
      canvas.height = 0;
    }
    pdf.save(report.fileName);
  } finally {
    container.remove();
  }
}
