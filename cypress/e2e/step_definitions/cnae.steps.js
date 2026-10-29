/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, cnaeService } from "../../support/services";
import { cnaeAssertions as check } from "../../support/assertions/cnaeAssertions";

Given("que possuo um token de autenticacao valido para o CNAE", function () {
  return authService.getCnaeBearerToken().then((token) => {
    this.bearerToken = token;
  });
});

function requireEnv(key) {
  const value = Cypress.env(key);
  if (value === undefined || value === null || String(value) === "") {
    throw new Error(
      `Variavel de ambiente "${key}" ausente. Defina em .env ` +
        `(ex.: ${key}=...) antes de rodar os testes de CNAE.`,
    );
  }
  return String(value);
}

Given("o documento {string}", function (document) {
  this.document = document;
});

Given("um documento valido do catalogo", function () {
  this.document = requireEnv("cnaeDocumentoValido");
});

When("eu envio o documento para validacao de CNAE", function () {
  return cnaeService
    .validate({
      document: this.document,
      catalogOverrides: this.catalogOverrides,
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("eu envio uma requisicao de CNAE com corpo vazio", function () {
  return cnaeService
    .validate({ bodyOverride: {}, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("eu envio uma requisicao de CNAE sem o documento", function () {
  return cnaeService
    .validate({
      bodyOverride: { catalogDetails: { name: "Catalogo sem documento" } },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

Then("o status da resposta de CNAE deve ser {int}", function (expectedStatus) {
  check.status(this.response, expectedStatus);
});

Then("o status da resposta de CNAE deve ser {int} ou {int}", function (a, b) {
  check.statusOneOf(this.response, [a, b]);
});

Then("a resposta de CNAE deve indicar sucesso", function () {
  check.ok(this.response);
});

Then("o CNAE deve ser considerado valido", function () {
  check.ok(this.response);
  check.isValid(this.response, true);
});

Then("o CNAE deve ser considerado invalido", function () {
  check.ok(this.response);
  check.isValid(this.response, false);
});

Then("a resposta deve ecoar o documento enviado", function () {
  check.echoesDocument(this.response, this.document);
});

Then("a resposta de CNAE deve indicar erro de negocio", function () {
  check.hasBusinessError(this.response);
});

Then("a requisicao de CNAE deve ser recusada", function () {
  check.rejected(this.response);
});
