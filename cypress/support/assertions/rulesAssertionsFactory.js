/// <reference types="cypress" />
import { validationCommon as vc } from "./validationCommon";

export function createRulesAssertions() {
  return {
    status(res, expected) {
      vc.status(res, expected);
    },

    statusOneOf(res, expectedList) {
      vc.statusOneOf(res, expectedList);
    },

    validateOk(res) {
      vc.validationOk(res);
    },

    validateRejected(res, code) {
      vc.status(res, 400);
      vc.ruleEngineError(res, code);
    },

    rulesOk(res) {
      vc._logIfMismatch(res, 200);
      vc.status(res, 200);
      const body = res.body || {};
      expect(body, "body.minValue").to.have.property("minValue");
      expect(body, "body.maxValue").to.have.property("maxValue");
      expect(body, "body.quantityPerDay").to.have.property("quantityPerDay");
    },

    rulesRejected(res, code) {
      vc.status(res, 400);
      vc.ruleEngineError(res, code);
    },

    rulesOperationOk(res) {
      vc.rulesOperationOk(res);
    },

    rulesConflict(res) {
      vc.status(res, 409);
      vc.problemDetails(res);
    },

    rulesNotFound(res) {
      vc.status(res, 404);
      vc.problemDetails(res);
    },

    rejected(res) {
      vc.status(res, 400);
    },

    campaignsOk(res) {
      vc.pagedOk(res, "campaigns");
    },

    campaignsShape(res) {
      const items = (res.body && res.body.campaigns) || [];
      if (items.length === 0) return;
      expect(items[0], "campaigns[0]").to.include.keys([
        "campaignId",
        "campaignName",
        "catalogId",
        "catalogName",
      ]);
    },
  };
}
