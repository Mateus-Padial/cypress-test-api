/// <reference types="cypress" />
import { commonAssertions } from "./common";

export const walletAssertions = {
  status(res, expected) {
    commonAssertions.status(res, expected);
  },

  statusOneOf(res, expectedList) {
    commonAssertions.statusOneOf(res, expectedList);
  },

  hasBalanceSchema(res) {
    const body = res.body || {};
    expect(body, "body.accountingLedgerId").to.have.property(
      "accountingLedgerId",
    );
    expect(body.accountingLedgerId, "body.accountingLedgerId").to.be.a(
      "string",
    );
    expect(body, "body.totalBalance").to.have.property("totalBalance");
    expect(body.totalBalance, "body.totalBalance").to.be.a("number");
    if (body.items !== undefined && body.items !== null) {
      expect(body.items, "body.items").to.be.an("array");
    }
  },

  hasBalanceOnHoldSchema(res) {
    const body = res.body || {};
    expect(body, "body.totalBalance").to.have.property("totalBalance");
    expect(body.totalBalance, "body.totalBalance").to.be.a("number");
  },

  hasCampaignBalanceSchema(res) {
    const body = res.body || {};
    ["totalItems", "totalBalance", "pageNumber", "pageSize", "items"].forEach(
      (prop) => {
        expect(body, `body.${prop}`).to.have.property(prop);
      },
    );
    expect(body.totalItems, "body.totalItems").to.be.a("number");
    expect(body.totalBalance, "body.totalBalance").to.be.a("number");
    expect(body.pageNumber, "body.pageNumber").to.be.a("number");
    expect(body.pageSize, "body.pageSize").to.be.a("number");
    expect(body.items, "body.items").to.be.an("array");
    body.items.forEach((item, i) => {
      expect(item, `body.items[${i}].digitalAccountId`).to.have.property(
        "digitalAccountId",
      );
      expect(item, `body.items[${i}].login`).to.have.property("login");
      expect(item, `body.items[${i}].balance`).to.have.property("balance");
      expect(item.balance, `body.items[${i}].balance`).to.be.a("number");
    });
  },

  hasCampaignBalanceSchemaWithoutTotalItems(res) {
    const body = res.body || {};
    ["pageNumber", "pageSize", "items"].forEach((prop) => {
      expect(body, `body.${prop}`).to.have.property(prop);
    });
    expect(body.pageNumber, "body.pageNumber").to.be.a("number");
    expect(body.pageSize, "body.pageSize").to.be.a("number");
    expect(body.items, "body.items").to.be.an("array");
    expect(body, "body.totalItems").to.not.have.property("totalItems");
    expect(body, "body.totalBalance").to.not.have.property("totalBalance");
  },

  hasDepositSchema(res) {
    const body = res.body || {};
    expect(body, "body do DepositResponse").to.be.an("object");
  },

  hasDepositsToExpireSchema(res) {
    const body = res.body;
    expect(body, "body do CreditToExpireResponse").to.exist;
  },

  hasDepositsToConsumeSchema(res) {
    expect(res.body, "body do CreditsToConsumeResponse[]").to.be.an("array");
  },

  hasDepositByExternalCodeSchema(res) {
    const body = res.body;
    expect(body, "body do CreditsByExternalCodeResponse").to.satisfy(
      (b) =>
        (Array.isArray(b) && b.length > 0) ||
        (b !== null && typeof b === "object"),
      "deve ser um objeto ou um array (comportamento real observado em HML difere do swagger)",
    );
  },

  hasCampaignToExpireSchema(res) {
    const body = res.body || {};
    expect(body, "body do CreditcampaignToExpireResponse").to.be.an("object");
  },

  hasCreditReversalSchema(res) {
    const body = res.body || {};
    expect(body, "body do CreditReversalResponse").to.be.an("object");
  },

  hasTransactionImportSchema(res) {
    const body = res.body || {};
    expect(body, "body.lotId").to.have.property("lotId");
  },

  hasAuthorizationSchema(res) {
    const body = res.body || {};
    expect(body, "body do AuthorizationResponse").to.be.an("object");
  },

  hasCaptureSchema(res) {
    const body = res.body || {};
    expect(body, "body do CaptureResponse").to.be.an("object");
  },

  hasCancellationSchema(res) {
    const body = res.body || {};
    expect(body, "body do CancellationResponse").to.be.an("object");
  },

  hasReversalSchema(res) {
    const body = res.body || {};
    expect(body, "body do ReversalResponse").to.be.an("object");
  },

  hasStatementSchema(res) {
    expect(res.body, "body do statement por credito").to.exist;
  },

  hasStatementConsolidatedSchema(res) {
    const body = res.body || {};
    expect(body, "body do AccountStatementConsolidatedResponse").to.be.an(
      "object",
    );
  },

  hasStatementPaginatedSchema(res) {
    const body = res.body || {};
    expect(body, "body do AccountStatementResponse").to.be.an("object");
    ["pageNumber", "pageSize"].forEach((prop) => {
      if (body[prop] !== undefined) {
        expect(body[prop], `body.${prop}`).to.be.a("number");
      }
    });
  },

  hasTenantDepositsSchema(res) {
    const body = res.body || {};
    expect(body, "body do PaginatedTenantDepositResponse").to.be.an("object");
  },

  hasTenantDepositConsumptionsSchema(res) {
    const body = res.body || {};
    expect(body, "body do TenantCreditConsumptionResponse").to.be.an("object");
  },
};
