/// <reference types="cypress" />
import { apiClient } from "../core/apiClient";
import { bearerAuthHeaderIfPresent } from "../core/httpHeaders";
import { massaId } from "../utils/randomUuid";
import {
  orderBatchUrl,
  orderBatchApproveUrl,
  orderBatchReproveUrl,
  orderBatchByIdUrl,
  orderBatchDetailsUrl,
  orderBatchTransactionsUrl,
  orderBatchAddTransactionUrl,
  orderBatchesByTransactionUrl,
  orderBatchResendFailedUrl,
  orderBatchGroupUrl,
  orderBatchGroupPendingAssociateUrl,
  orderBatchGroupBusinessApproveUrl,
  orderBatchGroupInvoiceApproveUrl,
  orderBatchGroupRemoveUrl,
  orderBatchGroupAssociateUrl,
  orderBatchGroupConfirmedPaymentUrl,
  orderBatchGroupReportUrl,
  orderBatchGroupDetailsUrl,
  orderBatchGroupBatchesUrl,
  orderBatchGroupBillingsUrl,
  orderBillingByIdUrl,
  orderBoletoUrl,
  orderBoletoByBatchUrl,
  orderBoletoByOrderUrl,
  orderBoletoReceiptUrl,
  orderPixOutUrl,
  orderPixOutByBatchUrl,
  orderPixOutByOrderUrl,
  orderPixReceiptUrl,
  orderSupplierUrl,
  orderTransactionFilterUrl,
  orderTransactionPixDetailsUrl,
  orderTransactionBillDetailsUrl,
  orderTransactionHistoryUrl,
  orderTransactionCancelUrl,
  orderTransactionCancelByOrderUrl,
  orderTransactionConfirmCancelUrl,
  orderTransactionResendUrl,
} from "../constants/endpoints";

function authHeaders(bearerToken) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...bearerAuthHeaderIfPresent(bearerToken),
  };
}

function missingId() {
  return Cypress.env("orderMissingId") || "";
}

function massaOrderId() {
  return Cypress.env("orderOrderId") || `pedido-${Date.now()}`;
}

function userBy(override) {
  return (
    override ||
    Cypress.env("orderUserEmail") ||
    Cypress.env("userEmail") ||
    Cypress.env("requesterEmail")
  );
}

function cancelBodyFromEnv(overrides = {}) {
  return {
    userBy: userBy(),
    reason:
      Cypress.env("orderCancelReason") ||
      Cypress.env("reason") ||
      "Teste automatizado",
    ...overrides,
  };
}

function paged(overrides = {}) {
  return { Offset: 0, Limit: 10, ...overrides };
}

