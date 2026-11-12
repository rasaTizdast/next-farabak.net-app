/// <reference types="cypress" />

export function stubAllApiRoutes() {
  // Product API Stubs
  cy.intercept("GET", "/api/admin/products", (req) => {
    req.reply(() => {
      return import("../fixtures/json/products.json");
    });
  }).as("getProducts");

  cy.intercept("POST", "/api/admin/products", (req) => {
    req.reply(() => {
      return import("../fixtures/json/products.json");
    });
  }).as("createProduct");

  cy.intercept("DELETE", "/api/admin/products/*", (req) => {
    req.reply(() => {
      return import("../fixtures/json/products.json");
    });
  }).as("deleteProduct");

  // Branch API Stubs
  cy.intercept("GET", "/api/admin/branches", (req) => {
    req.reply(() => {
      return import("../fixtures/json/branches.json");
    });
  }).as("getBranches");

  cy.intercept("POST", "/api/admin/branches", (req) => {
    req.reply(() => {
      return import("../fixtures/json/branches.json");
    });
  }).as("createBranch");

  cy.intercept("DELETE", "/api/admin/branches/*", (req) => {
    req.reply(() => {
      return import("../fixtures/json/branches.json");
    });
  }).as("deleteBranch");

  // Warehouse API Stubs
  cy.intercept("GET", "/api/admin/warehouses", (req) => {
    req.reply(() => {
      return import("../fixtures/json/warehouses.json");
    });
  }).as("getWarehouses");

  cy.intercept("POST", "/api/admin/warehouses", (req) => {
    req.reply(() => {
      return import("../fixtures/json/warehouses.json");
    });
  }).as("createWarehouse");

  cy.intercept("DELETE", "/api/admin/warehouses/*", (req) => {
    req.reply(() => {
      return import("../fixtures/json/warehouses.json");
    });
  }).as("deleteWarehouse");

  // Invoice API Stubs
  cy.intercept("GET", "/api/admin/invoices", (req) => {
    req.reply(() => {
      return import("../fixtures/json/invoices.json");
    });
  }).as("getInvoices");

  cy.intercept("PATCH", "/api/admin/invoices/*", (req) => {
    req.reply(() => {
      return import("../fixtures/json/invoices.json");
    });
  }).as("updateInvoice");

  cy.intercept("DELETE", "/api/admin/invoices/*", (req) => {
    req.reply(() => {
      return import("../fixtures/json/invoices.json");
    });
  }).as("deleteInvoice");

  // S3 Delete Stub
  cy.intercept("POST", "/api/s3/delete", (req) => {
    req.reply(() => {
      return import("../fixtures/json/s3-delete-response.json");
    });
  }).as("s3Delete");

  // Exchange Rate Stub
  cy.intercept("GET", "/api/exchangeRate", (req) => {
    req.reply(() => {
      return import("../fixtures/json/exchange-rate.json");
    });
  }).as("getExchangeRate");
}
