describe("Product Edit Test", () => {
  const adminUrl = "http://localhost:3000/admin/products";
  const loginUrl = "http://localhost:3000/auth/login";

  const originalNameStartsWith = "Test Product for E2E";
  const editedType = "Edited Name - Updated Detailed Description";
  const editedSeoTitle = "Edited SEO Title - Up to 60 chars";
  const editedSeoDesc =
    "Edited SEO Description for the product. Ensures proper visibility and updated metadata for search engines with concise and relevant content.";
  const editedBlogSnippet = "Edited blog content to confirm rendering on the public product page.";
  const editedSpecTitle = "Edited Spec - Weight";
  const editedSpecDesc = "Edited spec description - now 450 grams with balanced distribution.";
  const editedFaqQuestion = "How do I maintain the updated product for best results?";
  const editedFaqAnswer =
    "Keep the product clean and follow the updated manual guidelines for longevity.";

  beforeEach(() => {
    cy.visit(loginUrl);
    cy.get('[data-testid="username-input"]').type("FarabakAdmin");
    cy.get('[data-testid="password-input"]').type("F@rabak@dmin1007066");
    cy.get('[data-testid="submit-button"]').click();

    cy.wait(15000);
    cy.url().should("include", "/admin");
    cy.get("body").should("not.contain", "Error fetching user data");

    cy.wait(5000);
    cy.visit(adminUrl);
    cy.url().should("include", "/admin/products");
  });

  it("edits the created product, saves, and verifies on product page", () => {
    // Ensure products table is visible
    cy.get('[data-testid="products-table"]', { timeout: 60000 }).should("be.visible");

    // Find the row containing our product and open the edit modal
    cy.get('[data-testid="products-table"]').within(() => {
      cy.contains("tr", originalNameStartsWith, { timeout: 30000 }).within(() => {
        cy.contains("ویرایش").click();
      });
    });

    // Wait for edit modal inputs to be visible
    cy.contains("ویرایش محصول", { timeout: 20000 }).should("be.visible");

    // Update Type and Name
    cy.get('input[name="Type"]').clear().type(editedType);

    // Toggle availability
    cy.get('select[name="Available"]').select("false");
    cy.wait(200);
    cy.get('select[name="Available"]').select("true");

    // Update price/discount
    cy.get('input[name="Price"]').clear().type("1200");
    cy.get('input[name="Discount"]').clear().type("100");

    // Add a keyword
    cy.get("#Description").type("editedkeyword{enter}");

    // Update SEO fields
    cy.get('input[name="SEO_Title"]').clear().type(editedSeoTitle);
    cy.get('textarea[name="SEO_Description"]').clear().type(editedSeoDesc);

    // Update Product Blog via TipTap editor
    cy.get(".ProseMirror", { timeout: 10000 }).then(($editor) => {
      if ($editor.length) {
        cy.wrap($editor).click().type(` {selectall}{backspace}${editedBlogSnippet}`);
      }
    });

    // Update both images using hidden file inputs
    cy.contains("تصویر بدون پس‌زمینه")
      .parent()
      .within(() => {
        cy.get('input[type="file"]').selectFile("cypress/fixtures/test-image-2.jpg", {
          force: true,
        });
      });
    cy.contains("تصویر بنر")
      .parent()
      .within(() => {
        cy.get('input[type="file"]').selectFile("cypress/fixtures/test-image-2.jpg", {
          force: true,
        });
      });

    // Edit existing specs (if any available)
    cy.contains("مشخصات محصول").scrollIntoView();
    cy.wait(500);
    cy.get('label:contains("عنوان") + input')
      .first()
      .then(($input) => {
        if ($input.length) {
          cy.wrap($input).clear().type(editedSpecTitle);
        }
      });
    cy.get('label:contains("توضیحات") + input')
      .first()
      .then(($input) => {
        if ($input.length) {
          cy.wrap($input).clear().type(editedSpecDesc);
        }
      });

    // Edit existing FAQ (if any available)
    cy.contains("سوالات متداول").scrollIntoView();
    cy.wait(500);
    cy.get('input[placeholder^="سوال "]')
      .first()
      .then(($q) => {
        if ($q.length) {
          cy.wrap($q).clear().type(editedFaqQuestion);
        }
      });
    cy.get('textarea[placeholder^="پاسخ "]')
      .first()
      .then(($a) => {
        if ($a.length) {
          cy.wrap($a).clear().type(editedFaqAnswer);
        }
      });

    // Save
    cy.contains("button", "ذخیره").click();

    // Wait for modal to close and table to reappear
    cy.get('[data-testid="products-table"]', { timeout: 60000 }).should("be.visible");

    // Verify row reflects edited Type/Name
    cy.get('[data-testid="products-table"]').within(() => {
      cy.contains("tr", editedType, { timeout: 30000 }).should("exist");
      cy.contains("tr", editedType).should("exist");
    });

    // Navigate to public product page using the "مشاهده" link from the same row
    cy.get('[data-testid="products-table"]').within(() => {
      cy.contains("tr", editedType).within(() => {
        cy.contains("a", "مشاهده")
          .invoke("attr", "href")
          .then((href) => {
            if (!href) throw new Error("Product view link not found");
            cy.visit(`http://localhost:3000${href}`);
          });
      });
    });

    // Verify on public product page
    // Name and Type in header
    cy.contains(editedType, { timeout: 30000 }).should("exist");
    cy.get("h1").contains(editedType).should("exist");

    // Specs section
    cy.get("#specs").scrollIntoView();
    cy.contains(editedSpecTitle).should("exist");
    cy.contains(editedSpecDesc).should("exist");

    // FAQ section
    cy.get("#faq").scrollIntoView();
    cy.contains(editedFaqQuestion).should("exist");
    cy.contains(editedFaqAnswer).should("exist");

    // Blog section
    cy.get("#blog").scrollIntoView();
    cy.contains(editedBlogSnippet).should("exist");
  });
});
