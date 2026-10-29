/// <reference types="cypress" />
import { validationCommon as vc } from "./validationCommon";
import { createRulesAssertions } from "./rulesAssertionsFactory";

export const pixOutAssertions = {
  ...createRulesAssertions(),

  installmentOk(res) {
    vc._logIfMismatch(res, 200);
    vc.status(res, 200);
    const body = res.body || {};
    expect(body, "body.installmentDailylimit").to.have.property(
      "installmentDailylimit",
    );
    expect(body, "body.transactionLimit").to.have.property("transactionLimit");
    expect(body, "body.dailyPaymentPlan").to.have.property("dailyPaymentPlan");
  },

  installmentRejected(res, code) {
    vc.status(res, 400);
    vc.ruleEngineError(res, code);
  },
};
