/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { isTokenExpired, parseJwtPayload } from "../utils/jwt";
import {
  tokenUrl,
  cnaeTokenUrl,
  validationTokenUrl,
  orderTokenUrl,
  walletTokenUrl,
} from "../constants/endpoints";

function isUsableCachedToken(token) {
  if (!token) return false;
  const parsed = parseJwtPayload(token);
  return !parsed.hasJwtShape || (parsed.valid && !isTokenExpired(token));
}

export const authService = {
  getBearerToken({ force = false } = {}) {
    const cached = Cypress.env("bearerToken");
    if (cached && !force && isUsableCachedToken(cached)) {
      return cy.wrap(cached, { log: false });
    }

    const clientId = Cypress.env("tokenClientId");
    const clientSecret = Cypress.env("tokenClientSecret");
    if (!clientId || !clientSecret) {
      throw new Error(
        "Credenciais de token ausentes. Defina 'tokenClientId' e " +
          "'tokenClientSecret' em cypress.env.json.",
      );
    }

    return apiClient
      .request({
        method: "POST",
        url: tokenUrl(),
        form: true,
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        },
        logName: "auth:token",
      })
      .then((res) => {
        const accessToken = res.body && res.body.access_token;
        expect(accessToken, "access_token do ").to.be.a("string").and.not.be
          .empty;
        Cypress.env("bearerToken", accessToken);
        return accessToken;
      });
  },

  getServicoFinanceiroToken() {
    const token = Cypress.env("servicoFinanceiroToken");
    if (!token) {
      throw new Error(
        "servicoFinanceiroToken ausente. Defina em cypress.env.json.",
      );
    }
    return token;
  },

  getCnaeBearerToken({ force = false } = {}) {
    const cached = Cypress.env("cnaeBearerToken");
    if (cached && !force && isUsableCachedToken(cached)) {
      return cy.wrap(cached, { log: false });
    }

    const clientId = Cypress.env("cnaeTokenClientId");
    const clientSecret = Cypress.env("cnaeTokenClientSecret");
    if (!clientId || !clientSecret) {
      throw new Error(
        "Credenciais de token do CNAE ausentes. Defina 'cnaeTokenClientId' e " +
          "'cnaeTokenClientSecret' em .env / cypress.env.json.",
      );
    }

    const scopes = Cypress.env("cnaeTokenScopes") || "scopes.read scopes.write";

    return apiClient
      .request({
        method: "POST",
        url: cnaeTokenUrl(),
        form: true,
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          scopes,
          grant_type: "client_credentials",
        },
        logName: "auth:cnae-token",
      })
      .then((res) => {
        const accessToken = res.body && res.body.access_token;
        expect(accessToken, "access_token do  (CNAE)").to.be.a("string").and.not
          .be.empty;
        Cypress.env("cnaeBearerToken", accessToken);
        return accessToken;
      });
  },

  getValidationBearerToken({ force = false } = {}) {
    const cached = Cypress.env("validationBearerToken");
    if (cached && !force && isUsableCachedToken(cached)) {
      return cy.wrap(cached, { log: false });
    }

    const clientId = Cypress.env("validationTokenClientId");
    const clientSecret = Cypress.env("validationTokenClientSecret");

    if (!clientId || !clientSecret) {
      return this.getBearerToken({ force }).then((token) => {
        Cypress.env("validationBearerToken", token);
        return token;
      });
    }

    return apiClient
      .request({
        method: "POST",
        url: validationTokenUrl(),
        form: true,
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        },
        logName: "auth:validation-token",
      })
      .then((res) => {
        const accessToken = res.body && res.body.access_token;
        expect(accessToken, "access_token do  (Validation)").to.be.a("string")
          .and.not.be.empty;
        Cypress.env("validationBearerToken", accessToken);
        return accessToken;
      });
  },

  getOrderBearerToken({ force = false } = {}) {
    const cached = Cypress.env("orderBearerToken");
    if (cached && !force && isUsableCachedToken(cached)) {
      return cy.wrap(cached, { log: false });
    }

    const clientId = Cypress.env("orderTokenClientId");
    const clientSecret = Cypress.env("orderTokenClientSecret");

    if (clientId && clientSecret) {
      return apiClient
        .request({
          method: "POST",
          url: orderTokenUrl(),
          form: true,
          body: {
            client_id: clientId,
            client_secret: clientSecret,
            scopes:
              Cypress.env("orderTokenScopes") || "scopes.read scopes.write",
            grant_type: "client_credentials",
          },
          logName: "auth:order-token",
        })
        .then((res) => {
          const accessToken = res.body && res.body.access_token;
          expect(accessToken, "access_token do  (Order)").to.be.a("string").and
            .not.be.empty;
          Cypress.env("orderBearerToken", accessToken);
          return accessToken;
        });
    }

    if (
      Cypress.env("cnaeTokenClientId") &&
      Cypress.env("cnaeTokenClientSecret")
    ) {
      return this.getCnaeBearerToken({ force }).then((token) => {
        Cypress.env("orderBearerToken", token);
        return token;
      });
    }

    cy.log(
      "Order API: sem orderToken nem cnaeToken credentials - chamando sem token " +
        "(401 esperado). Defina orderTokenClientId/Secret ou as do CNAE.",
    );
    return cy.wrap(null, { log: false });
  },

  getWalletBearerToken({ force = false } = {}) {
    const cached = Cypress.env("walletBearerToken");
    if (cached && !force && isUsableCachedToken(cached)) {
      return cy.wrap(cached, { log: false });
    }

    const fixedToken = Cypress.env("walletAuthToken");
    if (fixedToken && isUsableCachedToken(fixedToken)) {
      Cypress.env("walletBearerToken", fixedToken);
      return cy.wrap(fixedToken, { log: false });
    }

    const clientId = Cypress.env("walletTokenClientId");
    const clientSecret = Cypress.env("walletTokenClientSecret");

    if (!clientId || !clientSecret) {
      return this.getBearerToken({ force }).then((token) => {
        Cypress.env("walletBearerToken", token);
        return token;
      });
    }

    return apiClient
      .request({
        method: "POST",
        url: walletTokenUrl(),
        form: true,
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          scopes:
            Cypress.env("walletTokenScopes") || "scopes.read scopes.write",
          grant_type: "client_credentials",
        },
        logName: "auth:wallet-token",
      })
      .then((res) => {
        const accessToken = res.body && res.body.access_token;
        expect(accessToken, "access_token do  (Wallet)").to.be.a("string").and
          .not.be.empty;
        Cypress.env("walletBearerToken", accessToken);
        return accessToken;
      });
  },
};
