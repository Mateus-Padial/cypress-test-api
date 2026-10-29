/// <reference types="cypress" />
import { commonAssertions } from "./common";
import { ERROR_CODES } from "../constants/errorCodes";

export const fileValidationAssertions = {
  status(res, expected) {
    commonAssertions.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    commonAssertions.statusOneOf(res, expectedList);
  },

  successFlag(res, expected) {
    commonAssertions.bodyFlag(res, "success", expected);
  },

  indicatesSuccess(res) {
    expect(res.body, "body").to.have.property("success", true);
    expect(
      res.body.data.validationDetails.isValid,
      "validationDetails.isValid",
    ).to.eq(true);
  },

  indicatesFailure(res) {
    const body = res.body;
    const httpFailure = res.status >= 400;
    const businessFailure =
      body &&
      (body.success === false ||
        body?.data?.validationDetails?.isValid === false);
    expect(
      httpFailure || businessFailure,
      `esperava falha, recebeu status ${res.status} e success=${body?.success}`,
    ).to.eq(true);
  },

  summaryTotals(res, expected) {
    const summary = res.body.data.summary;
    Object.entries(expected).forEach(([key, value]) => {
      expect(summary, `summary.${key}`).to.have.property(key);
      expect(String(summary[key]), `summary.${key}`).to.eq(String(value));
    });
  },

  totalValidLines(res, expected) {
    expect(res.body.data.summary.totalValidLines).to.eq(expected);
  },

  totalErrorLines(res, expected) {
    expect(res.body.data.summary.totalErrorLines).to.eq(expected);
  },

  totalErrorLinesGreaterThan(res, min) {
    expect(res.body.data.summary.totalErrorLines).to.be.greaterThan(min);
  },

  atLeastErrorLines(res, min) {
    expect(res.body.data.summary.totalErrorLines).to.be.at.least(min);
  },

  _flattenErrors(res) {
    const details = res.body?.data?.validationDetails;
    if (!details) return [];
    if (details.errorsByLine && typeof details.errorsByLine === "object") {
      return Object.values(details.errorsByLine).flat();
    }
    if (Array.isArray(details.errors)) return details.errors;
    return [];
  },

  hasErrorDetails(res) {
    const details = res.body?.data?.validationDetails;
    expect(details, "validationDetails").to.exist;
    expect(details.isValid, "validationDetails.isValid").to.eq(false);

    const erros = this._flattenErrors(res);
    expect(erros.length, "quantidade de erros estruturados").to.be.at.least(1);
    const primeiroErro = erros[0];
    expect(primeiroErro, "primeiro erro").to.have.property("message");
  },

  hasErrorCode(res, code) {
    const erros = this._flattenErrors(res);
    const temCode = erros.some((e) => "code" in e);
    if (!temCode) {
      cy.log(
        `[aviso] contrato sem 'code' (provavel HML): assercao de codigo "${code}" ignorada`,
      );
      return;
    }
    const todosOsCodigos = erros.map((e) => e.code);
    expect(
      todosOsCodigos,
      `codigos de erro recebidos: ${JSON.stringify(todosOsCodigos)}`,
    ).to.include(code);
  },

  hasInvalidHeaderError(res) {
    this.hasErrorCode(res, ERROR_CODES.INVALID_HEADER);
  },
};
