/// <reference types="cypress" />

export const ENDPOINTS = {
  get FILE_VALIDATE() {
    return Cypress.env("validateEndpoint") || "";
  },

  get CREDIT_LOT_CREATE() {
    return Cypress.env("creditLotCreateEndpoint") || "";
  },

  CREDIT_LOT_BY_ID(id) {
    const base = Cypress.env("creditLotByIdEndpoint") || "";
    return `${base}/${id}`;
  },

  CREDIT_LOT_ACTION(id, action) {
    const base = Cypress.env("creditLotByIdEndpoint") || "";
    return `${base}/${id}/${action}`;
  },

  get HEALTH_LIVENESS() {
    return Cypress.env("healthLivenessEndpoint") || "";
  },

  get HEALTH_READINESS() {
    return Cypress.env("healthReadinessEndpoint") || "";
  },
};

export function tokenUrl() {
  return Cypress.env("tokenUrl") || "";
}

export function cnaeTokenUrl() {
  return Cypress.env("cnaeTokenUrl") || "";
}

export function validationTokenUrl() {
  return Cypress.env("validationTokenUrl") || "";
}

export function validationBaseUrl() {
  return Cypress.env("validationBaseUrl") || "";
}

export function validationUrl(path) {
  return `${validationBaseUrl()}${path}`;
}

const AUDIT_LOGS = () => Cypress.env("validationAuditLogsEndpoint") || "";
const BILLPAYMENT = () => Cypress.env("validationBillPaymentEndpoint") || "";
const BILLPAYMENT_RULES = () =>
  Cypress.env("validationBillPaymentRulesEndpoint") || "";
const BILLPAYMENT_CAMPAIGNS = () =>
  Cypress.env("validationBillPaymentCampaignsEndpoint") || "";
const PIXOUT = () => Cypress.env("validationPixOutEndpoint") || "";
const PIXOUT_RULES = () => Cypress.env("validationPixOutRulesEndpoint") || "";
const PIXOUT_INSTALLMENT = () =>
  Cypress.env("validationPixOutInstallmentEndpoint") || "";
const PIXOUT_CAMPAIGNS = () =>
  Cypress.env("validationPixOutCampaignsEndpoint") || "";

export function validationAuditLogsUrl() {
  return validationUrl(AUDIT_LOGS());
}
export function billPaymentUrl() {
  return validationUrl(BILLPAYMENT());
}
export function billPaymentRulesUrl(campaignId, catalogId) {
  const base = BILLPAYMENT_RULES();
  if (campaignId !== undefined && catalogId !== undefined) {
    return validationUrl(`${base}/${campaignId}/${catalogId}`);
  }
  return validationUrl(base);
}
export function billPaymentCampaignsUrl() {
  return validationUrl(BILLPAYMENT_CAMPAIGNS());
}
export function pixOutUrl() {
  return validationUrl(PIXOUT());
}
export function pixOutRulesUrl(campaignId, catalogId) {
  const base = PIXOUT_RULES();
  if (campaignId !== undefined && catalogId !== undefined) {
    return validationUrl(`${base}/${campaignId}/${catalogId}`);
  }
  return validationUrl(base);
}
export function pixOutInstallmentUrl() {
  return validationUrl(PIXOUT_INSTALLMENT());
}
export function pixOutCampaignsUrl() {
  return validationUrl(PIXOUT_CAMPAIGNS());
}

export function orderBaseUrl() {
  return Cypress.env("orderBaseUrl") || "";
}

export function orderUrl(path) {
  return `${orderBaseUrl()}${path}`;
}

export function orderTokenUrl() {
  return Cypress.env("orderTokenUrl") || Cypress.env("cnaeTokenUrl") || "";
}

const env = (k, def) => () => Cypress.env(k) || def;
const ORDER_BATCH = env("orderBatchEndpoint", "");
const ORDER_BATCH_GROUP = env("orderBatchGroupEndpoint", "");
const ORDER_BOLETO = env("orderBoletoEndpoint", "");
const ORDER_PIX_OUT = env("orderPixOutEndpoint", "");
const ORDER_SUPPLIER = env("orderSupplierEndpoint", "");
const ORDER_TRANSACTION = env("orderTransactionEndpoint", "");

export function orderBatchUrl() {
  return orderUrl(ORDER_BATCH());
}
export function orderBatchApproveUrl() {
  return orderUrl(`${ORDER_BATCH()}`);
}
export function orderBatchReproveUrl() {
  return orderUrl(`${ORDER_BATCH()}`);
}
export function orderBatchByIdUrl(batchId) {
  return orderUrl(`${ORDER_BATCH()}/${batchId}`);
}
export function orderBatchDetailsUrl(batchId) {
  return orderUrl(`${ORDER_BATCH()}/${batchId}`);
}
export function orderBatchTransactionsUrl(batchId) {
  return orderUrl(`${ORDER_BATCH()}/${batchId}`);
}
export function orderBatchAddTransactionUrl(batchId, transactionId) {
  return orderUrl(`${ORDER_BATCH()}/${batchId}/${transactionId}`);
}
export function orderBatchesByTransactionUrl(transactionId) {
  return orderUrl(`${ORDER_BATCH()}/${transactionId}`);
}
export function orderBatchResendFailedUrl(batchId) {
  return orderUrl(`${ORDER_BATCH()}/${batchId}`);
}

