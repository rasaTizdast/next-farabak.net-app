describe("Admin Categories: create subcategory and cleanup", () => {
  const baseUrl = "http://localhost:3000";
  const adminCategoriesUrl = `${baseUrl}/admin/products/categories`;
  const loginUrl = `${baseUrl}/auth/login`;

  const categoryName = "دسته تستی سایپرس";
  const categorySlug = "cypress-test-category";
  const subcategoryName = "زیردسته تستی سایپرس";
  const subcategorySlug = "cypress-test-subcategory";

  before(() => {
    cy.visit(loginUrl);
    cy.get('[data-testid="username-input"]').type("FarabakAdmin");
    cy.get('[data-testid="password-input"]').type("F@rabak@dmin1007066");
    cy.get('[data-testid="submit-button"]').click();

    cy.wait(12000);
    cy.url().should("include", "/admin");
  });

  it("creates category (fa) and subcategory, then deletes them", () => {
    // Go to admin categories
    cy.visit(adminCategoriesUrl);
    cy.url().should("include", "/admin/products/categories");

    // Create Category
    cy.contains("button", "ساخت دسته‌بندی یا زیردسته‌بندی جدید", { timeout: 20000 }).click();
    // By default, the modal opens on the Category tab; proceed to fill fields

    // Fill Category fields
    cy.contains("label", "نام دسته‌بندی").parent().find("input").clear().type(categoryName);
    cy.contains("label", "شناسه (Slug)").parent().find("input").clear().type(categorySlug);
    cy.contains("label", "فعال (قابل نمایش)").parent().find("select").select("true");

    // SEO fields
    cy.contains("label", "عنوان سئو").parent().find("input").clear().type("سئو دسته تستی");
    cy.contains("label", "توضیحات سئو")
      .parent()
      .find("textarea")
      .clear()
      .type("توضیحات سئو برای دسته تستی سایپرس");
    cy.contains("label", "کلمات کلیدی")
      .parent()
      .find("input[placeholder^=\u0627\u0636\u0627\u0641\u0647]")
      .type("تست{enter}");

    cy.contains("button", "ثبت").click();

    // Verify category appears in table
    cy.contains("table", "دسته بندی", { timeout: 30000 }).should("be.visible");
    cy.contains("tbody tr", categoryName, { timeout: 20000 }).should("exist");

    // Create Subcategory
    cy.contains("button", "ساخت دسته‌بندی یا زیردسته‌بندی جدید").click();
    cy.get('[data-testid="newSubCategoryButton"]').click();

    // Select parent category
    cy.contains("label", "دسته‌بندی اصلی").parent().find("select").select(categoryName);

    // Fill Subcategory fields
    cy.contains("label", "نام دسته‌بندی").parent().find("input").clear().type(subcategoryName);
    cy.contains("label", "شناسه (Slug)").parent().find("input").clear().type(subcategorySlug);
    cy.contains("label", "فعال (قابل نمایش)").parent().find("select").select("true");

    // SEO fields enabled when parent selected
    cy.contains("label", "عنوان سئو").parent().find("input").clear().type("سئو زیر دسته تست");
    cy.contains("label", "توضیحات سئو")
      .parent()
      .find("textarea")
      .clear()
      .type("توضیحات سئو برای زیردسته تستی سایپرس");
    cy.contains("label", "کلمات کلیدی")
      .parent()
      .find("input[placeholder^=\u0627\u0636\u0627\u0641\u0647]")
      .type("زیردسته{enter}");

    cy.contains("button", "ثبت").click();

    // Expand the category and verify subcategory row exists
    cy.contains("tbody tr", categoryName, { timeout: 20000 })
      .should("exist")
      .within(() => {
        cy.contains("button", "مشاهده زیردسته‌بندی").click({ force: true });
      });

    cy.contains("tbody tr", subcategoryName, { timeout: 20000 }).should("exist");

    // Delete subcategory first
    cy.contains("tbody tr", subcategoryName)
      .should("exist")
      .within(() => {
        cy.contains("button", "حذف").click();
      });
    // Confirm delete: type exact name and confirm
    cy.get('input[placeholder="نام را وارد کنید"]', { timeout: 10000 })
      .should("be.visible")
      .type(subcategoryName);
    cy.contains("button", "بله، حذف کن").click();

    // Verify subcategory removed
    cy.contains("tbody tr", subcategoryName).should("not.exist");

    // Delete category
    cy.contains("tbody tr", categoryName)
      .should("exist")
      .within(() => {
        cy.contains("button", "حذف").click();
      });
    cy.get('input[placeholder="نام را وارد کنید"]', { timeout: 10000 })
      .should("be.visible")
      .type(categoryName);
    cy.contains("button", "بله، حذف کن").click();

    // Verify category removed
    cy.contains("tbody tr", categoryName, { timeout: 20000 }).should("not.exist");
  });
});
