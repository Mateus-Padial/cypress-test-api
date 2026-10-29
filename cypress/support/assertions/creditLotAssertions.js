/// <reference types="cypress" />
import { commonAssertions } from "./common";

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const creditLotAssertions = {
  status(res, expected) {
    commonAssertions.status(res, expected);
  },

  created(res) {
    if (res.status !== 201) {
      cy.log(
        `Criacao falhou (status ${res.status}). Body: ${JSON.stringify(
          res.body,
        )}`,
      );
    }
    commonAssertions.status(res, 201);
    expect(res.body, "body").to.have.property("id");
    expect(String(res.body.id), "body.id (GUID)").to.match(GUID_RE);
  },

  hasLotId(res) {
    expect(res.body, "body").to.have.property("id");
    expect(String(res.body.id), "body.id (GUID)").to.match(GUID_RE);
  },

  extractLotId(res) {
    return res.body && res.body.id;
  },

  statusPresente(res) {
    commonAssertions.status(res, 200);
    const body = res.body || {};
    const value =
      body.lotStatus ??
      body.status ??
      body?.data?.lotStatus ??
      body?.data?.status;
    expect(
      value,
      `status do lote presente (lotStatus/status). body=${JSON.stringify(body)}`,
    ).to.not.be.undefined;
  },

  statusIs(res, expected) {
    const body = res.body || {};
    const value =
      body.lotStatus ??
      body.status ??
      body?.data?.lotStatus ??
      body?.data?.status;
    expect(String(value), "status do lote").to.eq(String(expected));
  },

  extractLotStatus(res) {
    const body = (res && res.body) || {};
    return (
      body.lotStatus ??
      body.status ??
      body?.data?.lotStatus ??
      body?.data?.status
    );
  },

  actionSucceeded(res) {
    if (res.status !== 200) {
      cy.log(
        `Acao falhou (status ${res.status}). Body: ${JSON.stringify(res.body)}`,
      );
    }
    commonAssertions.status(res, 200);
  },

  actionRejected(res) {
    commonAssertions.status(res, 400);
  },

  actionRejectedWithMessage(res, expectedMessage) {
    commonAssertions.status(res, 400);
    const errors = res.body?.errors || [];
    expect(
      errors.map((error) => error.errorMessage),
      "mensagens de erro da acao",
    ).to.include(expectedMessage);
  },

  creationRejected(res) {
    commonAssertions.status(res, 400);
  },
};
