/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { ENDPOINTS, fullUrl } from "../constants/endpoints";

export const fileValidationService = {
  validate({ csvPath, conversionRate, loginTypeId, token } = {}) {
    const projectRoot = Cypress.config("projectRoot");
    const rate = conversionRate ?? Cypress.env("conversionRate");
    const login = loginTypeId ?? Cypress.env("loginTypeId");
    const authToken = token ?? Cypress.env("authToken");

    if (!authToken) {
      throw new Error(
        "Token de autorizacao ausente. Defina 'authToken' em cypress.env.json " +
          "ou exporte CYPRESS_authToken antes de rodar os testes.",
      );
    }

    const fileName = csvPath.split("/").pop();
    const filePath = `${projectRoot}/${csvPath}`;
    const url = fullUrl(ENDPOINTS.FILE_VALIDATE);

    return apiClient.upload({
      url,
      filePath,
      token: authToken,
      logName: "fileValidation:validate",
      fields: {
        PointsConversionRate: String(rate),
        LoginTypeId: String(login),
      },
      requestFields: {
        File: fileName,
        PointsConversionRate: String(rate),
        LoginTypeId: String(login),
      },
    });
  },

  validateWithDefaults(csvPath) {
    return this.validate({ csvPath });
  },

  validateWithConversionRate(csvPath, conversionRate) {
    return this.validate({ csvPath, conversionRate });
  },
};
