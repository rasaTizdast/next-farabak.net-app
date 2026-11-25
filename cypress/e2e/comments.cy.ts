/// <reference types="cypress" />

/**
 * Run only against an isolated test app backed by a disposable, migrated database.
 * Set Cypress baseUrl to the app's loopback URL and configure the app's BASE_URL to
 * the same origin. Supply env values: commentsDisposable=true, commentArticlePath,
 * commentArticleId, commentProductPath, commentProductId, commentPrivateBlogId,
 * adminUsername/adminPassword and userUsername/userPassword. The member must have
 * both profile names, the admin must have the current Admin role, and the private
 * blog must be unpublished or QR-only. Targets should start with an empty queue;
 * rerun with a fresh database to avoid rate-limit and pagination interference.
 * Example: pnpm exec cypress run --spec cypress/e2e/comments.cy.ts --config baseUrl=http://localhost:3000
 */

describe("moderated comments", () => {
  const unique = Date.now();
  const memberBody = `پرسش آزمایشی ${unique} https://example.invalid/test <script>alert(1)</script> ${"x".repeat(600)}`;
  const productBody = `پرسش محصول آزمایشی ${unique}`;
  const aliasBody = `دیدگاه مستعار آزمایشی ${unique}`;
  const replyBody = `پاسخ تیم آزمایشی ${unique}`;
  const alias = `نام مستعار ${unique}`;
  let articlePath: string;
  let productPath: string;
  let articleId: number;
  let productId: number;
  let privateBlogId: number;

  function publicComments(type: "blog" | "product", id: number) {
    return cy.request(`/api/comments/${type}/${id}`);
  }

  function assertPublicFields(type: "blog" | "product", id: number) {
    publicComments(type, id).then(({ body }) => {
      expect(body.comments).to.be.an("array");
      for (const comment of body.comments) {
        for (const entry of [comment, ...comment.replies]) {
          expect(entry).not.to.have.any.keys("actorId", "reviewerId", "reviewNote");
        }
      }
    });
  }

  function moderate(body: string, decision: "approve" | "hide") {
    const status = decision === "approve" ? "PENDING" : "APPROVED";
    cy.visit(`/admin/comments?status=${status}`);
    cy.contains("li", body, { timeout: 30000 }).within(() => {
      cy.contains("button", decision === "approve" ? "تأیید" : "پنهان کردن").click();
    });
    cy.get('[role="dialog"]').within(() => {
      if (decision === "hide") cy.get("textarea").type("پایان آزمون دیدگاه");
      cy.contains("button", decision === "approve" ? "تأیید انتشار" : "ثبت تصمیم").click();
    });
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("li", body).should("not.exist");
  }

  before(() => {
    const baseUrl = Cypress.config("baseUrl");
    if (!baseUrl || ![true, "true"].includes(Cypress.env("commentsDisposable"))) {
      throw new Error(
        "Set a loopback baseUrl and CYPRESS_commentsDisposable=true for a disposable test database."
      );
    }
    const url = new URL(baseUrl);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error("Comments browser tests only run against a loopback app.");
    }
    articlePath = String(Cypress.env("commentArticlePath") || "");
    productPath = String(Cypress.env("commentProductPath") || "");
    articleId = Number(Cypress.env("commentArticleId"));
    productId = Number(Cypress.env("commentProductId"));
    privateBlogId = Number(Cypress.env("commentPrivateBlogId"));
    if (
      !articlePath.startsWith("/support/blog/") ||
      !productPath.startsWith("/products/") ||
      ![articleId, productId, privateBlogId].every((id) => Number.isSafeInteger(id) && id > 0) ||
      privateBlogId === articleId
    ) {
      throw new Error(
        "Provide distinct isolated article/product/private target fixture paths and IDs."
      );
    }
  });

  it("publishes only approved member, alias and editorial comments, then hides the parent and reply", () => {
    cy.clearCookies();
    cy.visit(articlePath);
    cy.get("#comments").contains("a", "ورود به حساب کاربری").should("be.visible");
    for (const width of [320, 390, 768, 1024, 1440]) {
      cy.viewport(width, 900);
      for (const path of [articlePath, productPath]) {
        cy.visit(path);
        cy.get("#comments").should("be.visible");
        cy.document().then((document) => {
          expect(
            document.documentElement.scrollWidth,
            `horizontal overflow at ${width}px on ${path}`
          ).to.be.at.most(document.documentElement.clientWidth + 1);
        });
      }
    }
    cy.viewport(1280, 900);

    cy.login("user");
    cy.visit(articlePath);
    cy.get("#comments").within(() => {
      cy.contains("label", "متن دیدگاه").find("textarea").focus().should("have.focus");
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should("have.text", "ارسال دیدگاه");
      cy.contains("label", "متن دیدگاه")
        .find("textarea")
        .type(memberBody, { parseSpecialCharSequences: false });
      cy.intercept("POST", "/api/comments").as("submitMember");
      cy.contains("button", "ارسال دیدگاه").click();
      cy.wait("@submitMember").its("response.statusCode").should("eq", 202);
      cy.contains('[role="status"]', "پس از بررسی").should("be.visible");
      cy.contains(memberBody).should("not.exist");
    });
    cy.visit(productPath);
    cy.get('a[href="#comments"]').should("exist");
    cy.get("#comments").within(() => {
      cy.contains("label", "متن دیدگاه").find("textarea").type(productBody);
      cy.intercept("POST", "/api/comments").as("submitProduct");
      cy.contains("button", "ارسال دیدگاه").click();
      cy.wait("@submitProduct").its("response.statusCode").should("eq", 202);
      cy.contains('[role="status"]', "پس از بررسی").should("be.visible");
    });
    cy.request({
      method: "POST",
      url: "/api/comments",
      headers: { Origin: new URL(Cypress.config("baseUrl")!).origin },
      failOnStatusCode: false,
      body: {
        target: { type: "blog", id: privateBlogId },
        mode: "member",
        body: "دیدگاه آزمایشی صفحه خصوصی",
      },
    })
      .its("status")
      .should("eq", 404);

    cy.clearCookies();
    publicComments("blog", articleId).then(({ body }) =>
      expect(JSON.stringify(body)).not.to.include(memberBody)
    );
    cy.request(articlePath).its("body").should("not.include", `پرسش آزمایشی ${unique}`);
    cy.visit(articlePath);
    cy.get("#comments").contains(memberBody).should("not.exist");
    publicComments("product", productId).then(({ body }) =>
      expect(JSON.stringify(body)).not.to.include(productBody)
    );

    cy.login("admin");
    moderate(memberBody, "approve");
    moderate(productBody, "approve");
    cy.visit(articlePath);
    cy.get("#comments").within(() => {
      cy.contains("label", "ثبت با نام مستعار").find("input").check();
      cy.contains("label", /^نام مستعار$/)
        .find("input")
        .type(alias);
      cy.contains("label", "متن دیدگاه").find("textarea").type(aliasBody);
      cy.contains("button", "ارسال دیدگاه").click();
      cy.contains('[role="status"]', "پس از بررسی").should("be.visible");
      cy.contains("li", memberBody).within(() => {
        cy.contains("summary", "پاسخ تیم فرابک").click();
        cy.contains("label", "متن پاسخ").find("textarea").type(replyBody);
        cy.contains("button", "ارسال پاسخ").click();
        cy.contains('[role="status"]', "پس از بررسی").should("be.visible");
      });
    });
    cy.request("/api/auth/profile").then(({ body }) => {
      expect(body.user.role).to.eq("Admin");
      const adminId = body.user.userId;
      cy.request("/api/admin/comments?status=PENDING&targetType=blog").then((response) => {
        const submitted = response.body.comments.find(
          (item: { body: string }) => item.body === aliasBody
        );
        expect(submitted, "pending alias in admin queue").to.exist;
        expect(submitted.author).to.include({
          actorId: adminId,
          presentation: "ALIAS",
          displayName: alias,
        });
      });
    });
    moderate(aliasBody, "approve");
    moderate(replyBody, "approve");
    cy.clearCookies();
    assertPublicFields("blog", articleId);
    assertPublicFields("product", productId);
    cy.visit(articlePath);
    cy.viewport(320, 900);
    cy.get("#comments")
      .contains("p", memberBody)
      .should("be.visible")
      .then(($body) => {
        expect($body[0].scrollWidth, "long comment width at 320px").to.be.at.most(
          $body[0].clientWidth + 1
        );
      });
    cy.document().then((document) => {
      expect(
        document.documentElement.scrollWidth,
        "approved comment page width at 320px"
      ).to.be.at.most(document.documentElement.clientWidth + 1);
    });
    cy.viewport(1280, 900);
    cy.get("#comments")
      .contains("li", memberBody)
      .within(() => {
        cy.contains("p", memberBody).should("be.visible").find("a, script").should("not.exist");
        cy.contains("پاسخ تیم فرابک").should("be.visible");
        cy.contains(replyBody).should("be.visible");
      });
    cy.get("#comments").contains("li", aliasBody).contains(alias).should("be.visible");
    cy.request(articlePath).its("body").should("include", `پرسش آزمایشی ${unique}`);
    cy.visit(productPath);
    cy.get("#comments").contains(productBody).should("be.visible");

    cy.login("admin");
    moderate(memberBody, "hide");
    cy.clearCookies();
    publicComments("blog", articleId).then(({ body }) => {
      const json = JSON.stringify(body);
      expect(json).not.to.include(memberBody);
      expect(json).not.to.include(replyBody);
    });
    cy.request(articlePath)
      .its("body")
      .should("not.include", `پرسش آزمایشی ${unique}`)
      .and("not.include", replyBody);
    cy.visit(articlePath);
    cy.get("#comments").should("not.contain", memberBody).and("not.contain", replyBody);
  });
});
