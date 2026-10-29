/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, billPaymentService } from "../../support/services";
import { billPaymentAssertions as check } from "../../support/assertions/billPaymentAssertions";

const RULE_ENGINE_CODE = "SF.FinancialService.Validation.RuleEngine.Api";

Given(
  "que possuo um token de autenticacao valido para o BillPayment",
  function () {
    return authService.getValidationBearerToken().then((token) => {
      this.bearerToken = token;
    });
  },
);

When("envio um boleto para validacao no BillPayment", function () {
  return billPaymentService
    .validate({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When(
  "envio um boleto para validacao no BillPayment com paymentAmount {int}",
  function (paymentAmount) {
    return billPaymentService
      .validate({ overrides: { paymentAmount }, bearerToken: this.bearerToken })
      .then((response) => {
        this.response = response;
      });
  },
);

When("envio um boleto para validacao sem o campo barCode", function () {
  const body = Cypress.env("validationCampaignId")
    ? {
        campaignId: Cypress.env("validationCampaignId"),
        catalogId: Cypress.env("validationCatalogId"),
        document: Cypress.env("validationDocument"),
        paymentAmount: Number(Cypress.env("validationPaymentAmount") || 1),
      }
    : {};
  return billPaymentService
    .validate({ bodyOverride: body, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("envio um boleto para validacao sem o campo campaignId", function () {
  const body = {
    catalogId: Cypress.env("validationCatalogId"),
    document: Cypress.env("validationDocument"),
    barCode: Cypress.env("validationBarCode"),
    paymentAmount: Number(Cypress.env("validationPaymentAmount") || 1),
  };
  return billPaymentService
    .validate({ bodyOverride: body, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("envio um boleto para validacao com corpo vazio", function () {
  return billPaymentService
    .validate({ bodyOverride: {}, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as regras de BillPayment", function () {
  return billPaymentService
    .getRules({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as regras de BillPayment inexistentes", function () {
  const missing = Cypress.env("validationMissingId") || "";
  return billPaymentService
    .getRules({
      overrides: { campaignId: missing, catalogId: missing },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When(
  "crio regras de BillPayment para uma campanha e catalogo validos",
  function () {
    const campaignId = Cypress.env("validationCrudCampaignId");
    const catalogId = Cypress.env("validationCrudCatalogId");
    return billPaymentService
      .deleteRules({
        overrides: { campaignId, catalogId },
        bearerToken: this.bearerToken,
      })
      .then(() =>
        billPaymentService.createRules({
          campaignId,
          catalogId,
          bearerToken: this.bearerToken,
        }),
      )
      .then((response) => {
        this.response = response;
      });
  },
);

When(
  "crio regras de BillPayment para uma campanha e catalogo existente",
  function () {
    return billPaymentService
      .createRules({ bearerToken: this.bearerToken })
      .then((response) => {
        this.response = response;
      });
  },
);

When("atualizo as regras de BillPayment", function () {
  return billPaymentService
    .updateRules({
      campaignId: Cypress.env("validationCrudCampaignId"),
      catalogId: Cypress.env("validationCrudCatalogId"),
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When(
  "atualizo as regras de BillPayment para uma campanha e catalogo inexistente",
  function () {
    const missing = Cypress.env("validationMissingId") || "";
    return billPaymentService
      .updateRules({
        campaignId: missing,
        catalogId: missing,
        bearerToken: this.bearerToken,
      })
      .then((response) => {
        this.response = response;
      });
  },
);

When("deleto as regras de BillPayment", function () {
  return billPaymentService
    .deleteRules({
      overrides: {
        campaignId: Cypress.env("validationCrudCampaignId"),
        catalogId: Cypress.env("validationCrudCatalogId"),
      },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("deleto as regras de BillPayment sem o campo campaignId", function () {
  return billPaymentService
    .deleteRules({
      bodyOverride: {
        catalogId: Cypress.env("validationRulesCatalogId"),
        userEmail:
          Cypress.env("validationUserEmail") ||
          Cypress.env("userEmail") ||
          Cypress.env("requesterEmail"),
      },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("crio regras de BillPayment sem o campo userEmail", function () {
  return billPaymentService
    .createRules({
      overrides: { userEmail: undefined },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as campanhas de BillPayment", function () {
  return billPaymentService
    .getCampaigns({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

Then(
  "o status da resposta de BillPayment deve ser {int}",
  function (expectedStatus) {
    check.status(this.response, expectedStatus);
  },
);

Then(
  "o status da resposta de BillPayment deve ser {int} ou {int}",
  function (a, b) {
    check.statusOneOf(this.response, [a, b]);
  },
);

Then("a validacao de boleto deve indicar sucesso", function () {
  check.validateOk(this.response);
});

Then("a validacao deve indicar erro do Rule Engine", function () {
  check.validateRejected(this.response, RULE_ENGINE_CODE);
});

Then(
  "se falhar, a validacao de boleto deve indicar erro do Rule Engine",
  function () {
    if (this.response && this.response.status === 400) {
      check.validateRejected(this.response, RULE_ENGINE_CODE);
    }
  },
);

Then("as regras de boleto devem respeitar o contrato", function () {
  check.rulesOk(this.response);
});

Then("a operacao de regras deve indicar sucesso", function () {
  check.rulesOperationOk(this.response);
});

Then("as campanhas devem respeitar o contrato paginado", function () {
  check.campaignsOk(this.response);
  check.campaignsShape(this.response);
});
