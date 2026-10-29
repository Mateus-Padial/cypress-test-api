/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { bearerAuthHeader } from "../core/httpHeaders";
import { userEmail } from "../utils/userEmail";
import {
  billPaymentUrl,
  billPaymentRulesUrl,
  billPaymentCampaignsUrl,
} from "../constants/endpoints";

function authHeaders(bearerToken) {
  return {
    ...bearerAuthHeader(bearerToken),
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function validateBodyFromEnv(overrides = {}) {
  const body = {
    campaignId: Cypress.env("validationCampaignId"),
    catalogId: Cypress.env("validationCatalogId"),
    document: Cypress.env("validationDocument"),
    barCode: Cypress.env("validationBarCode"),
    paymentAmount: Cypress.env("validationPaymentAmount"),
    ...overrides,
  };
  if (body.paymentAmount !== undefined && body.paymentAmount !== null) {
    body.paymentAmount = Number(body.paymentAmount);
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
    daysBeforeDue: 3,
    acceptedBoletoTypes: [0],
    allowPhysicalPersonBoleto: true,
    validCnpjs: [],
    invalidCnpjs: [],
    validCnaes: [],
    invalidCnaes: [],
    allowSameReceiver: true,
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
    daysBeforeDue: 5,
    acceptedBoletoTypes: [0],
    allowPhysicalPersonBoleto: false,
    validCnpjs: [],
    invalidCnpjs: [],
    validCnaes: [],
    invalidCnaes: [],
    allowSameReceiver: false,
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

export const billPaymentService = {
  validate({ bodyOverride, overrides, bearerToken } = {}) {
    const url = billPaymentUrl();
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
      timeout: 60000,
      logName: "billPayment:validate",
    });
  },

  getRules({ overrides, bearerToken } = {}) {
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
      url: billPaymentRulesUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "billPayment:rules",
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
      url: billPaymentRulesUrl(cId, catId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "billPayment:createRules",
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
      url: billPaymentRulesUrl(cId, catId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "billPayment:updateRules",
    });
  },

  deleteRules({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : deleteRulesBodyFromEnv(overrides);
    return apiClient.request({
      method: "DELETE",
      url: billPaymentRulesUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "billPayment:deleteRules",
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
      url: billPaymentCampaignsUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "billPayment:campaigns",
    });
  },
};