function listEnv(key) {
  const v = Cypress.env(key);
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function numEnv(key, fallback) {
  const v = Cypress.env(key);
  if (v === undefined || v === null || v === "") return fallback;
  return Number(v);
}

function createBatchBodyFromEnv(overrides = {}) {
  return {
    startDate: Cypress.env("orderBatchStartDate") || new Date().toISOString(),
    endDate:
      Cypress.env("orderBatchEndDate") ||
      new Date(Date.now() + 86400000).toISOString(),
    maxValue: numEnv("orderBatchMaxValue", 1000),
    clientId: Cypress.env("orderClientId") || null,
    campaignId: Cypress.env("orderCampaignId") || null,
    requestedBy: userBy(),
    ...overrides,
  };
}

function approveBatchBodyFromEnv(overrides = {}) {
  return {
    id: Cypress.env("orderBatchId") || missingId(),
    supplierId: Cypress.env("orderSupplierId") || missingId(),
    approveBy: userBy(),
    ...overrides,
  };
}

function reproveBatchBodyFromEnv(overrides = {}) {
  return {
    id: Cypress.env("orderBatchId") || missingId(),
    reason: Cypress.env("orderCancelReason") || "Teste automatizado",
    reprovedBy: userBy(),
    ...overrides,
  };
}

function resendBodyFromEnv(overrides = {}) {
  return {
    resendBy: userBy(),
    ...overrides,
  };
}

function createBatchGroupBodyFromEnv(overrides = {}) {
  return {
    name: Cypress.env("orderGroupName") || "Grupo de teste automatizado",
    invoiceNumber: listEnv("orderGroupInvoiceNumbers"),
    idPo: listEnv("orderGroupIdPos"),
    createdBy: userBy(),
    batchesId: Cypress.env("orderBatchId") ? [Cypress.env("orderBatchId")] : [],
    ...overrides,
  };
}

function deleteBatchGroupBodyFromEnv(overrides = {}) {
  return {
    groupId: Cypress.env("orderGroupId") || missingId(),
    reason: Cypress.env("orderCancelReason") || "Teste automatizado",
    userBy: userBy(),
    ...overrides,
  };
}

function businessApproveBodyFromEnv(id, overrides = {}) {
  return {
    id: id || Cypress.env("orderGroupId") || missingId(),
    idPo: listEnv("orderGroupIdPos"),
    approvedBy: userBy(),
    ...overrides,
  };
}

function invoiceApproveBodyFromEnv(id, overrides = {}) {
  return {
    id: id || Cypress.env("orderGroupId") || missingId(),
    invoiceNumber: listEnv("orderGroupInvoiceNumbers"),
    approvedBy: userBy(),
    ...overrides,
  };
}

function removeBatchGroupBodyFromEnv(id, overrides = {}) {
  return {
    id: id || Cypress.env("orderGroupId") || missingId(),
    batchesId: Cypress.env("orderBatchId") ? [Cypress.env("orderBatchId")] : [],
    userBy: userBy(),
    ...overrides,
  };
}

function associateBodyFromEnv(id, overrides = {}) {
  return {
    groupId: id || Cypress.env("orderGroupId") || missingId(),
    batchesId: Cypress.env("orderBatchId") ? [Cypress.env("orderBatchId")] : [],
    userBy: userBy(),
    ...overrides,
  };
}

function confirmedPaymentBodyFromEnv(id, overrides = {}) {
  return {
    id: id || Cypress.env("orderGroupId") || missingId(),
    creditTransactionId: listEnv("orderCreditTransactionIds"),
    supplierId: Cypress.env("orderSupplierId") || missingId(),
    userBy: userBy(),
    ...overrides,
  };
}

function billingItemFromEnv(overrides = {}) {
  return {
    clientCnpj: Cypress.env("orderBillingClientCnpj") || null,
    campaignId: Cypress.env("orderCampaignId") || null,
    product: Cypress.env("orderBillingProduct") || "Premiacao",
    costCenter: Cypress.env("orderBillingCostCenter") || null,
    dueDate: Cypress.env("orderBillingDueDate") || null,
    unitPrice: numEnv("orderBillingUnitPrice", 1),
    pointsValue: numEnv("orderBillingPointsValue", 1),
    taxBv: numEnv("orderBillingTaxBv", 0),
    messages: listEnv("orderBillingMessages"),
    preOrders: Cypress.env("orderBillingPreOrders") || null,
    sendEmail: Cypress.env("orderBillingSendEmail") || null,
    createdBy: userBy(),
    ...overrides,
  };
}

function updateBillingItemFromEnv(groupId, overrides = {}) {
  return {
    billingId: Cypress.env("orderBillingId") || null,
    batchGroupId: groupId || Cypress.env("orderGroupId") || missingId(),
    updatedBy: userBy(),
    ...billingItemFromEnv(),
    ...overrides,
  };
}

function createBoletoBodyFromEnv(overrides = {}) {
  return {
    projectId:
      Cypress.env("orderProjectId") ||
      Cypress.env("validationPixProjectId") ||
      missingId(),
    barCode:
      Cypress.env("orderBoletoBarCode") ||
      Cypress.env("validationBarCode") ||
      null,
    paymentAmount: numEnv("orderBoletoPaymentAmount", 1),
    dueDate: Cypress.env("orderBoletoDueDate") || null,
    payerDocument:
      Cypress.env("orderBoletoPayerDocument") ||
      Cypress.env("validationDocument") ||
      null,
    clientId: Cypress.env("orderClientId") || null,
    campaignId: Cypress.env("orderCampaignId") || null,
    catalogId: Cypress.env("orderCatalogId") || null,
    orderNumber: Cypress.env("orderBoletoOrderNumber") || null,
    fee: numEnv("orderBoletoFee", 0),
    ...overrides,
  };
}

function createPixOutBodyFromEnv(overrides = {}) {
  return {
    clientId: Cypress.env("orderClientId") || null,
    campaignId: Cypress.env("orderCampaignId") || null,
    catalogId: Cypress.env("orderCatalogId") || null,
    externalOrderId: Cypress.env("orderOrderId") || null,
    projectId:
      Cypress.env("orderProjectId") ||
      Cypress.env("validationPixProjectId") ||
      null,
    dictKey:
      Cypress.env("orderPixDictKey") || Cypress.env("validationPixKey") || null,
    verifiedPixKey:
      Cypress.env("orderPixVerifiedKey") ||
      Cypress.env("validationPixVerifiedKey") ||
      null,
    keyType:
      Cypress.env("orderPixKeyType") ||
      Cypress.env("validationPixKeyType") ||
      "CPF",
    paymentAmount: numEnv("orderPixPaymentAmount", 1),
    payerDocument:
      Cypress.env("orderPixPayerDocument") ||
      Cypress.env("validationPixDocument") ||
      null,
    participantName: Cypress.env("orderPixParticipantName") || null,
    parentOrderId: Cypress.env("orderPixParentOrderId") || null,
    marginValue: numEnv("orderPixMarginValue", null),
    ...overrides,
  };
}

export const orderService = {
  listBatches({ qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchUrl(),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listBatches",
    });
  },

  createBatch({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : createBatchBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url: orderBatchUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:createBatch",
    });
  },

  approveBatch({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : approveBatchBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchApproveUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:approveBatch",
    });
  },

  reproveBatch({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : reproveBatchBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchReproveUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:reproveBatch",
    });
  },

  getBatchById({ batchId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchByIdUrl(batchId || massaId("orderBatchId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchById",
    });
  },

  getBatchDetails({ batchId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchDetailsUrl(batchId || massaId("orderBatchId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchDetails",
    });
  },

  getBatchTransactions({ batchId, qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchTransactionsUrl(batchId || massaId("orderBatchId")),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchTransactions",
    });
  },

  addTransactionToBatch({ batchId, transactionId, bearerToken } = {}) {
    return apiClient.request({
      method: "PUT",
      url: orderBatchAddTransactionUrl(
        batchId || massaId("orderBatchId"),
        transactionId || massaId("orderTransactionId"),
      ),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:addTransactionToBatch",
    });
  },

  listBatchesByTransaction({ transactionId, qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchesByTransactionUrl(
        transactionId || massaId("orderTransactionId"),
      ),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listBatchesByTransaction",
    });
  },

  resendFailedBatch({ batchId, bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined ? bodyOverride : resendBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchResendFailedUrl(batchId || massaId("orderBatchId")),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:resendFailedBatch",
    });
  },

  createBatchGroup({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : createBatchGroupBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url: orderBatchGroupUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:createBatchGroup",
    });
  },

  deleteBatchGroup({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : deleteBatchGroupBodyFromEnv(overrides);
    return apiClient.request({
      method: "DELETE",
      url: orderBatchGroupUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:deleteBatchGroup",
    });
  },

  listBatchGroups({ qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupUrl(),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listBatchGroups",
    });
  },

  listPendingAssociate({ bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupPendingAssociateUrl(),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listPendingAssociate",
    });
  },

  businessApproveBatchGroup({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : businessApproveBodyFromEnv(groupId, overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupBusinessApproveUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:businessApproveBatchGroup",
    });
  },

  invoiceApproveBatchGroup({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : invoiceApproveBodyFromEnv(groupId, overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupInvoiceApproveUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:invoiceApproveBatchGroup",
    });
  },

  removeFromBatchGroup({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : removeBatchGroupBodyFromEnv(groupId, overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupRemoveUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:removeFromBatchGroup",
    });
  },

  associateBatchGroup({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : associateBodyFromEnv(groupId, overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupAssociateUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:associateBatchGroup",
    });
  },

  confirmPaymentBatchGroup({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : confirmedPaymentBodyFromEnv(groupId, overrides);
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupConfirmedPaymentUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:confirmPaymentBatchGroup",
    });
  },

  getBatchGroupReport({ id, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupReportUrl(id || massaId("orderGroupId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchGroupReport",
    });
  },

  getBatchGroupDetails({ id, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupDetailsUrl(id || massaId("orderGroupId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchGroupDetails",
    });
  },

  getBatchGroupBatches({ id, qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupBatchesUrl(id || massaId("orderGroupId")),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBatchGroupBatches",
    });
  },

  createBillings({ id, bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : [billingItemFromEnv(overrides)];
    return apiClient.request({
      method: "POST",
      url: orderBatchGroupBillingsUrl(id || massaId("orderGroupId")),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:createBillings",
    });
  },

  getBillings({ id, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBatchGroupBillingsUrl(id || massaId("orderGroupId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBillings",
    });
  },

  updateBillings({ id, bodyOverride, overrides, bearerToken } = {}) {
    const groupId = id || massaId("orderGroupId");
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : [updateBillingItemFromEnv(groupId, overrides)];
    return apiClient.request({
      method: "PUT",
      url: orderBatchGroupBillingsUrl(groupId),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:updateBillings",
    });
  },

  deleteBilling({ billingId, bearerToken } = {}) {
    return apiClient.request({
      method: "DELETE",
      url: orderBillingByIdUrl(billingId || massaId("orderBillingId")),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:deleteBilling",
    });
  },

  createBoleto({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : createBoletoBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url: orderBoletoUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:createBoleto",
    });
  },

  listBoletosByBatch({ batchId, qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBoletoByBatchUrl(batchId || massaId("orderBatchId")),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listBoletosByBatch",
    });
  },

  getBoletoByOrder({ orderId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBoletoByOrderUrl(orderId || massaOrderId()),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBoletoByOrder",
    });
  },

  getBoletoReceipt({ orderId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderBoletoReceiptUrl(orderId || massaOrderId()),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBoletoReceipt",
    });
  },

  createPixOut({ bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined
        ? bodyOverride
        : createPixOutBodyFromEnv(overrides);
    return apiClient.request({
      method: "POST",
      url: orderPixOutUrl(),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:createPixOut",
    });
  },

  listPixByBatch({ batchId, qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderPixOutByBatchUrl(batchId || massaId("orderBatchId")),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listPixByBatch",
    });
  },

  getPixByOrder({ orderId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderPixOutByOrderUrl(orderId || massaOrderId()),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getPixByOrder",
    });
  },

  getPixReceipt({ transactionId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderPixReceiptUrl(
        transactionId || massaId("orderPixTransactionId"),
      ),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getPixReceipt",
    });
  },

  listSuppliers({ qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderSupplierUrl(),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:listSuppliers",
    });
  },

  filterTransactions({ qs, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderTransactionFilterUrl(),
      qs: paged(qs),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:filterTransactions",
    });
  },

  getPixTransactionDetails({ transactionId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderTransactionPixDetailsUrl(
        transactionId || massaId("orderPixTransactionId"),
      ),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getPixTransactionDetails",
    });
  },

  getBillPaymentTransactionDetails({ transactionId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderTransactionBillDetailsUrl(
        transactionId || massaId("orderTransactionId"),
      ),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getBillPaymentTransactionDetails",
    });
  },

  getTransactionHistory({ transactionId, bearerToken } = {}) {
    return apiClient.request({
      method: "GET",
      url: orderTransactionHistoryUrl(
        transactionId || massaId("orderPixTransactionId"),
      ),
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:getTransactionHistory",
    });
  },

  cancelTransaction({ id, bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined ? bodyOverride : cancelBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderTransactionCancelUrl(id || massaId("orderTransactionId")),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:cancelTransaction",
    });
  },

  cancelTransactionByOrder({ id, bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined ? bodyOverride : cancelBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderTransactionCancelByOrderUrl(id || massaOrderId()),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:cancelTransactionByOrder",
    });
  },

  confirmCancelTransaction({ id, bodyOverride, overrides, bearerToken } = {}) {
    const body =
      bodyOverride !== undefined ? bodyOverride : cancelBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderTransactionConfirmCancelUrl(id || massaOrderId()),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:confirmCancelTransaction",
    });
  },

  resendTransaction({
    transactionId,
    bodyOverride,
    overrides,
    bearerToken,
  } = {}) {
    const body =
      bodyOverride !== undefined ? bodyOverride : resendBodyFromEnv(overrides);
    return apiClient.request({
      method: "PUT",
      url: orderTransactionResendUrl(
        transactionId || massaId("orderTransactionId"),
      ),
      body,
      headers: authHeaders(bearerToken),
      token: bearerToken,
      logName: "order:resendTransaction",
    });
  },
};
