/// <reference types="cypress" />
import { commonAssertions } from "./common";

export const cnaeAssertions = {
  status(res, expected) {
    commonAssertions.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    commonAssertions.statusOneOf(res, expectedList);
  },

  ok(res) {
    if (res.status !== 200) {
      cy.log(
        `Validacao CNAE falhou (status ${res.status}). Body: ${JSON.stringify(
          res.body,
        )}`,
      );
    }
    commonAssertions.status(res, 200);
    expect(res.body, "body").to.not.be.null;
    expect(res.body, "body.valid").to.have.property("valid");
  },

  isValid(res, expected) {
    const body = res.body || {};
    expect(body, "body.valid").to.have.property("valid");
    expect(body.valid, "body.valid").to.eq(expected);
  },

  echoesDocument(res, expectedDocument) {
    const body = res.body || {};
    expect(String(body.document), "body.document").to.eq(
      String(expectedDocument),
    );
  },

  hasBusinessError(res) {
    expect(res.body, "body.isError").to.have.property("isError", true);
    const errors = (res.body && res.body.errors) || [];
    expect(errors.length, "quantidade de errors").to.be.at.least(1);
    expect(errors[0], "primeiro error").to.have.property("code");
  },

  hasErrorCode(res, code) {
    const errors = (res.body && res.body.errors) || [];
    const codes = errors.map((e) => e && e.code);
    expect(codes, `codes recebidos: ${JSON.stringify(codes)}`).to.include(code);
  },

  rejected(res) {
    commonAssertions.status(res, 400);
  },
};
