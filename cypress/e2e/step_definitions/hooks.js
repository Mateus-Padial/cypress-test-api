/// <reference types="cypress" />
import { After, Before } from "@badeball/cypress-cucumber-preprocessor";

Before({ tags: "@requer-condicao-ambiente" }, function () {
  const enabled = Cypress.env("runEnvironmentDependentScenarios");
  if (enabled === true || enabled === "true") return;
  this.skip();
});

After(function (world) {
  const title =
    (world && world.pickle && world.pickle.name) ||
    (this.currentTest && this.currentTest.title) ||
    "cenario";
  const safe = title
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .slice(0, 120);
  cy.screenshot(`evidencia/${safe}`, { capture: "viewport", log: false });
});
