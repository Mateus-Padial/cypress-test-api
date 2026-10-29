/// <reference types="cypress" />
import { commonAssertions } from "./common";

export const orderCommon = {
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

  okObject(res, expected = 200) {
    this._logIfMismatch(res, expected);
    commonAssertions.status(res, expected);
    expect(res.body, "body (objeto)").to.be.an("object");
  },

  okList(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    const body = res.body;
    const list = Array.isArray(body)
      ? body
      : (body &&
          (body.items ||
            body.value ||
            body.data ||
            body.records ||
            body.results)) ||
        null;
    expect(
      list,
      "body com colecao (raiz ou items/value/data/records/results)",
    ).to.be.an("array");
    return list;
  },

  pagedOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    const body = res.body;
    if (Array.isArray(body)) {
      expect(body, "lista (array na raiz)").to.be.an("array");
      return;
    }
    expect(body, "body paginado (objeto)").to.be.an("object");
    expect(body, "body.total").to.have.property("total");
    expect(body.total, "body.total").to.be.a("number");
    expect(body, "body.items").to.have.property("items");
    expect(body.items, "body.items[]").to.be.an("array");
  },

  booleanOrOk(res, expected = [200, 201]) {
    const list = Array.isArray(expected) ? expected : [expected];
    this._logIfMismatch(res, list[0]);
    commonAssertions.statusOneOf(res, list);
    const body = res.body;
    const ok =
      typeof body === "boolean" ||
      (body &&
        typeof body === "object" &&
        (body.isError === false || body.value !== undefined));
    expect(
      ok,
      "envelope booleano de sucesso (bool | isError:false | value)",
    ).to.eq(true);
  },

  notFound(res) {
    commonAssertions.status(res, 400);
  },

  ruleEngineLeak500(res) {
    this._logIfMismatch(res, 500);
    commonAssertions.status(res, 500);
    const body = res.body || {};
    expect(body, "body.errors").to.have.property("errors");
    expect(body.errors, "body.errors[]")
      .to.be.an("array")
      .with.length.at.least(1);
    expect(
      body.errors[0].code,
      "codigo do erro (vazamento do servico interno)",
    ).to.eq("SF.FinancialService.Order.RuleEngine.Api");
  },

  resendFailedBatchOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    expect(res.body, "body (objeto)").to.be.an("object");
    expect(res.body, "body.status").to.have.property("status");
  },

  resendTransactionOk(res) {
    this._logIfMismatch(res, 200);
    commonAssertions.status(res, 200);
    expect(res.body, "body (objeto)").to.be.an("object");
    expect(res.body, "body.status").to.have.property("status");
  },

  listItems(res) {
    const body = res.body;
    if (Array.isArray(body)) return body;
    if (!body || typeof body !== "object") return [];
    return (
      body.items ||
      body.value ||
      body.data ||
      body.records ||
      body.results ||
      []
    );
  },
};
