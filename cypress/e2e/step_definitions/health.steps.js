/// <reference types="cypress" />
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { healthService } from "../../support/services";
import { commonAssertions } from "../../support/assertions/common";

When("consulto o liveness do servico", function () {
  return healthService.liveness().then((response) => {
    this.healthResponse = response;
  });
});

When("consulto o readiness do servico", function () {
  return healthService.readiness().then((response) => {
    this.healthResponse = response;
  });
});

Then("o servico deve responder saudavel", function () {
  commonAssertions.status(this.healthResponse, 200);
});
