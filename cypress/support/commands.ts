/// <reference types="cypress" />

Cypress.Commands.add("login", (role: "admin" | "user" = "admin") => {
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

  cy.visit(`${baseUrl}/auth/login`);
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-button"]').click();
  cy.url({ timeout: 60000 }).should("include", expectedRedirect);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: "admin" | "user"): Chainable<void>;
    }
  }
}
