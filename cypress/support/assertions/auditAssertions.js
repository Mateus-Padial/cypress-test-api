/// <reference types="cypress" />
import { validationCommon as vc } from "./validationCommon";

export const auditAssertions = {
  status(res, expected) {
    vc.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    vc.statusOneOf(res, expectedList);
  },

  ok(res) {
    vc.pagedOk(res, "logs");
  },

  logsShape(res) {
    const logs = (res.body && res.body.logs) || [];
    if (logs.length === 0) {
      return;
    }
    const sample = logs[0];
    expect(sample, "logs[0]").to.include.keys([
      "id",
      "operationType",
      "entityType",
      "userEmail",
      "campaignId",
      "catalogId",
      "timestamp",
      "success",
    ]);
  },
};