export function orderBatchGroupUrl() {
  return orderUrl(ORDER_BATCH_GROUP());
}
export function orderBatchGroupPendingAssociateUrl() {
  return orderUrl(`${ORDER_BATCH_GROUP()}`);
}
export function orderBatchGroupByIdUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupBusinessApproveUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupInvoiceApproveUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupRemoveUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupAssociateUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupConfirmedPaymentUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupReportUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupDetailsUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupBatchesUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBatchGroupBillingsUrl(id) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${id}`);
}
export function orderBillingByIdUrl(billingId) {
  return orderUrl(`${ORDER_BATCH_GROUP()}/${billingId}`);
}

export function orderBoletoUrl() {
  return orderUrl(ORDER_BOLETO());
}
export function orderBoletoByBatchUrl(batchId) {
  return orderUrl(`${ORDER_BOLETO()}/${batchId}`);
}
export function orderBoletoByOrderUrl(orderId) {
  return orderUrl(`${ORDER_BOLETO()}/${orderId}`);
}
export function orderBoletoReceiptUrl(orderId) {
  return orderUrl(`${ORDER_BOLETO()}/${orderId}`);
}

export function orderPixOutUrl() {
  return orderUrl(ORDER_PIX_OUT());
}
export function orderPixOutByBatchUrl(batchId) {
  return orderUrl(`${ORDER_PIX_OUT()}/${batchId}`);
}
export function orderPixOutByOrderUrl(orderId) {
  return orderUrl(`${ORDER_PIX_OUT()}/${orderId}`);
}
export function orderPixReceiptUrl(transactionId) {
  return orderUrl(`${ORDER_PIX_OUT()}/${transactionId}`);
}

export function orderSupplierUrl() {
  return orderUrl(ORDER_SUPPLIER());
}

export function orderTransactionFilterUrl() {
  return orderUrl(`${ORDER_TRANSACTION()}`);
}
export function orderTransactionPixDetailsUrl(transactionId) {
  return orderUrl(`${ORDER_TRANSACTION()}/${transactionId}`);
}
export function orderTransactionBillDetailsUrl(transactionId) {
  return orderUrl(`${ORDER_TRANSACTION()}/${transactionId}`);
}
export function orderTransactionHistoryUrl(transactionId) {
  return orderUrl(`${ORDER_TRANSACTION()}/${transactionId}`);
}
export function orderTransactionCancelUrl(id) {
  return orderUrl(`${ORDER_TRANSACTION()}/${id}`);
}
export function orderTransactionCancelByOrderUrl(id) {
  return orderUrl(`${ORDER_TRANSACTION()}/${id}`);
}
export function orderTransactionConfirmCancelUrl(id) {
  return orderUrl(`${ORDER_TRANSACTION()}/${id}`);
}
export function orderTransactionResendUrl(transactionId) {
  return orderUrl(`${ORDER_TRANSACTION()}/${transactionId}`);
}

export function cnaeValidateUrl() {
  const base = Cypress.env("cnaeBaseUrl") || "";
  const path = Cypress.env("cnaeValidateEndpoint") || "";
  return `${base}${path}`;
}

export function fullUrl(path) {
  return `${Cypress.config("baseUrl")}${path}`;
}

export function walletBaseUrl() {
  return Cypress.env("walletBaseUrl") || "";
}

export function walletUrl(path) {
  return `${walletBaseUrl()}${path}`;
}

export function walletTokenUrl() {
  return Cypress.env("walletTokenUrl") || tokenUrl();
}

export function walletBalanceUrl(accountingLedgerId, digitalAccountId) {
  return walletUrl(``);
}

export function walletBalanceOnHoldUrl(accountingLedgerId, digitalAccountId) {
  return walletUrl(``);
}

export function walletBalanceCampaignUrl(accountingLedgerId) {
  return walletUrl(``);
}

export function walletDepositUrl(accountingLedgerId) {
  return walletUrl(``);
}

export function walletDepositsToExpireUrl(
  accountingLedgerId,
  digitalAccountId,
) {
  return walletUrl(``);
}

export function walletDepositsToConsumeUrl(
  accountingLedgerId,
  digitalAccountId,
) {
  return walletUrl(``);
}

export function walletDepositByExternalCodeUrl(
  accountingLedgerId,
  digitalAccountId,
  externalCode,
) {
  return walletUrl(`(externalCode)}`);
}

export function walletCampaignToExpireUrl(accountingLedgerId) {
  return walletUrl(``);
}

export function walletDepositReversalUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletDepositReversalPartialUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletTransactionsImportUrl(accountingLedgerId) {
  return walletUrl(``);
}

export function walletAuthorizationUrl(accountingLedgerId, digitalAccountId) {
  return walletUrl(``);
}

export function walletAuthorizationCaptureUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletAuthorizationCancellationUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletAuthorizationReversalUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletAuthorizationReversalPartialUrl(
  accountingLedgerId,
  digitalAccountId,
  transactionId,
) {
  return walletUrl(``);
}

export function walletStatementsUrl(accountingLedgerId, digitalAccountId) {
  return walletUrl(``);
}

export function walletStatementsConsolidatedUrl(
  accountingLedgerId,
  digitalAccountId,
) {
  return walletUrl(``);
}

export function walletStatementsPaginatedUrl(
  accountingLedgerId,
  digitalAccountId,
) {
  return walletUrl(``);
}

function walletHostUrl() {
  return Cypress.env("walletHostUrl") || walletBaseUrl().replace("", "");
}

function walletAccountingLedgerApiUrl(path) {
  return `${walletHostUrl()}${path}`;
}

export function walletTenantDepositsUrl(tenantId, digitalAccountId) {
  return walletAccountingLedgerApiUrl(``);
}

export function walletTenantDepositConsumptionsUrl(
  tenantId,
  digitalAccountId,
  creditTransactionId,
) {
  return walletAccountingLedgerApiUrl(``);
}
