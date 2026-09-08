/// <reference types="cypress" />

Cypress.Commands.add("loginStubbed", () => {
  // Stub the login API call instead of using real credentials
  cy.intercept("POST", "/api/auth/login", (req) => {
    req.reply(() => {
      return import("../fixtures/json/users.json");
    });
  }).as("stubLogin");

  // Visit login page and submit stubbed credentials
  cy.visit("/auth/login");
  cy.get('[data-testid="username-input"]').type("admin");
  cy.get('[data-testid="password-input"]').type("admin123");
  cy.get('[data-testid="submit-button"]').click();
  cy.url({ timeout: 60000 }).should("include", "/admin");
});

Cypress.Commands.add("login", (role = "admin") => {
  const baseUrl = "http://localhost:3000";
  const username =
    role === "admin"
      ? Cypress.env("adminUsername") || "FarabakAdmin"
      : Cypress.env("userUsername") || "rasarasa";
  const password =
    role === "admin"
      ? Cypress.env("adminPassword") || "F@rabak@dmin1007066"
      : Cypress.env("userPassword") || "rasa1234";
  const expectedRedirect = role === "admin" ? "/admin" : "/dashboard";

  cy.visit("/auth/login");
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-button"]').click();
  cy.url({ timeout: 60000 }).should("include", expectedRedirect);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: "admin" | "user"): Chainable<void>;
      loginStubbed(): Chainable<void>;
    }
  }
}
