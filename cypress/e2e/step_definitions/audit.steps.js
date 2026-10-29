/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, auditService } from "../../support/services";
import { auditAssertions as check } from "../../support/assertions/auditAssertions";

Given(
  "que possuo um token de autenticacao valido para o Audit da Validation API",
  function () {
    return authService.getValidationBearerToken().then((token) => {
      this.bearerToken = token;
    });
  },
);

Given("filtros de auditoria com CampaignId e CatalogId validos", function () {
  this.auditFilters = {};
});

Given(
  "o filtro de auditoria {string} com o valor {string}",
  function (filtro, valor) {
    this.auditFilters = { ...(this.auditFilters || {}), [filtro]: valor };
  },
);

When("consulto os logs de auditoria", function () {
  return auditService
    .logs({ filters: this.auditFilters, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("consulto os logs de auditoria sem filtros", function () {
  return auditService
    .logs({ filters: {}, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

Then("o status da resposta de audit deve ser {int}", function (expectedStatus) {
  check.status(this.response, expectedStatus);
});

Then("o status da resposta de audit deve ser {int} ou {int}", function (a, b) {
  check.statusOneOf(this.response, [a, b]);
});

Then("a resposta de audit deve indicar sucesso paginado", function () {
  check.ok(this.response);
});

Then("os logs de audit devem respeitar o contrato", function () {
  check.logsShape(this.response);
});
