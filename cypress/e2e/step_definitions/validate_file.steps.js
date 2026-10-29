/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { fileValidationService } from "../../support/services";
import { fileValidationAssertions as check } from "../../support/assertions/fileValidationAssertions";

const cenariosDir = () => Cypress.env("cenariosDir");

Given("o arquivo {string}", function (relativePath) {
  this.csvPath = `${cenariosDir()}/${relativePath}`;
});

Given(
  "os parametros ConversionRate {string} e LoginTypeId {string}",
  function (conversionRate, loginTypeId) {
    this.conversionRate = conversionRate;
    this.loginTypeId = loginTypeId;
  },
);

Given("o LoginTypeId {string}", function (loginTypeId) {
  this.loginTypeId = loginTypeId;
});

When("eu envio o arquivo para validacao", function () {
  fileValidationService
    .validate({
      csvPath: this.csvPath,
      conversionRate: this.conversionRate,
      loginTypeId: this.loginTypeId,
    })
    .then((response) => {
      this.response = response;
    });
});

Then("o status da resposta deve ser {int}", function (expectedStatus) {
  check.status(this.response, expectedStatus);
});

Then("o status da resposta deve ser {int} ou {int}", function (a, b) {
  check.statusOneOf(this.response, [a, b]);
});

Then("a validacao deve indicar sucesso", function () {
  check.indicatesSuccess(this.response);
});

Then("a validacao deve indicar falha", function () {
  check.indicatesFailure(this.response);
});

Then("o campo success deve ser {string}", function (expected) {
  check.successFlag(this.response, expected === "true");
});

Then("o resumo deve conter totalValidLines igual a {int}", function (expected) {
  check.totalValidLines(this.response, expected);
});

Then("o resumo deve conter totalErrorLines igual a {int}", function (expected) {
  check.totalErrorLines(this.response, expected);
});

Then("deve existir pelo menos {int} linha com erro", function (min) {
  check.atLeastErrorLines(this.response, min);
});

Then("o resumo deve refletir os totais:", function (dataTable) {
  check.summaryTotals(this.response, dataTable.rowsHash());
});

Then("a resposta deve conter detalhes de erro", function () {
  check.hasErrorDetails(this.response);
});

Then("deve conter um erro com codigo {string}", function (code) {
  check.hasErrorCode(this.response, code);
});

Then("o resumo deve conter totalErrorLines maior que {int}", function (min) {
  check.totalErrorLinesGreaterThan(this.response, min);
});
