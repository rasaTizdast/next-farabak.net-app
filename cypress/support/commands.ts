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

Cypress.Commands.add("login", (role: "admin" | "user" = "admin") => {
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

  cy.intercept("POST", "/api/auth/login").as("loginRequest");
  cy.visit("/auth/login");
  cy.get('[data-testid="username-input"]')
    .focus()
    .type(username)
    .then(($input) => {
      if ($input.val() !== username) {
        return cy.get('[data-testid="username-input"]').clear().type(username);
      }
      return cy.wrap($input);
    })
    .should("have.value", username);
  cy.get('[data-testid="password-input"]')
    .focus()
    .type(password)
    .then(($input) => {
      if (String($input.val()).length !== password.length) {
        return cy.get('[data-testid="password-input"]').clear().type(password);
      }
      return cy.wrap($input);
    })
    .should(($input) => expect(String($input.val())).to.have.length(password.length));
  cy.get('[data-testid="submit-button"]').click();
  cy.wait("@loginRequest").then(({ request, response }) => {
    expect(request.body.username).to.equal(username);
    expect(request.body.password).to.have.length(password.length);
    expect(response?.statusCode, `login status for ${username}`).to.equal(200);
  });
  cy.url({ timeout: 60000 }).should("include", expectedRedirect);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: "admin" | "user"): Chainable;
      loginStubbed(): Chainable;
    }
  }
}

export {};
