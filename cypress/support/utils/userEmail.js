/// <reference types="cypress" />

export function userEmail(override) {
  return (
    override ||
    Cypress.env("validationUserEmail") ||
    Cypress.env("userEmail") ||
    Cypress.env("requesterEmail")
  );
}
