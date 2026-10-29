/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import {
  bearerAuthHeaderIfPresent,
  apiVersionHeader,
  TENANT_ID_HEADER,
} from "../core/httpHeaders";
import { randomUuid, massaId } from "../utils/randomUuid";
import {
  walletBalanceUrl,
  walletBalanceOnHoldUrl,
  walletBalanceCampaignUrl,
  walletDepositUrl,
  walletDepositsToExpireUrl,
  walletDepositsToConsumeUrl,
  walletDepositByExternalCodeUrl,
  walletCampaignToExpireUrl,
  walletDepositReversalUrl,
  walletDepositReversalPartialUrl,
  walletTransactionsImportUrl,
  walletAuthorizationUrl,
  walletAuthorizationCaptureUrl,
  walletAuthorizationCancellationUrl,
  walletAuthorizationReversalUrl,
  walletAuthorizationReversalPartialUrl,
  walletStatementsUrl,
  walletStatementsConsolidatedUrl,
  walletStatementsPaginatedUrl,
  walletTenantDepositsUrl,
  walletTenantDepositConsumptionsUrl,
} from "../constants/endpoints";

function authHeaders(
  bearerToken,
  { omitSubscriptionKey = false, subscriptionKeyOverride } = {},
) {
  const headers = {
    Accept: "application/json",
    ...apiVersionHeader(),
    ...bearerAuthHeaderIfPresent(bearerToken),
  };
  if (!omitSubscriptionKey) {
    headers["Ocp-Apim-Subscription-Key"] =
      subscriptionKeyOverride !== undefined
        ? subscriptionKeyOverride
        : Cypress.env("walletSubscriptionKey");
  }
  return headers;
}

function tenantIdFromToken(bearerToken) {
  const fromEnv = Cypress.env("walletTenantId");
  if (fromEnv) return fromEnv;
  try {
    const payload = JSON.parse(atob(bearerToken.split(".")[1]));
    return payload.tenant_id;
  } catch {
    return undefined;
  }
}

function idempotencyHeader(idempotencyKey) {
  return idempotencyKey !== undefined ? idempotencyKey : randomUuid();
}

function writeHeaders(
  bearerToken,
  { omitSubscriptionKey, idempotencyKey, omitIdempotencyKey = false } = {},
) {
  const headers = authHeaders(bearerToken, { omitSubscriptionKey });
  if (!omitIdempotencyKey) {
    headers["Idempotency-Key"] = idempotencyHeader(idempotencyKey);
  }
  return headers;
}

function defaultStatementDateRange(startDate, endDate) {
  const end = endDate || new Date().toISOString();
  let start = startDate;
  if (!start) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 300);
    start = d.toISOString();
  }
  return { startDate: start, endDate: end };
}

function campaignToExpireDateRange(startDate, endDate) {
  const end = endDate || new Date().toISOString();
  let start = startDate;
  if (!start) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 89);
    start = d.toISOString();
  }
  return { startDate: start, endDate: end };
}

function depositBodyFromEnv(overrides = {}) {
  return {
    participantKey: Cypress.env("walletParticipantKeyCpf") || "00000000000",
    participantKeyType: "cpf",
    creditStampedId: randomUuid(),
    amount: 0.01,
    description: "Teste automatizado",
    ...overrides,
  };
}

function transactionImportBodyFromEnv(overrides = {}, accountingLedgerId) {
  const item = {
    uniqueId: randomUuid(),
    digitalAccountId: massaId("walletDigitalAccountId"),
    accountingLedgerId:
      accountingLedgerId || massaId("walletAccountingLedgerId"),
    operation: "credit",
    externalCode: Cypress.env("walletExternalCode") || randomUuid(),
    amount: 0.01,
    createdAt: new Date().toISOString(),
    description: "Teste automatizado (import)",
    creditStampedId: randomUuid(),
    ...overrides,
  };
  return [item];
}

