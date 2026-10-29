/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { bearerAuthHeader } from "../core/httpHeaders";
import { userEmail } from "../utils/userEmail";
import {
  pixOutUrl,
  pixOutRulesUrl,
  pixOutInstallmentUrl,
  pixOutCampaignsUrl,
} from "../constants/endpoints";

function authHeaders(bearerToken) {
  return {
    ...bearerAuthHeader(bearerToken),
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function validateBodyFromEnv(overrides = {}) {
  const pixDocument =
    Cypress.env("validationPixDocument") || Cypress.env("validationDocument");
  const body = {
    clientId: Cypress.env("validationPixClientId"),
    campaignId: Cypress.env("validationCampaignId"),
    catalogId: Cypress.env("validationCatalogId"),
    projectId: Cypress.env("validationPixProjectId"),
    document: pixDocument,
    pixKey: Cypress.env("validationPixKey") || pixDocument,
    verifiedPixKey: Cypress.env("validationPixVerifiedKey") || pixDocument,
    keyType: Cypress.env("validationPixKeyType") || "CPF",
    amount: Cypress.env("validationPixAmount"),
    ...overrides,
  };
  if (body.amount !== undefined && body.amount !== null) {
    body.amount = Number(body.amount);
  }
  return body;
}

function createRulesBodyFromEnv(overrides = {}) {
  const body = {
    campaignName:
      Cypress.env("validationRulesCampaignName") || "Campanha teste",
    catalogName: Cypress.env("validationRulesCatalogName") || "Catalogo teste",
    minValue: 1,
    maxValue: 1000,
    quantityPerDay: 5,
    transactionLimit: 1000,
    installmentDailyLimit: 5000,
    monthLimit: 20000,
    allowDifferentAccount: true,
    userEmail: userEmail(),
    ...overrides,
  };
  return body;
}

function updateRulesBodyFromEnv(overrides = {}) {
  const body = {
    minValue: 2,
    maxValue: 2000,
    quantityPerDay: 6,
    transactionLimit: 2000,
    installmentDailyLimit: 6000,
    monthLimit: 21000,
    allowDifferentAccount: false,
    userEmail: userEmail(),
    ...overrides,
  };
  return body;
}

function deleteRulesBodyFromEnv(overrides = {}) {
  const body = {
    campaignId:
      Cypress.env("validationRulesCampaignId") ||
      Cypress.env("validationCampaignId"),
    catalogId:
      Cypress.env("validationRulesCatalogId") ||
      Cypress.env("validationCatalogId"),
    userEmail: userEmail(),
    ...overrides,
  };
  return body;
}

export const pixOutService = {
  validate({ bodyOverride, overrides, bearerToken } = {}) {
    const url = pixOutUrl();
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : validateBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url,
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:validate",
    });
  },

  getRules({ overrides, bearerToken } = {}) {
    const qs = {
      clientId: Cypress.env("validationPixClientId"),
      campaignId:
        Cypress.env("validationRulesCampaignId") ||
        Cypress.env("validationCampaignId"),
      catalogId:
        Cypress.env("validationRulesCatalogId") ||
        Cypress.env("validationCatalogId"),
      ...(overrides || {}),
    };
    return apiClient.request({
      method: "GET",
      url: pixOutRulesUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:rules",
    });
  },

  createRules({
    campaignId,
    catalogId,
    bodyOverride,
    overrides,
    bearerToken,
  } = {}) {
    const cId =
      campaignId ||
      Cypress.env("validationRulesCampaignId") ||
      Cypress.env("validationCampaignId");
    const catId =
      catalogId ||
      Cypress.env("validationRulesCatalogId") ||
      Cypress.env("validationCatalogId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : createRulesBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url: pixOutRulesUrl(cId, catId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:createRules",
    });
  },

  updateRules({
    campaignId,
    catalogId,
    bodyOverride,
    overrides,
    bearerToken,
  } = {}) {
    const cId =
      campaignId ||
      Cypress.env("validationRulesCampaignId") ||
      Cypress.env("validationCampaignId");
    const catId =
      catalogId ||
      Cypress.env("validationRulesCatalogId") ||
      Cypress.env("validationCatalogId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : updateRulesBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: pixOutRulesUrl(cId, catId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:updateRules",
    });
  },

  deleteRules({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : deleteRulesBodyFromEnv(overrides);
    return apiClient.request({
      method: "DELETE",
      url: pixOutRulesUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:deleteRules",
    });
  },

  getInstallment({ overrides, bearerToken } = {}) {
    const qs = {
      campaignId:
        Cypress.env("validationRulesCampaignId") ||
        Cypress.env("validationCampaignId"),
      catalogId:
        Cypress.env("validationRulesCatalogId") ||
        Cypress.env("validationCatalogId"),
      amount: Cypress.env("validationPixAmount"),
      ...(overrides || {}),
    };
    if (qs.amount !== undefined && qs.amount !== null) {
      qs.amount = Number(qs.amount);
    }
    return apiClient.request({
      method: "GET",
      url: pixOutInstallmentUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:installment",
    });
  },

  getCampaigns({ overrides, bearerToken } = {}) {
    const qs = {
      campaignId:
        Cypress.env("validationRulesCampaignId") ||
        Cypress.env("validationCampaignId"),
      catalogId:
        Cypress.env("validationRulesCatalogId") ||
        Cypress.env("validationCatalogId"),
      ...(overrides || {}),
    };
    return apiClient.request({
      method: "GET",
      url: pixOutCampaignsUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "pixOut:campaigns",
    });
  },
};
