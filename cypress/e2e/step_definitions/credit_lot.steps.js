/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, creditLotService } from "../../support/services";
import { creditLotAssertions as check } from "../../support/assertions/creditLotAssertions";

const cenariosDir = () => Cypress.env("cenariosDir");

Given("que possuo um token de autenticacao valido", function () {
  return authService.getBearerToken().then((token) => {
    this.bearerToken = token;
  });
});

When(
  "eu crio uma solicitacao de credito com o arquivo {string}",
  function (relativePath) {
    const csvPath = `${cenariosDir()}/${relativePath}`;
    return creditLotService
      .create({ csvPath, bearerToken: this.bearerToken })
      .then((response) => {
        this.response = response;
        this.creditLotId = check.extractLotId(response);
      });
  },
);

When("consulto o status da solicitacao", function () {
  return creditLotService
    .getById({ id: this.creditLotId, bearerToken: this.bearerToken })
    .then((response) => {
      this.statusResponse = response;
    });
});

const PROCESSING_STATES = [
  "processing",
  "processando",
  "pending",
  "aguardando",
  "queued",
  "created",
];

function isReadyForAction(status) {
  if (status === undefined || status === null || String(status) === "") {
    return false;
  }
  return !PROCESSING_STATES.includes(String(status).toLowerCase());
}

function waitForActionable(ctx, attemptsLeft) {
  return creditLotService
    .getById({ id: ctx.creditLotId, bearerToken: ctx.bearerToken })
    .then((response) => {
      ctx.statusResponse = response;
      const status = check.extractLotStatus(response);
      if (isReadyForAction(status) || attemptsLeft <= 0) {
        if (!isReadyForAction(status)) {
          cy.log(
            `[polling] esgotou tentativas; ultimo status="${status}". Prosseguindo.`,
          );
        }
        return cy.wrap(response, { log: false });
      }
      cy.log(
        `[polling] lote em "${status}", aguardando... (${attemptsLeft} restantes)`,
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000, { log: false });
      return waitForActionable(ctx, attemptsLeft - 1);
    });
}

When("aguardo o lote ficar pronto para acao", function () {
  return waitForActionable(this, 15);
});

When("eu aprovo o lote", function () {
  return creditLotService
    .approve({ id: this.creditLotId, bearerToken: this.bearerToken })
    .then((response) => {
      this.actionResponse = response;
    });
});

When("eu reprovo o lote", function () {
  return creditLotService
    .reprove({ id: this.creditLotId, bearerToken: this.bearerToken })
    .then((response) => {
      this.actionResponse = response;
    });
});

When("eu cancelo o lote", function () {
  return creditLotService
    .cancel({ id: this.creditLotId, bearerToken: this.bearerToken })
    .then((response) => {
      this.actionResponse = response;
    });
});

Then("a solicitacao deve ser criada com sucesso", function () {
  check.created(this.response);
});

Then("devo obter o id da solicitacao", function () {
  check.hasLotId(this.response);
  Cypress.env("creditLotId", this.creditLotId);
});

Then("o status do lote deve estar presente", function () {
  check.statusPresente(this.statusResponse);
});

Then("o status do lote deve ser {string}", function (esperado) {
  check.statusIs(this.statusResponse, esperado);
});

Then("a acao deve ser aceita", function () {
  check.actionSucceeded(this.actionResponse);
});

Then("a acao deve ser recusada", function () {
  check.actionRejected(this.actionResponse);
});

Then("a acao deve ser recusada com a mensagem {string}", function (message) {
  check.actionRejectedWithMessage(this.actionResponse, message);
});

Then("a criacao do lote deve ser recusada", function () {
  check.creationRejected(this.response);
});
