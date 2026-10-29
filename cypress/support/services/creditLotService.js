/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { authService } from "./authService";
import { bearerAuthHeader, apiVersionHeader } from "../core/httpHeaders";
import { ENDPOINTS, fullUrl } from "../constants/endpoints";
import { buildFromEnv } from "../utils/envObject";

function actionUser({ userName, userEmail } = {}) {
  return {
    userName:
      userName ?? Cypress.env("userName") ?? Cypress.env("requesterName"),
    userEmail:
      userEmail ?? Cypress.env("userEmail") ?? Cypress.env("requesterEmail"),
  };
}

function authHeaders(bearerToken, servicoToken) {
  return {
    ...bearerAuthHeader(bearerToken),
    "authorization-vertem-servico-financeiro": servicoToken,
    "authorization-vertem-marketplace":
      Cypress.env("marketplaceToken") || servicoToken,
    ...apiVersionHeader(),
  };
}

function lotFieldsFromEnv(overrides = {}) {
  const fields = {
    RequesterId: Cypress.env("requesterId"),
    RequesterName: Cypress.env("requesterName"),
    RequesterEmail: Cypress.env("requesterEmail"),
    ClientId: Cypress.env("clientId"),
    ClientName: Cypress.env("clientName"),
    CampaignId: Cypress.env("campaignId"),
    CampaignName: Cypress.env("campaignName"),
    CatalogId: Cypress.env("catalogId"),
    CatalogDescription: Cypress.env("catalogDescription"),
    ConversionRate: Cypress.env("conversionRate"),
    OriginId: Cypress.env("originId"),
    OriginDescription: Cypress.env("originDescription"),
    InvoiceNumber: Cypress.env("invoiceNumber"),
    InvoiceDate: Cypress.env("invoiceDate"),
    Description: Cypress.env("lotDescription"),
    CodTotvs: Cypress.env("codTotvs"),
    LoginTypeId: Cypress.env("loginTypeId"),
    ...overrides,
  };
  const clean = buildFromEnv(fields);
  for (const k of Object.keys(clean)) {
    clean[k] = String(clean[k]);
  }
  return clean;
}

export const creditLotService = {
  create({ csvPath, fields = {}, bearerToken, servicoToken } = {}) {
    const projectRoot = Cypress.config("projectRoot");
    const servico = servicoToken || authService.getServicoFinanceiroToken();
    const filePath = `${projectRoot}/${csvPath}`;
    const url = fullUrl(ENDPOINTS.CREDIT_LOT_CREATE);
    const lotFields = lotFieldsFromEnv(fields);

    return apiClient.upload({
      url,
      filePath,
      fileFieldName: "CsvFile",
      token: bearerToken,
      headers: authHeaders(bearerToken, servico),
      logName: "creditLot:create",
      fields: lotFields,
      requestFields: { CsvFile: csvPath.split("/").pop(), ...lotFields },
    });
  },

  getById({ id, bearerToken, servicoToken } = {}) {
    const servico = servicoToken || authService.getServicoFinanceiroToken();
    const url = fullUrl(ENDPOINTS.CREDIT_LOT_BY_ID(id));

    return apiClient.request({
      method: "GET",
      url,
      headers: authHeaders(bearerToken, servico),
      token: bearerToken,
      logName: "creditLot:getById",
    });
  },

  action({
    id,
    action,
    bearerToken,
    servicoToken,
    userName,
    userEmail,
    reason,
  } = {}) {
    const servico = servicoToken || authService.getServicoFinanceiroToken();
    const url = fullUrl(ENDPOINTS.CREDIT_LOT_ACTION(id, action));
    const body = { ...actionUser({ userName, userEmail }) };
    if (action !== "approve") {
      body.reason = reason ?? Cypress.env("reason") ?? "Teste automatizado";
    }

    return apiClient.request({
      method: "POST",
      url,
      body,
      headers: {
        ...authHeaders(bearerToken, servico),
        "Content-Type": "application/json",
      },
      token: bearerToken,
      logName: `creditLot:${action}`,
    });
  },

  approve(p) {
    return this.action({ ...p, action: "approve" });
  },

  reprove(p) {
    return this.action({ ...p, action: "reprove" });
  },

  cancel(p) {
    return this.action({ ...p, action: "cancel" });
  },
};
