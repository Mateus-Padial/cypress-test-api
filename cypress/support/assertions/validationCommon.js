/// <reference types="cypress" />
import { commonAssertions } from "./common";

export const validationCommon = {
  status(res, expected) {
    commonAssertions.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    commonAssertions.statusOneOf(res, expectedList);
  },

  _logIfMismatch(res, expected) {
    if (res.status !== expected) {
      cy.log(
        `Status inesperado (${res.status}, esperava ${expected}). Body: ${JSON.stringify(
          res.body,
        )}`,
      );
    }
  },

  validationOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    expect(res.body, "body.valid").to.have.property("valid");
    expect(res.body.valid, "body.valid").to.eq(true);
  },

  resultOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    expect(res.body, "body").to.have.property("isError");
    expect(res.body.isError, "body.isError").to.eq(false);
    expect(res.body, "body.value").to.have.property("value");
  },

  resultIsError(res) {
    expect(res.body, "body.isError").to.have.property("isError", true);
    const errors = (res.body && res.body.errors) || [];
    expect(errors.length, "quantidade de errors").to.be.at.least(1);
    expect(errors[0], "primeiro error").to.have.property("code");
  },

  ruleEngineError(res, code) {
    const body = res.body || {};
    expect(body, "body.status").to.have.property("status");
    expect(body, "body.errors").to.have.property("errors");
    expect(body.errors, "body.errors[]")
      .to.be.an("array")
      .with.length.at.least(1);
    const first = body.errors[0];
    expect(first, "errors[0].code").to.have.property("code");
    expect(first, "errors[0].description").to.have.property("description");
    expect(first, "errors[0].type").to.have.property("type");
    if (code !== undefined) {
      expect(first.code, "errors[0].code").to.eq(code);
    }
  },

  pagedOk(res, itemsKey) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    const body = res.body || {};
    expect(body, "body.summary").to.have.property("summary");
    const summary = body.summary;
    const total = summary.totalCount ?? summary.totalRecords;
    expect(total, "summary.total").to.be.a("number");
    expect(summary, "summary.pageNumber").to.have.property("pageNumber");
    expect(summary, "summary.pageSize").to.have.property("pageSize");
    expect(body, `body.${itemsKey}`).to.have.property(itemsKey);
    expect(body[itemsKey], `body.${itemsKey}[]`).to.be.an("array");
  },

  rulesOperationOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    expect(res.body, "body.success").to.have.property("success", true);
    expect(res.body, "body.message").to.have.property("message");
  },

  problemDetails(res) {
    const body = res.body || {};
    expect(body, "body.status").to.have.property("status");
    expect(body, "body.title ou detail").to.satisfy(
      (b) => b.title !== undefined || b.detail !== undefined,
    );
  },
};
