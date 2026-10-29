/// <reference types="cypress" />
import { orderCommon as oc } from "./orderCommon";

export const orderAssertions = {
  status(res, expected) {
    oc.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    oc.statusOneOf(res, expectedList);
  },

  pagedOk(res) {
    oc.pagedOk(res);
  },

  listOk(res) {
    oc.okList(res);
  },

  detailOk(res) {
    oc.okObject(res, 200);
  },

  booleanOrOk(res) {
    oc.booleanOrOk(res, [200, 201]);
  },

  createdOk(res) {
    oc.statusOneOf(res, [200, 201]);
  },

  notFound(res) {
    oc.notFound(res);
  },

  ruleEngineLeak500(res) {
    oc.ruleEngineLeak500(res);
  },

  rejected(res) {
    oc.status(res, 400);
  },

  validationError(res, expectedCodes) {
    oc.status(res, 400);
    const body = res.body || {};
    expect(body, "body.errors").to.have.property("errors");
    expect(body.errors, "body.errors[]")
      .to.be.an("array")
      .with.length.at.least(1);
    const codes = body.errors.map((e) => e.code);
    if (expectedCodes) {
      expect(codes, "codigos de erro de validacao").to.include.members(
        expectedCodes,
      );
    }
  },

  extractBatchId(res) {
    const body = (res && res.body) || {};
    return (
      body.id ||
      body.batchId ||
      (body.value && (body.value.id || body.value.batchId))
    );
  },

  extractBatchStatus(res) {
    const body = (res && res.body) || {};
    return body.status || (body.value && body.value.status);
  },

  extractSupplierId(res) {
    const body = (res && res.body) || {};
    const s = body.supplier || {};
    return s.id || s.supplierId || body.supplierId;
  },

  extractProcessing(res) {
    const body = (res && res.body) || {};
    return body.transactionProcessing;
  },

  batchCreated(res) {
    oc.statusOneOf(res, [200, 201]);
    const id = this.extractBatchId(res);
    expect(id, "id do lote criado").to.be.a("string").and.not.be.empty;
  },

  groupCreated(res) {
    oc.statusOneOf(res, [200, 201]);
    oc.booleanOrOk(res, [200, 201]);
  },

  groupActionOk(res) {
    oc.statusOneOf(res, [200, 201]);
  },

  batchActionOk(res) {
    oc.status(res, 200);
  },

  batchStatusIs(res, expected) {
    const status = this.extractBatchStatus(res);
    expect(status, "status do lote").to.eq(expected);
  },

  resendFailedBatchOk(res) {
    oc.resendFailedBatchOk(res);
  },

  extractResentTransactionIds(res) {
    const body = (res && res.body) || {};
    return body.resentTransactionIds || [];
  },

  resendTransactionOk(res) {
    oc.resendTransactionOk(res);
  },

  extractTransactionStatus(res) {
    const body = (res && res.body) || {};
    return body.status || (body.value && body.value.status);
  },

  transactionStatusIs(res, expected) {
    const status = this.extractTransactionStatus(res);
    expect(status, "status da transacao").to.eq(expected);
  },

  transactionStatusOneOf(res, expectedList) {
    const status = this.extractTransactionStatus(res);
    expect(
      status,
      `status da transacao (esperados ${expectedList.join(", ")})`,
    ).to.be.oneOf(expectedList);
  },

  extractGroupList(res) {
    return oc.listItems(res);
  },

  extractGroupIdByName(res, name) {
    const items = this.extractGroupList(res) || [];
    const found = items.find((g) => g && g.name === name) || items[0];
    return found && (found.groupId || found.id);
  },

  extractGroupStatus(res) {
    const body = (res && res.body) || {};
    return body.status || (body.value && body.value.status);
  },

  groupStatusIs(res, expected) {
    expect(this.extractGroupStatus(res), "status do grupo").to.eq(expected);
  },

  groupStatusOneOf(res, expectedList) {
    expect(
      this.extractGroupStatus(res),
      `status do grupo (esperados ${expectedList.join(", ")})`,
    ).to.be.oneOf(expectedList);
  },
};
