/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { bearerAuthHeader, apiVersionHeader } from "../core/httpHeaders";
import { cnaeValidateUrl } from "../constants/endpoints";
import { buildFromEnv } from "../utils/envObject";

function authHeaders(bearerToken) {
  return {
    ...bearerAuthHeader(bearerToken),
    ...apiVersionHeader(),
    "Content-Type": "application/json",
  };
}

function catalogFromEnv(overrides = {}) {
  const parseList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw === undefined || raw === null || String(raw) === "")
      return undefined;
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const catalog = {
    name: Cypress.env("cnaeCatalogName"),
    validCnpjs: parseList(Cypress.env("cnaeValidCnpjs")),
    invalidCnpjs: parseList(Cypress.env("cnaeInvalidCnpjs")),
    validCnaes: parseList(Cypress.env("cnaeValidCnaes")),
    ...overrides,
  };

  return buildFromEnv(catalog);
}

export const cnaeService = {
  validate({
    document,
    catalogDetails,
    catalogOverrides,
    bearerToken,
    bodyOverride,
  } = {}) {
    const url = cnaeValidateUrl();

    let body;
    if (bodyOverride !== undefined) {
      body = bodyOverride;
    } else {
      body = { document };
      const catalog = catalogDetails ?? catalogFromEnv(catalogOverrides);
      if (Object.keys(catalog).length > 0) {
        body.catalogDetails = catalog;
      }
    }

    return apiClient.request({
      method: "POST",
      url,
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "cnae:validate",
    });
  },
};