export const walletService = {
  getBalance({
    accountingLedgerId,
    digitalAccountId,
    creditStampedId,
    bearerToken,
    omitSubscriptionKey,
    subscriptionKeyOverride,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken, {
            omitSubscriptionKey,
            subscriptionKeyOverride,
          });

    return apiClient.request({
      method: "GET",
      url: walletBalanceUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs: creditStampedId ? { creditStampedId } : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getBalance",
    });
  },

  getBalanceOnHold({
    accountingLedgerId,
    digitalAccountId,
    creditStampedId,
    bearerToken,
    omitSubscriptionKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken, { omitSubscriptionKey });

    return apiClient.request({
      method: "GET",
      url: walletBalanceOnHoldUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs: creditStampedId ? { creditStampedId } : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getBalanceOnHold",
    });
  },

  getCampaignBalance({
    accountingLedgerId,
    campaignId,
    tenantId,
    pageNumber,
    pageSize,
    bearerToken,
    omitSubscriptionKey,
    omitCampaignId = false,
    omitTenantId = false,
    headersOverride,
  } = {}) {
    let headers;
    if (headersOverride !== undefined) {
      headers = headersOverride;
    } else {
      headers = authHeaders(bearerToken, { omitSubscriptionKey });
      if (!omitCampaignId) {
        headers.campaignId = String(
          campaignId !== undefined
            ? campaignId
            : Cypress.env("walletCampaignId") || 1,
        );
      }
      if (!omitTenantId) {
        headers[TENANT_ID_HEADER] = tenantId || tenantIdFromToken(bearerToken);
      }
      if (pageNumber !== undefined) headers.pageNumber = String(pageNumber);
      if (pageSize !== undefined) headers.pageSize = String(pageSize);
    }

    return apiClient.request({
      method: "GET",
      url: walletBalanceCampaignUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:getCampaignBalance",
    });
  },

  createDeposit({
    accountingLedgerId,
    bearerToken,
    bodyOverride,
    overrides,
    idempotencyKey,
    omitIdempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey, omitIdempotencyKey });
    const body =
      bodyOverride !== undefined ? bodyOverride : depositBodyFromEnv(overrides);

    return apiClient.request({
      method: "POST",
      url: walletDepositUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
      ),
      body,
      headers,
      token: bearerToken,
      logName: "wallet:createDeposit",
    });
  },

  getDepositsToExpire({
    accountingLedgerId,
    digitalAccountId,
    beginDate,
    omitBeginDate = false,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const defaultBeginDate = () => {
      const d = new Date();
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      return d.toISOString();
    };
    const qs = omitBeginDate
      ? undefined
      : { beginDate: beginDate || defaultBeginDate() };

    return apiClient.request({
      method: "GET",
      url: walletDepositsToExpireUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs,
      headers,
      token: bearerToken,
      logName: "wallet:getDepositsToExpire",
    });
  },

  getDepositsToConsume({
    accountingLedgerId,
    digitalAccountId,
    tenantId,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : {
            ...authHeaders(bearerToken),
            [TENANT_ID_HEADER]: tenantId || tenantIdFromToken(bearerToken),
          };

    return apiClient.request({
      method: "GET",
      url: walletDepositsToConsumeUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:getDepositsToConsume",
    });
  },

  getDepositByExternalCode({
    accountingLedgerId,
    digitalAccountId,
    externalCode,
    tenantId,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : {
            ...authHeaders(bearerToken),
            [TENANT_ID_HEADER]: tenantId || tenantIdFromToken(bearerToken),
          };

    return apiClient.request({
      method: "GET",
      url: walletDepositByExternalCodeUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        externalCode || Cypress.env("walletExternalCode") || randomUuid(),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:getDepositByExternalCode",
    });
  },

  getCampaignToExpire({
    accountingLedgerId,
    campaignId,
    tenantId,
    pageNumber,
    pageSize,
    startDate,
    endDate,
    omitDateRange = false,
    bearerToken,
    omitCampaignId = false,
    headersOverride,
  } = {}) {
    let headers;
    if (headersOverride !== undefined) {
      headers = headersOverride;
    } else {
      headers = authHeaders(bearerToken);
      if (!omitCampaignId) {
        headers.campaignId = String(
          campaignId !== undefined
            ? campaignId
            : Cypress.env("walletCampaignId") || 1,
        );
      }
      headers[TENANT_ID_HEADER] = tenantId || tenantIdFromToken(bearerToken);
      if (pageNumber !== undefined) headers.pageNumber = String(pageNumber);
      if (pageSize !== undefined) headers.pageSize = String(pageSize);
      if (!omitDateRange) {
        const range = campaignToExpireDateRange(startDate, endDate);
        headers.startDate = range.startDate;
        headers.endDate = range.endDate;
      } else {
        if (startDate !== undefined) headers.startDate = startDate;
        if (endDate !== undefined) headers.endDate = endDate;
      }
    }

    return apiClient.request({
      method: "GET",
      url: walletCampaignToExpireUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:getCampaignToExpire",
    });
  },

  reverseDeposit({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    return apiClient.request({
      method: "POST",
      url: walletDepositReversalUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:reverseDeposit",
    });
  },

  reverseDepositPartial({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    amount,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    return apiClient.request({
      method: "POST",
      url: walletDepositReversalPartialUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      body: amount !== undefined ? { amount } : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:reverseDepositPartial",
    });
  },

  importTransactions({
    accountingLedgerId,
    tenantId,
    bearerToken,
    bodyOverride,
    overrides,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const ledgerId = accountingLedgerId || massaId("walletAccountingLedgerId");
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : {
            ...writeHeaders(bearerToken, { idempotencyKey }),
            [TENANT_ID_HEADER]: tenantId || tenantIdFromToken(bearerToken),
          };
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : transactionImportBodyFromEnv(overrides, ledgerId);

    return apiClient.request({
      method: "POST",
      url: walletTransactionsImportUrl(ledgerId),
      body,
      headers,
      token: bearerToken,
      logName: "wallet:importTransactions",
    });
  },

  createAuthorization({
    accountingLedgerId,
    digitalAccountId,
    bearerToken,
    bodyOverride,
    overrides,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : {
            amount: 0.01,
            description: "Teste automatizado (authorization)",
            ...overrides,
          };

    return apiClient.request({
      method: "POST",
      url: walletAuthorizationUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      body,
      headers,
      token: bearerToken,
      logName: "wallet:createAuthorization",
    });
  },

  captureAuthorization({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    amount,
    omitBody = false,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    const body = omitBody
      ? undefined
      : { amount: amount !== undefined ? amount : 0.01 };

    return apiClient.request({
      method: "POST",
      url: walletAuthorizationCaptureUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      body,
      headers,
      token: bearerToken,
      logName: "wallet:captureAuthorization",
    });
  },

  cancelAuthorization({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    return apiClient.request({
      method: "POST",
      url: walletAuthorizationCancellationUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:cancelAuthorization",
    });
  },

  reverseAuthorization({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    return apiClient.request({
      method: "POST",
      url: walletAuthorizationReversalUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      headers,
      token: bearerToken,
      logName: "wallet:reverseAuthorization",
    });
  },

  reverseAuthorizationPartial({
    accountingLedgerId,
    digitalAccountId,
    transactionId,
    amount,
    bearerToken,
    idempotencyKey,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : writeHeaders(bearerToken, { idempotencyKey });

    return apiClient.request({
      method: "POST",
      url: walletAuthorizationReversalPartialUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
        transactionId || randomUuid(),
      ),
      body: amount !== undefined ? { amount } : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:reverseAuthorizationPartial",
    });
  },

  getStatements({
    accountingLedgerId,
    digitalAccountId,
    startDate,
    endDate,
    omitDateRange = false,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const qs = omitDateRange
      ? undefined
      : defaultStatementDateRange(startDate, endDate);

    return apiClient.request({
      method: "GET",
      url: walletStatementsUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs,
      headers,
      token: bearerToken,
      logName: "wallet:getStatements",
    });
  },

  getStatementsConsolidated({
    accountingLedgerId,
    digitalAccountId,
    beginDate,
    endDate,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const qs = {};
    if (beginDate !== undefined) qs.beginDate = beginDate;
    if (endDate !== undefined) qs.endDate = endDate;

    return apiClient.request({
      method: "GET",
      url: walletStatementsConsolidatedUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs: Object.keys(qs).length ? qs : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getStatementsConsolidated",
    });
  },

  getStatementsPaginated({
    accountingLedgerId,
    digitalAccountId,
    startDate,
    endDate,
    omitDateRange = false,
    creditStampedId,
    pageNumber,
    pageSize,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const qs = omitDateRange
      ? {}
      : defaultStatementDateRange(startDate, endDate);
    if (creditStampedId !== undefined) qs.creditStampedId = creditStampedId;
    if (pageNumber !== undefined) qs.pageNumber = pageNumber;
    if (pageSize !== undefined) qs.pageSize = pageSize;

    return apiClient.request({
      method: "GET",
      url: walletStatementsPaginatedUrl(
        accountingLedgerId || massaId("walletAccountingLedgerId"),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs: Object.keys(qs).length ? qs : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getStatementsPaginated",
    });
  },

  getTenantDeposits({
    tenantId,
    digitalAccountId,
    accountingLedgerIds,
    pageNumber,
    pageSize,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const qs = {};
    if (accountingLedgerIds !== undefined)
      qs.accountingLedgerIds = accountingLedgerIds;
    if (pageNumber !== undefined) qs.pageNumber = pageNumber;
    if (pageSize !== undefined) qs.pageSize = pageSize;

    return apiClient.request({
      method: "GET",
      url: walletTenantDepositsUrl(
        tenantId ||
          Cypress.env("walletTenantIdForCredit") ||
          tenantIdFromToken(bearerToken),
        digitalAccountId || massaId("walletDigitalAccountId"),
      ),
      qs: Object.keys(qs).length ? qs : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getTenantDeposits",
    });
  },

  getTenantDepositConsumptions({
    tenantId,
    digitalAccountId,
    creditTransactionId,
    pageNumber,
    pageSize,
    bearerToken,
    headersOverride,
  } = {}) {
    const headers =
      headersOverride !== undefined
        ? headersOverride
        : authHeaders(bearerToken);
    const qs = {};
    if (pageNumber !== undefined) qs.pageNumber = pageNumber;
    if (pageSize !== undefined) qs.pageSize = pageSize;

    return apiClient.request({
      method: "GET",
      url: walletTenantDepositConsumptionsUrl(
        tenantId ||
          Cypress.env("walletTenantIdForCredit") ||
          tenantIdFromToken(bearerToken),
        digitalAccountId || massaId("walletDigitalAccountId"),
        creditTransactionId || randomUuid(),
      ),
      qs: Object.keys(qs).length ? qs : undefined,
      headers,
      token: bearerToken,
      logName: "wallet:getTenantDepositConsumptions",
    });
  },
};
