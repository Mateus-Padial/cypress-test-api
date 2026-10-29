/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, orderService } from "../../support/services";
import { orderAssertions as check } from "../../support/assertions/orderAssertions";

const MISSING_UUID = "";
const missingId = () => Cypress.env("orderMissingId") || MISSING_UUID;
const missingOrderId = () =>
  Cypress.env("orderMissingOrderId") || "pedido-inexistente-000";

function call(world, promise) {
  return promise.then((response) => {
    world.response = response;
  });
}

function requireContext(world, key) {
  expect(world[key], `${key} necessario para este passo`).to.exist;
  return world[key];
}

Given(
  "que possuo um token de autenticacao valido para a Order API",
  function () {
    return authService.getOrderBearerToken().then((token) => {
      this.bearerToken = token;
    });
  },
);

When("consulto a lista de lotes da Order API", function () {
  return call(
    this,
    orderService.listBatches({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto a lista de lotes da Order API com {string} igual a {int}",
  function (param, value) {
    return call(
      this,
      orderService.listBatches({
        qs: { [param]: value },
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("consulto os detalhes de um lote da Order API", function () {
  return call(
    this,
    orderService.getBatchById({ bearerToken: this.bearerToken }),
  );
});

When("consulto os detalhes de um lote inexistente na Order API", function () {
  return call(
    this,
    orderService.getBatchById({
      batchId: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto os detalhes agrupados de um lote da Order API", function () {
  return call(
    this,
    orderService.getBatchDetails({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto os detalhes agrupados de um lote inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getBatchDetails({
        batchId: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("consulto as transacoes de um lote da Order API", function () {
  return call(
    this,
    orderService.getBatchTransactions({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto os lotes disponiveis para uma transacao da Order API",
  function () {
    return call(
      this,
      orderService.listBatchesByTransaction({ bearerToken: this.bearerToken }),
    );
  },
);

When(
  "consulto os lotes disponiveis para uma transacao inexistente na Order API",
  function () {
    return call(
      this,
      orderService.listBatchesByTransaction({
        transactionId: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("adiciono uma transacao a um lote inexistente na Order API", function () {
  return call(
    this,
    orderService.addTransactionToBatch({
      batchId: missingId(),
      transactionId: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("crio um lote na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.createBatch({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("aprovo um lote na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.approveBatch({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("reprovo um lote na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.reproveBatch({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto a lista de grupos de lotes da Order API", function () {
  return call(
    this,
    orderService.listBatchGroups({ bearerToken: this.bearerToken }),
  );
});

When("consulto os grupos pendentes de associacao da Order API", function () {
  return call(
    this,
    orderService.listPendingAssociate({ bearerToken: this.bearerToken }),
  );
});

When("consulto os detalhes de um grupo de lotes da Order API", function () {
  return call(
    this,
    orderService.getBatchGroupDetails({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto os detalhes de um grupo de lotes inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getBatchGroupDetails({
        id: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("consulto os lotes de um grupo da Order API", function () {
  return call(
    this,
    orderService.getBatchGroupBatches({ bearerToken: this.bearerToken }),
  );
});

When("consulto os lotes de um grupo inexistente na Order API", function () {
  return call(
    this,
    orderService.getBatchGroupBatches({
      id: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto o relatorio de um grupo de lotes da Order API", function () {
  return call(
    this,
    orderService.getBatchGroupReport({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto o relatorio de um grupo de lotes inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getBatchGroupReport({
        id: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("consulto os faturamentos de um grupo de lotes da Order API", function () {
  return call(
    this,
    orderService.getBillings({ bearerToken: this.bearerToken }),
  );
});

When("crio um grupo de lotes na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.createBatchGroup({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("excluo um grupo de lotes na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.deleteBatchGroup({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "aprovo um grupo de lotes no nivel negocio na Order API com corpo vazio",
  function () {
    return call(
      this,
      orderService.businessApproveBatchGroup({
        bodyOverride: {},
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "aprovo um grupo de lotes no nivel fatura na Order API com corpo vazio",
  function () {
    return call(
      this,
      orderService.invoiceApproveBatchGroup({
        bodyOverride: {},
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("removo um lote do grupo na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.removeFromBatchGroup({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("associo lotes a um grupo na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.associateBatchGroup({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "confirmo o pagamento de um grupo na Order API com corpo vazio",
  function () {
    return call(
      this,
      orderService.confirmPaymentBatchGroup({
        bodyOverride: {},
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("crio faturamentos de um grupo na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.createBillings({
      bodyOverride: [],
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "atualizo faturamentos de um grupo na Order API com corpo vazio",
  function () {
    return call(
      this,
      orderService.updateBillings({
        bodyOverride: [],
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("removo um faturamento inexistente da Order API", function () {
  return call(
    this,
    orderService.deleteBilling({
      billingId: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("crio um boleto na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.createBoleto({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto os boletos de um lote da Order API", function () {
  return call(
    this,
    orderService.listBoletosByBatch({ bearerToken: this.bearerToken }),
  );
});

When("consulto o boleto de um pedido da Order API", function () {
  return call(
    this,
    orderService.getBoletoByOrder({
      orderId: Cypress.env("orderBoletoOrderId"),
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto o boleto de um pedido inexistente na Order API", function () {
  return call(
    this,
    orderService.getBoletoByOrder({
      orderId: missingOrderId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto o comprovante do boleto de um pedido da Order API", function () {
  return call(
    this,
    orderService.getBoletoReceipt({
      orderId: Cypress.env("orderBoletoOrderId"),
      bearerToken: this.bearerToken,
    }),
  );
});

When("solicito um pix na Order API com corpo vazio", function () {
  return call(
    this,
    orderService.createPixOut({
      bodyOverride: {},
      bearerToken: this.bearerToken,
    }),
  );
});

When("crio um pix na Order API", function () {
  return call(
    this,
    orderService.createPixOut({
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto os pix de um lote da Order API", function () {
  return call(
    this,
    orderService.listPixByBatch({ bearerToken: this.bearerToken }),
  );
});

When("consulto o pix de um pedido da Order API", function () {
  return call(
    this,
    orderService.getPixByOrder({ bearerToken: this.bearerToken }),
  );
});

When("consulto o pix de um pedido inexistente na Order API", function () {
  return call(
    this,
    orderService.getPixByOrder({
      orderId: missingOrderId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("consulto o comprovante de um pix da Order API", function () {
  return call(
    this,
    orderService.getPixReceipt({ bearerToken: this.bearerToken }),
  );
});

When("consulto a lista de suppliers da Order API", function () {
  return call(
    this,
    orderService.listSuppliers({ bearerToken: this.bearerToken }),
  );
});

When("consulto o filtro de transacoes da Order API", function () {
  return call(
    this,
    orderService.filterTransactions({ bearerToken: this.bearerToken }),
  );
});

When("consulto os detalhes pix de uma transacao da Order API", function () {
  return call(
    this,
    orderService.getPixTransactionDetails({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto os detalhes pix de uma transacao inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getPixTransactionDetails({
        transactionId: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto os detalhes de bill payment de uma transacao da Order API",
  function () {
    return call(
      this,
      orderService.getBillPaymentTransactionDetails({
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto os detalhes de bill payment de uma transacao inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getBillPaymentTransactionDetails({
        transactionId: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("consulto o historico de uma transacao da Order API", function () {
  return call(
    this,
    orderService.getTransactionHistory({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto o historico de uma transacao inexistente na Order API",
  function () {
    return call(
      this,
      orderService.getTransactionHistory({
        transactionId: missingId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("cancelo uma transacao inexistente da Order API", function () {
  return call(
    this,
    orderService.cancelTransaction({
      id: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "cancelo uma transacao por um pedido inexistente da Order API",
  function () {
    return call(
      this,
      orderService.cancelTransactionByOrder({
        id: missingOrderId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "confirmo o cancelamento de uma transacao por um pedido inexistente da Order API",
  function () {
    return call(
      this,
      orderService.confirmCancelTransaction({
        id: missingOrderId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

function pickTransactionByStatus(ctx, status, type) {
  const qs = { Status: status, Limit: 20 };
  if (type) qs.Type = type;
  return orderService
    .filterTransactions({ qs, bearerToken: ctx.bearerToken })
    .then((res) => {
      const body = res.body;
      const items = Array.isArray(body)
        ? body
        : (body &&
            (body.items ||
              body.value ||
              body.data ||
              body.records ||
              body.results)) ||
          [];
      return items.find((item) => item && item.batchId) || items[0];
    });
}

function discoverTransactionByStatus(ctx, status, type) {
  return pickTransactionByStatus(ctx, status, type).then((item) => {
    ctx.resendTransactionId = item && item.id;
    ctx.resendBatchId = item && item.batchId;
    ctx.resendTransactionStatus = item && item.status;
    if (!item) {
      cy.log(
        `[resend] nenhuma transacao ${type || ""} com status "${status}" encontrada no dev.`,
      );
    }
  });
}

When(
  "descubro uma transacao Boleto com status {string} na Order API",
  function (status) {
    return discoverTransactionByStatus(this, status, "Boleto");
  },
);

When(
  "descubro uma transacao Pix com status {string} na Order API",
  function (status) {
    return discoverTransactionByStatus(this, status, "Pix");
  },
);

When("reenvio o lote da transacao descoberta na Order API", function () {
  requireContext(this, "resendBatchId");
  return call(
    this,
    orderService.resendFailedBatch({
      batchId: this.resendBatchId,
      bearerToken: this.bearerToken,
    }),
  );
});

When("reenvio o lote de uma transacao inexistente na Order API", function () {
  return call(
    this,
    orderService.resendFailedBatch({
      batchId: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("reenvio a transacao descoberta na Order API", function () {
  requireContext(this, "resendTransactionId");
  return call(
    this,
    orderService.resendTransaction({
      transactionId: this.resendTransactionId,
      bearerToken: this.bearerToken,
    }),
  );
});

When("reenvio uma transacao inexistente na Order API", function () {
  return call(
    this,
    orderService.resendTransaction({
      transactionId: missingId(),
      bearerToken: this.bearerToken,
    }),
  );
});

When("crio um lote na Order API e guardo o identificador", function () {
  return orderService
    .createBatch({ bearerToken: this.bearerToken })
    .then((response) => {
      this.response = response;
      this.batchId = check.extractBatchId(response);
    });
});

When("consulto o lote criado na Order API", function () {
  requireContext(this, "batchId");
  return call(
    this,
    orderService.getBatchById({
      batchId: this.batchId,
      bearerToken: this.bearerToken,
    }),
  );
});

function batchReady(res) {
  const p = check.extractProcessing(res);
  return p === 0 || p === undefined || p === null;
}

function waitBatchActionable(ctx, attemptsLeft) {
  return orderService
    .getBatchById({ batchId: ctx.batchId, bearerToken: ctx.bearerToken })
    .then((response) => {
      ctx.response = response;
      ctx.supplierId = ctx.supplierId || check.extractSupplierId(response);
      if (batchReady(response) || attemptsLeft <= 0) {
        return cy.wrap(response, { log: false });
      }
      cy.log(`[polling] lote processando... (${attemptsLeft} restantes)`);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000, { log: false });
      return waitBatchActionable(ctx, attemptsLeft - 1);
    });
}

When("aguardo o lote da Order API ficar pronto para acao", function () {
  requireContext(this, "batchId");
  return waitBatchActionable(this, 15);
});

const CRONJOB_POLL_INTERVAL_MS = 60000;
const CRONJOB_POLL_ATTEMPTS = 30;
const TERMINAL_TRANSACTION_STATUSES = ["Paid", "Sent", "PaymentFailed"];

function findTransactionInBatch(ctx) {
  return orderService
    .getBatchTransactions({
      batchId: ctx.resendBatchId,
      qs: { Limit: 100 },
      bearerToken: ctx.bearerToken,
    })
    .then((res) => {
      const items = (res.body && res.body.items) || [];
      return items.find((t) => t.id === ctx.resendTransactionId);
    });
}

function waitForReprocessamento(ctx, attemptsLeft) {
  return findTransactionInBatch(ctx).then((item) => {
    const status = item && item.status;
    ctx.reprocessamentoStatus = status;
    cy.log(
      `[cronjob] transacao ${ctx.resendTransactionId}: status="${status}" (${attemptsLeft} tentativas restantes)`,
    );
    if (TERMINAL_TRANSACTION_STATUSES.includes(status) || attemptsLeft <= 0) {
      return cy.wrap(status, { log: false });
    }
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(CRONJOB_POLL_INTERVAL_MS, { log: false });
    return waitForReprocessamento(ctx, attemptsLeft - 1);
  });
}

When(
  "aguardo o reprocessamento da transacao pelo cronjob da Order API",
  function () {
    requireContext(this, "resendTransactionId");
    requireContext(this, "resendBatchId");
    return waitForReprocessamento(this, CRONJOB_POLL_ATTEMPTS);
  },
);

When("reaprovo o lote reenviado na Order API", function () {
  requireContext(this, "resendBatchId");
  return call(
    this,
    orderService.approveBatch({
      overrides: {
        id: this.resendBatchId,
        supplierId: Cypress.env("orderSupplierId"),
      },
      bearerToken: this.bearerToken,
    }),
  );
});

When("aprovo o lote criado na Order API", function () {
  requireContext(this, "batchId");
  return call(
    this,
    orderService.approveBatch({
      overrides: {
        id: this.batchId,
        supplierId: this.supplierId || Cypress.env("orderSupplierId"),
      },
      bearerToken: this.bearerToken,
    }),
  );
});

function pickAvailableBatchId(ctx) {
  return orderService
    .listBatches({ qs: { Limit: 100 }, bearerToken: ctx.bearerToken })
    .then((res) => {
      const items = (res.body && res.body.items) || [];
      const available = items.find((b) => !b.batchGroupCode);
      return available && available.batchId;
    });
}

When(
  "crio um grupo de lotes na Order API com nome unico e guardo o nome",
  function () {
    this.groupName = `Grupo fluxo auto ${Date.now()}`;
    return pickAvailableBatchId(this).then((batchId) => {
      this.flowBatchId = batchId;
      if (!batchId) {
        cy.log(
          "nenhum lote sem grupo disponivel no dev - criacao seguira sem batchesId",
        );
      }
      return orderService
        .createBatchGroup({
          overrides: {
            name: this.groupName,
            batchesId: batchId ? [batchId] : [],
          },
          bearerToken: this.bearerToken,
        })
        .then((response) => {
          this.response = response;
        });
    });
  },
);

When(
  "consulto o grupo criado na Order API e guardo o identificador",
  function () {
    return orderService
      .listBatchGroups({
        qs: { Name: this.groupName },
        bearerToken: this.bearerToken,
      })
      .then((response) => {
        this.response = response;
        if (response.status === 200) {
          this.groupId = check.extractGroupIdByName(response, this.groupName);
        }
      });
  },
);

When("consulto os detalhes do grupo criado na Order API", function () {
  requireContext(this, "groupId");
  return call(
    this,
    orderService.getBatchGroupDetails({
      id: this.groupId,
      bearerToken: this.bearerToken,
    }),
  );
});

When("aprovo o grupo criado no nivel negocio na Order API", function () {
  requireContext(this, "groupId");
  return call(
    this,
    orderService.businessApproveBatchGroup({
      id: this.groupId,
      overrides: { idPo: [`PO-fluxo-${Date.now()}`] },
      bearerToken: this.bearerToken,
    }),
  );
});

When("aprovo o grupo criado no nivel fatura na Order API", function () {
  requireContext(this, "groupId");
  return call(
    this,
    orderService.invoiceApproveBatchGroup({
      id: this.groupId,
      overrides: { invoiceNumber: [`NF-fluxo-${Date.now()}`] },
      bearerToken: this.bearerToken,
    }),
  );
});

When("confirmo o pagamento do grupo criado na Order API", function () {
  requireContext(this, "groupId");
  return call(
    this,
    orderService.confirmPaymentBatchGroup({
      id: this.groupId,
      overrides: {
        creditTransactionId: [`CT-fluxo-${Date.now()}`],
        supplierId: Cypress.env("orderSupplierId"),
      },
      bearerToken: this.bearerToken,
    }),
  );
});

Then(
  "o status da resposta da Order API deve ser {int}",
  function (expectedStatus) {
    check.status(this.response, expectedStatus);
  },
);

Then(
  "o status da resposta da Order API deve ser {int} ou {int}",
  function (a, b) {
    check.statusOneOf(this.response, [a, b]);
  },
);

Then("a resposta da Order API deve respeitar o contrato paginado", function () {
  check.pagedOk(this.response);
});

Then(
  "a resposta da Order API deve indicar o vazamento do RuleEngine \\(achado de QA\\)",
  function () {
    check.ruleEngineLeak500(this.response);
  },
);

Then("a resposta da Order API deve conter um objeto", function () {
  check.detailOk(this.response);
});

Then("a resposta da Order API deve conter uma colecao", function () {
  check.listOk(this.response);
});

Then(
  "a resposta da Order API deve indicar recurso nao encontrado",
  function () {
    check.notFound(this.response);
  },
);

Then(
  "a resposta da Order API deve indicar erro de validacao pre-auth",
  function () {
    check.validationError(this.response);
  },
);

Then("o reenvio do lote deve ser aceito", function () {
  requireContext(this, "resendBatchId");
  check.resendFailedBatchOk(this.response);
});

Then(
  "os ids reenviados pelo lote devem incluir a transacao descoberta",
  function () {
    requireContext(this, "resendBatchId");
    const ids = check.extractResentTransactionIds(this.response);
    expect(ids, "resentTransactionIds[]").to.include(this.resendTransactionId);
  },
);

Then("o reenvio da transacao deve ser aceito", function () {
  requireContext(this, "resendTransactionId");
  check.resendTransactionOk(this.response);
});

Then("a transacao reenviada deve constar como {string}", function (expected) {
  requireContext(this, "resendTransactionId");
  check.transactionStatusIs(this.response, expected);
});

Then(
  "o reenvio da transacao com status divergente deve ser recusado",
  function () {
    requireContext(this, "resendTransactionId");
    check.rejected(this.response);
  },
);

Then("a reaprovacao do lote reenviado deve ser aceita", function () {
  requireContext(this, "resendBatchId");
  check.status(this.response, 200);
});

Then(
  "registro o status final da transacao apos o reprocessamento",
  function () {
    requireContext(this, "resendTransactionId");
    cy.log(
      `[cronjob] status final observado para ${this.resendTransactionId}: "${this.reprocessamentoStatus}"`,
    );
  },
);

Then("o lote deve ser criado e retornar um identificador", function () {
  check.batchCreated(this.response);
});

Then("a aprovacao do lote deve ser aceita", function () {
  requireContext(this, "batchId");
  check.batchActionOk(this.response);
});

Then("o lote criado deve constar como {string}", function (expected) {
  requireContext(this, "batchId");
  check.batchStatusIs(this.response, expected);
});

Then("a criacao do grupo deve indicar sucesso", function () {
  check.groupCreated(this.response);
});

Then("o identificador do grupo deve ser capturado", function () {
  expect(this.groupId, "groupId capturado da listagem por nome").to.be.a(
    "string",
  ).and.not.be.empty;
});

Then("a acao no grupo deve ser aceita", function () {
  requireContext(this, "groupId");
  check.groupActionOk(this.response);
});

Then("o grupo criado deve constar como {string}", function (expected) {
  requireContext(this, "groupId");
  check.groupStatusIs(this.response, expected);
});

Then("o grupo criado deve estar em processamento ou finalizado", function () {
  requireContext(this, "groupId");
  check.groupStatusOneOf(this.response, [
    "PendingProcess",
    "Processing",
    "Finished",
  ]);
});
