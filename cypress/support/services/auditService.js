/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { bearerAuthHeader } from "../core/httpHeaders";
import { validationAuditLogsUrl } from "../constants/endpoints";
import { buildFromEnv } from "../utils/envObject";

function authHeaders(bearerToken) {
  return { ...bearerAuthHeader(bearerToken), Accept: "application/json" };
}

function auditFiltersFromEnv(overrides = {}) {
  const fromEnv = {
    CampaignId: Cypress.env("validationCampaignId"),
    CatalogId: Cypress.env("validationCatalogId"),
    UserEmail:
      Cypress.env("validationUserEmail") ||
      Cypress.env("userEmail") ||
      Cypress.env("requesterEmail"),
  };
  const merged = { ...fromEnv, ...overrides };
  const clean = buildFromEnv(merged);
  for (const k of Object.keys(clean)) {
    clean[k] = String(clean[k]);
  }
  return clean;
}

export const auditService = {
  logs({ filters, bearerToken } = {}) {
    const qs = auditFiltersFromEnv(filters);
    return apiClient.request({
      method: "GET",
      url: validationAuditLogsUrl(),
      qs,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      timeout: 60000,
      logName: "audit:logs",
    });
  },
};
