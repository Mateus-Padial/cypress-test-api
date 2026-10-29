/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, pixOutService } from "../../support/services";
import { pixOutAssertions as check } from "../../support/assertions/pixOutAssertions";

const RULE_ENGINE_CODE = "SF.FinancialService.Validation.RuleEngine.Api";
const RULES_ENGINE_CODE = "SF.FinancialService.Validation.RuleEngine.PixOut";

Given("que possuo um token de autenticacao valido para o PixOut", function () {
  return authService.getValidationBearerToken().then((token) => {
    this.bearerToken = token;
  });
});

When("envio um PixOut para validacao", function () {
  return pixOutService
    .validate({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("envio um PixOut de valor {int} para validacao", function (amount) {
  return pixOutService
    .validate({
      overrides: { amount },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("envio um PixOut para validacao sem o campo pixKey", function () {
  const body = {
    clientId: Cypress.env("validationPixClientId"),
    campaignId: Cypress.env("validationCampaignId"),
    catalogId: Cypress.env("validationCatalogId"),
    projectId: Cypress.env("validationPixProjectId"),
    document: Cypress.env("validationDocument"),
    keyType: Cypress.env("validationPixKeyType") || "CPF",
    amount: Number(Cypress.env("validationPixAmount") || 1),
  };
  return pixOutService
    .validate({ bodyOverride: body, bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("envio um PixOut para validacao com keyType invalido", function () {
  return pixOutService
    .validate({
      overrides: { keyType: "TIPO_INEXISTENTE" },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("envio um PixOut para validacao com projectId nao-UUID", function () {
  return pixOutService
    .validate({
      overrides: { projectId: "nao-e-uuid" },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as regras de PixOut", function () {
  return pixOutService
    .getRules({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as regras de PixOut inexistentes", function () {
  const missing = Cypress.env("validationMissingId") || "";
  return pixOutService
    .getRules({
      overrides: { campaignId: missing, catalogId: missing },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("consulto o parcelamento de PixOut", function () {
  return pixOutService
    .getInstallment({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

When("consulto o parcelamento de PixOut inexistente", function () {
  const missing = Cypress.env("validationMissingId") || "";
  return pixOutService
    .getInstallment({
      overrides: { campaignId: missing, catalogId: missing },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("crio regras de PixOut para uma campanha e catalogo validos", function () {
  const campaignId = Cypress.env("validationCrudCampaignId");
  const catalogId = Cypress.env("validationCrudCatalogId");
  return pixOutService
    .deleteRules({
      overrides: { campaignId, catalogId },
      bearerToken: this.bearerToken,
    })
    .then(() =>
      pixOutService.createRules({
        campaignId,
        catalogId,
        bearerToken: this.bearerToken,
      }),
    )
    .then((response) => {
      this.response = response;
    });
});

When(
  "crio regras de PixOut para uma campanha e catalogo existente",
  function () {
    const campaignId = Cypress.env("validationCrudCampaignId");
    const catalogId = Cypress.env("validationCrudCatalogId");
    return pixOutService
      .deleteRules({
        overrides: { campaignId, catalogId },
        bearerToken: this.bearerToken,
      })
      .then(() =>
        pixOutService.createRules({
          campaignId,
          catalogId,
          bearerToken: this.bearerToken,
        }),
      )
      .then(() =>
        pixOutService.createRules({
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

When("atualizo as regras de PixOut", function () {
  return pixOutService
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
  "atualizo as regras de PixOut para uma campanha e catalogo inexistente",
  function () {
    const missing = Cypress.env("validationMissingId") || "";
    return pixOutService
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

When("deleto as regras de PixOut", function () {
  return pixOutService
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

When("deleto as regras de PixOut sem o campo campaignId", function () {
  return pixOutService
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

When("crio regras de PixOut sem o campo userEmail", function () {
  return pixOutService
    .createRules({
      overrides: { userEmail: undefined },
      bearerToken: this.bearerToken,
    })
    .then((response) => {
      this.response = response;
    });
});

When("consulto as campanhas de PixOut", function () {
  return pixOutService
    .getCampaigns({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
    });
});

Then(
  "o status da resposta de PixOut deve ser {int}",
  function (expectedStatus) {
    check.status(this.response, expectedStatus);
  },
);

Then("o status da resposta de PixOut deve ser {int} ou {int}", function (a, b) {
  check.statusOneOf(this.response, [a, b]);
});

Then("a validacao de PixOut deve indicar sucesso", function () {
  check.validateOk(this.response);
});

Then("a validacao de PixOut deve indicar erro do Rule Engine", function () {
  check.validateRejected(this.response, RULE_ENGINE_CODE);
});

Then(
  "a validacao de PixOut deve indicar erro do Rule Engine de regras",
  function () {
    check.validateRejected(this.response, RULES_ENGINE_CODE);
  },
);

Then(
  "a validacao de PixOut deve indicar erro do Rule Engine ou contrato",
  function () {
    check.statusOneOf(this.response, [400, 200]);
    const body = (this.response && this.response.body) || {};
    const looksLikeRuleEngine =
      body.status !== undefined && Array.isArray(body.errors);
    if (looksLikeRuleEngine) {
      check.validateRejected(this.response, RULE_ENGINE_CODE);
    }
  },
);

Then("as regras de PixOut devem indicar sucesso", function () {
  check.rulesOk(this.response);
});

Then("o parcelamento de PixOut deve respeitar o contrato", function () {
  check.installmentOk(this.response);
});

Then("a operacao de regras de PixOut deve indicar sucesso", function () {
  check.rulesOperationOk(this.response);
});

Then("as campanhas de PixOut devem respeitar o contrato paginado", function () {
  check.campaignsOk(this.response);
  check.campaignsShape(this.response);
});
