/// <reference types="cypress" />

Cypress.Commands.add("loginStubbed", () => {
  cy.intercept("POST", "/api/auth/login", (req) => {
    req.reply({
      fixture: "json/users.json",
    });
  }).as("stubLogin");

  cy.visit("/auth/login");
  cy.get('[data-testid="username-input"]').type("admin");
  cy.get('[data-testid="password-input"]').type("admin123");
  cy.get('[data-testid="submit-button"]').click();
  cy.url({ timeout: 60000 }).should("include", "/admin");
});

Cypress.Commands.add("login", (role = "admin") => {
  const username =
    role === "admin"
      ? Cypress.env("adminUsername") || "FarabakAdmin"
      : Cypress.env("userUsername") || "rasarasa";
  const password = role === "admin" ? Cypress.env("adminPassword") : Cypress.env("userPassword");
  const expectedRedirect = role === "admin" ? "/admin" : "/dashboard";

  if (!password) {
    throw new Error(
      `Missing Cypress env var for ${role} password. Set CYPRESS_${role.toUpperCase()}_PASSWORD.`
    );
  }

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
