/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { ENDPOINTS, fullUrl } from "../constants/endpoints";

export const healthService = {
  liveness() {
    return apiClient.request({
      method: "GET",
      url: fullUrl(ENDPOINTS.HEALTH_LIVENESS),
      logName: "health:liveness",
    });
  },

  readiness() {
    return apiClient.request({
      method: "GET",
      url: fullUrl(ENDPOINTS.HEALTH_READINESS),
      logName: "health:readiness",
    });
  },
};
