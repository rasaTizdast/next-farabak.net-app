describe("Product Entry Test", () => {
  beforeEach(() => {
    // Login process
    cy.visit("http://localhost:3000/auth/login");
    cy.get('[data-testid="username-input"]').type("FarabakAdmin");
    cy.get('[data-testid="password-input"]').type("F@rabak@dmin1007066");
    cy.get('[data-testid="submit-button"]').click();

    // Wait for login to complete and check for any error messages
    cy.wait(15000);

    // Check if we're redirected to admin page
    cy.url().should("include", "/admin");

    // Check for any error messages on the page
    cy.get("body").should("not.contain", "Error fetching user data");

    // Wait a bit more and then navigate to products page
    cy.wait(2000);
    cy.visit("http://localhost:3000/admin/products");

    // Verify we can access the products page
    cy.url().should("include", "/admin/products");
  });

  it("creates a complete product with all sections filled", () => {
    // Open new product modal
    cy.get('[data-testid="new-product-button"]').click();
    cy.contains("جزئیات پایه").click(); // Open basic details section
    cy.get('[data-testid="basic-details"]').should("be.visible");

    // Fill Basic Details Section
    cy.get('[data-testid="product-name"]').type(
      "Test Product for E2E Testing with Comprehensive Features and Advanced Functionality"
    );
    cy.get('[data-testid="product-slug"]').type(
      "test-product-e2e-comprehensive-features-advanced-functionality"
    );

    // Select category (assuming first category is available)
    cy.get('[data-testid="product-category"]').then(($select) => {
      // Check if there are any categories available (more than just the placeholder)
      const options = $select.find("option");
      if (options.length > 1) {
        // Select the first actual category (index 1, since index 0 is the placeholder)
        cy.get('[data-testid="product-category"]').select(1);

        // Wait for subcategories to load
        cy.wait(1000);

        // Now try to select subcategories using the new data-testid
        cy.get('[data-testid^="subcategory-button-"]').first().click();
      } else {
        // If no categories available, skip category selection
        cy.log("No categories available for selection");
      }
    });

    cy.get('[data-testid="product-price"]').type("1000");
    cy.get('[data-testid="product-discount"]').type("10");
    cy.get('[data-testid="product-small-desc"]').type(
      "This is a comprehensive test product description for E2E testing that includes detailed information about the product features, specifications, and benefits. The product is designed for maximum performance and reliability, ensuring customer satisfaction and long-term durability. It comes with advanced features and cutting-edge technology that sets it apart from competitors in the market."
    );
    cy.get('[data-testid="product-seo-title"]').type("Test Product SEO Title for E2E Testing");
    cy.get('[data-testid="product-seo-desc"]').type(
      "This is a comprehensive SEO description for the test product that includes all necessary keywords and information for search engine optimization. The description covers product features, benefits, specifications, and usage instructions to help improve search engine rankings and provide valuable information to potential customers. This detailed description ensures maximum visibility in search results and helps users understand the product's value proposition."
    );
    cy.get('[data-testid="product-keywords"]').type(
      "test{enter}product{enter}e2e{enter}cypress{enter}"
    );

    // Upload images
    cy.get('[data-testid="product-banner-image"]').selectFile("cypress/fixtures/87958.jpg");
    cy.get('[data-testid="product-transparent-image"]').selectFile("cypress/fixtures/87958.jpg");

    // Fill Product Overview Section (Features)
    cy.contains("بررسی محصول").click(); // Open product overview section

    // Add features (ProductOverview - Property1-4: 300 chars each)
    cy.get('[data-testid="add-feature-button"]').click();
    cy.get('[data-testid="product-feature-0"]').type(
      "High quality materials with premium finish and superior durability that ensures long-lasting performance and exceptional user experience. This feature provides outstanding reliability and meets the highest industry standards for quality assurance and customer satisfaction."
    );

    cy.get('[data-testid="add-feature-button"]').click();
    cy.get('[data-testid="product-feature-1"]').type(
      "Durable construction with reinforced components and advanced engineering that withstands extreme conditions and heavy usage. Built to last with innovative design principles and robust materials that guarantee maximum longevity and performance."
    );

    cy.get('[data-testid="add-feature-button"]').click();
    cy.get('[data-testid="product-feature-2"]').type(
      "Easy to use interface with intuitive controls and user-friendly design that makes operation simple and efficient. Designed with accessibility in mind, ensuring that users of all skill levels can operate the product effectively and safely."
    );

    // Fill Overview Details Section
    cy.contains("توضیحات محصول").click(); // Open overview details section

    // Wait for overview details to load (check if loading skeleton is gone)
    cy.get('[data-testid="overview-detail-select-1"]', { timeout: 10000 }).should("not.exist");
    cy.wait(10000); // Additional wait for data to load

    // Check if any overview details are available and select them
    cy.get("body").then(($body) => {
      // Check if there are any overview detail select buttons
      if ($body.find('[data-testid^="overview-detail-select-"]').length > 0) {
        // Select the first available overview detail
        cy.get('[data-testid^="overview-detail-select-"]').first().click();

        // Try to select a second one if available
        cy.get('[data-testid^="overview-detail-select-"]').then(($buttons) => {
          if ($buttons.length > 1) {
            cy.get('[data-testid^="overview-detail-select-"]').eq(1).click();
          }
        });
      } else {
        cy.log("No overview details available for selection");
      }
    });

    // Fill Product Blog Section
    cy.contains("توضیحات تکمیلی").click(); // Open product blog section

    // Wait for editor to load and add some content (productBlog: unlimited)
    cy.wait(2000);
    cy.get(".ProseMirror").type(
      "This is a comprehensive product blog content for testing purposes that includes detailed information about the product features, benefits, and usage instructions. The blog content covers all aspects of the product including its innovative design, advanced technology, and practical applications. This extensive documentation provides users with valuable insights into product capabilities, maintenance procedures, and optimization techniques. The content is structured to be both informative and engaging, ensuring that readers gain a thorough understanding of the product's value proposition and operational requirements."
    );

    // Fill Specs Section
    cy.contains("مشخصات محصول").click(); // Open specs section

    // Add specs (ProductSpecs - Name/Title: 1000 chars, Description: 4000 chars)
    cy.get('[data-testid="add-spec-button"]').click();
    cy.get('[data-testid="spec-title-0"]').type("Weight and Mass Distribution");
    cy.get('[data-testid="spec-description-0"]').type(
      "The product weighs exactly 500 grams with optimal mass distribution for enhanced stability and performance. The carefully engineered weight distribution ensures balanced handling and reduces user fatigue during extended use. This specification is critical for user comfort and operational efficiency, making it suitable for both professional and personal applications."
    );

    cy.get('[data-testid="add-spec-button"]').click();
    cy.get('[data-testid="spec-title-1"]').type("Dimensions and Physical Specifications");
    cy.get('[data-testid="spec-description-1"]').type(
      "Compact dimensions of 10 x 5 x 2 cm provide excellent portability while maintaining full functionality. The ergonomic design ensures comfortable handling and efficient storage. These precise measurements are optimized for maximum usability in various environments and applications, making the product versatile and user-friendly."
    );

    cy.get('[data-testid="add-spec-button"]').click();
    cy.get('[data-testid="spec-title-2"]').type("Material Composition and Quality");
    cy.get('[data-testid="spec-description-2"]').type(
      "Constructed from premium plastic materials that meet the highest industry standards for durability and safety. The advanced polymer composition provides exceptional strength, resistance to wear and tear, and long-term reliability. This material choice ensures the product maintains its integrity and performance throughout its extended lifespan."
    );

    // Fill FAQ Section
    cy.contains("سوالات متداول").click(); // Open FAQ section

    // Add FAQs (FAQs - Title: 1000 chars, Description: 3000 chars)
    cy.get('[data-testid="add-faq-button"]').click();
    cy.get('[data-testid="faq-question-0"]').type(
      "How do I properly use and maintain this product for optimal performance and longevity?"
    );
    cy.get('[data-testid="faq-answer-0"]').type(
      "This product is designed for maximum ease of use and requires minimal maintenance. Simply follow the comprehensive instructions provided in the detailed user manual that accompanies each purchase. The manual includes step-by-step setup procedures, operational guidelines, safety precautions, and troubleshooting tips. Regular cleaning and periodic inspections as outlined in the maintenance schedule will ensure optimal performance and extend the product's lifespan. For best results, store the product in a clean, dry environment and avoid exposure to extreme temperatures or humidity."
    );

    cy.get('[data-testid="add-faq-button"]').click();
    cy.get('[data-testid="faq-question-1"]').type(
      "What is the comprehensive warranty coverage and what does it include for this product?"
    );
    cy.get('[data-testid="faq-answer-1"]').type(
      "This product comes with an extensive 2-year warranty that covers all manufacturing defects, material flaws, and workmanship issues. The warranty includes free repair or replacement of defective parts, comprehensive technical support, and coverage for normal wear and tear under standard usage conditions. Additionally, the warranty covers shipping costs for warranty service and provides priority customer support. Extended warranty options are available for additional coverage beyond the standard 2-year period."
    );

    // Submit the form
    cy.get('[data-testid="create-product-button"]').click();

    // Wait for product creation to complete and verify it appears in the table
    cy.wait(35000); // Initial wait for the process to start

    // Wait for the modal to close and redirect to products page
    cy.url().should("include", "/admin/products");

    // Wait for the products table to load and check if our product appears at the top
    cy.get('[data-testid="products-table"]', { timeout: 60000 }).should("be.visible");

    // Check if the created product appears in the table (should be at the top)
    cy.get('[data-testid="products-table"]').within(() => {
      cy.get("tr").eq(1).should("contain", "Test Product for E2E");
    });

    // Alternative: Check for success message if it's still visible
    cy.get("body").then(($body) => {
      if ($body.find(".toast-success").length > 0) {
        cy.get(".toast-success").should("contain", "محصول با موفقیت ایجاد شد");
      }
    });
  });

  it("deletes the created product and verifies deletion", () => {
    cy.wait(5000);

    // Wait for the products table to be visible
    cy.get('[data-testid="products-table"]').should("be.visible");

    // Find the product we created and click its delete button
    cy.get('[data-testid="products-table"]').within(() => {
      // Look for the row containing our product name
      cy.contains("Test Product for E2E")
        .parent()
        .within(() => {
          // Click the delete button for this specific product
          cy.get('[data-testid="delete-product-button"]').click();
        });
    });

    // Wait for the delete confirmation modal to appear
    cy.get('[data-testid="delete-confirmation-modal"]', { timeout: 10000 }).should("be.visible");

    // Verify the modal contains the correct product name
    cy.get('[data-testid="delete-confirmation-modal"]').should("contain", "Test Product for E2E");

    // Click the confirm button to delete the product
    cy.get('[data-testid="delete-confirmation-modal"]').within(() => {
      cy.contains("تایید").click();
    });

    // Wait for the modal to close
    cy.get('[data-testid="delete-confirmation-modal"]', { timeout: 10000 }).should("not.exist");

    // Wait a moment for the deletion to process
    cy.wait(30000);

    // Verify the product has been removed from the table
    cy.get('[data-testid="products-table"]').within(() => {
      cy.get("body").should("not.contain", "Test Product for E2E");
    });

    // Alternative verification: Check that the first row doesn't contain our product
    cy.get('[data-testid="products-table"]').within(() => {
      cy.get("tr").eq(1).should("not.contain", "Test Product for E2E");
    });

    cy.log("Product successfully deleted and verified");
  });
});
