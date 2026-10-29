/// <reference types="cypress" />

export const commonAssertions = {
  status(res, expected) {
    expect(res.status, "HTTP status").to.eq(expected);
  },

  statusOneOf(res, expectedList) {
    expect(
      expectedList,
      `HTTP status (esperados ${expectedList.join(", ")})`,
    ).to.include(res.status);
  },

  httpFailure(res) {
    expect(res.status, "HTTP status").to.be.at.least(400);
  },

  bodyFlag(res, prop, expected) {
    expect(res.body).to.have.property(prop, expected);
  },
};
