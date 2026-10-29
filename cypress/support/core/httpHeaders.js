/// <reference types="cypress" />

export function bearerAuthHeader(bearerToken) {
  return { Authorization: `Bearer ${bearerToken}` };
}

export const TENANT_ID_HEADER = "Tenant-Id";

export function bearerAuthHeaderIfPresent(bearerToken) {
  return bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {};
}

export function apiVersionHeader() {
  return { "api-version": Cypress.env("apiVersion") || "1.0" };
}
