describe("User Invoice Flow", () => {
  const baseUrl = "http://localhost:3000";
  const loginUrl = `${baseUrl}/auth/login`;

  it("allows user to login, add product to invoice, save and view it", () => {
    // Login as a regular user to use dashboard flow
    cy.visit(loginUrl);
    cy.get('[data-testid="username-input"]').type("rasarasa");
    cy.get('[data-testid="password-input"]').type("rasa1234");
    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect to dashboard
    cy.url({ timeout: 60000 }).should("include", "/dashboard");

    // Go to products listing and open first product
    cy.visit(`${baseUrl}/products`);

    // Click the first product card link
    cy.get('a[class*="productCard"]', { timeout: 30000 })
      .first()
      .then(($a) => {
        const href = $a.attr("href");
        expect(href, "product link exists").to.be.a("string");
        cy.visit(`${baseUrl}${href}`);
      });

    // Add to invoice on product page
    cy.contains("button", "اضافه کردن به فاکتور", { timeout: 20000 }).click();

    // Navigate via the in-page link that appears under the amount ("فاکتور جدید")
    cy.get('a[href="/dashboard/new-invoice"]', { timeout: 20000 }).should("be.visible").click();
    cy.url({ timeout: 30000 }).should("include", "/dashboard/new-invoice");

    // Ensure the product row exists in the invoice table
    cy.get("table").should("exist");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);

    // Optionally adjust quantity to 1 (ensure non-zero)
    // Break the chain to avoid detached subject issues on re-render
    cy.get("table tbody tr").first().find('input[type="number"]').as("qtyInput");
    cy.get("@qtyInput").clear();
    cy.get("@qtyInput").type("1", { force: true });
    cy.get("@qtyInput").blur();

    // Intercept invoice creation to assert request and wait for completion
    cy.intercept("POST", "/api/invoice").as("createInvoice");

    // Click save invoice
    cy.contains("button", "ذخیره فاکتور جدید").click();

    // Wait for API response and success toast
    cy.wait("@createInvoice").its("response.statusCode").should("be.oneOf", [200, 201]);
    cy.contains("فاکتور جدید با موفقیت ساخته شد", { timeout: 20000 }).should("exist");

    // User is redirected in 5s, but we proactively go to all invoices
    cy.visit(`${baseUrl}/dashboard/all-invoices`);

    // Intercept invoices list and verify at least one appears
    cy.intercept("GET", "/api/invoice").as("getInvoices");
    cy.wait("@getInvoices").its("response.statusCode").should("eq", 200);

    // Verify the table shows at least one invoice and has expected columns
    cy.get("table").should("exist");
    cy.contains("th", "شماره فاکتور").should("exist");
    cy.contains("th", "تعداد محصولات").should("exist");

    // Validate the latest invoice row is present and has TotalAmount > 0
    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("td")
          .eq(1)
          .invoke("text")
          .then((text) => {
            const normalized = text.replace(/[^0-9]/g, "");
            expect(parseInt(normalized || "0", 10)).to.be.greaterThan(0);
          });
        cy.contains("مشاهده فاکتور").should("exist");
      });
  });
});
