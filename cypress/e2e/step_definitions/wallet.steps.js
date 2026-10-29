/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { authService, walletService } from "../../support/services";
import { walletAssertions as check } from "../../support/assertions/walletAssertions";

const MISSING_UUID = "";
const missingLedgerId = () =>
  Cypress.env("walletMissingAccountingLedgerId") || MISSING_UUID;
const missingAccountId = () =>
  Cypress.env("walletMissingDigitalAccountId") || "conta-inexistente-000";

function call(world, promise) {
  return promise.then((response) => {
    world.response = response;
  });
}

Given(
  "que possuo um token de autenticacao valido para a Wallet API",
  function () {
    return authService.getWalletBearerToken().then((token) => {
      this.bearerToken = token;
    });
  },
);

When("consulto o saldo da carteira na Wallet API", function () {
  return call(
    this,
    walletService.getBalance({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto o saldo da carteira na Wallet API sem token de autenticacao",
  function () {
    return call(this, walletService.getBalance({ bearerToken: undefined }));
  },
);

When(
  "consulto o saldo da carteira na Wallet API sem a subscription key",
  function () {
    return call(
      this,
      walletService.getBalance({
        bearerToken: this.bearerToken,
        omitSubscriptionKey: true,
      }),
    );
  },
);

When(
  "consulto o saldo da carteira na Wallet API com a subscription key invalida",
  function () {
    return call(
      this,
      walletService.getBalance({
        bearerToken: this.bearerToken,
        subscriptionKeyOverride: "chave-invalida-00000000000000000000",
      }),
    );
  },
);

When(
  "consulto o saldo da carteira na Wallet API com creditStampedId inexistente",
  function () {
    return call(
      this,
      walletService.getBalance({
        bearerToken: this.bearerToken,
        creditStampedId: "999999999999",
      }),
    );
  },
);

When(
  "consulto o saldo de um accounting ledger inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getBalance({
        accountingLedgerId: missingLedgerId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto o saldo de uma digital account inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getBalance({
        digitalAccountId: missingAccountId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto o saldo bloqueado \\(on hold\\) da carteira na Wallet API",
  function () {
    return call(
      this,
      walletService.getBalanceOnHold({ bearerToken: this.bearerToken }),
    );
  },
);

When(
  "consulto o saldo bloqueado \\(on hold\\) da carteira na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getBalanceOnHold({ bearerToken: undefined }),
    );
  },
);

When(
  "consulto o saldo bloqueado \\(on hold\\) de um accounting ledger inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getBalanceOnHold({
        accountingLedgerId: missingLedgerId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto o saldo bloqueado \\(on hold\\) de uma digital account inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getBalanceOnHold({
        digitalAccountId: missingAccountId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto o saldo bloqueado \\(on hold\\) da carteira na Wallet API com creditStampedId inexistente",
  function () {
    return call(
      this,
      walletService.getBalanceOnHold({
        bearerToken: this.bearerToken,
        creditStampedId: "999999999999",
      }),
    );
  },
);

When("consulto o saldo da campanha na Wallet API", function () {
  return call(
    this,
    walletService.getCampaignBalance({ bearerToken: this.bearerToken }),
  );
});

When(
  "consulto o saldo da campanha na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: undefined,
        omitTenantId: true,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API sem o header campaignId",
  function () {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        omitCampaignId: true,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha de um accounting ledger inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getCampaignBalance({
        accountingLedgerId: missingLedgerId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API com pageNumber {int} e pageSize {int}",
  function (pageNumber, pageSize) {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        pageNumber,
        pageSize,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API com campaignId {int}",
  function (campaignId) {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        campaignId,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API sem a subscription key",
  function () {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        omitSubscriptionKey: true,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API com pageSize {int}",
  function (pageSize) {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        pageSize,
      }),
    );
  },
);

When(
  "consulto o saldo da campanha na Wallet API com pageNumber {int}",
  function (pageNumber) {
    return call(
      this,
      walletService.getCampaignBalance({
        bearerToken: this.bearerToken,
        pageNumber,
      }),
    );
  },
);

Then(
  "o status da resposta da Wallet API deve ser {int}",
  function (expectedStatus) {
    check.status(this.response, expectedStatus);
  },
);

Then(
  "o status da resposta da Wallet API deve ser {int} ou {int}",
  function (a, b) {
    check.statusOneOf(this.response, [a, b]);
  },
);

Then(
  "o status da resposta da Wallet API deve ser {int} ou {int} ou {int}",
  function (a, b, c) {
    check.statusOneOf(this.response, [a, b, c]);
  },
);

Then("a resposta da Wallet API deve seguir o schema de saldo", function () {
  check.hasBalanceSchema(this.response);
});

Then(
  "a resposta da Wallet API deve seguir o schema de saldo bloqueado",
  function () {
    check.hasBalanceOnHoldSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de saldo de campanha",
  function () {
    check.hasCampaignBalanceSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de saldo de campanha sem totalItems",
  function () {
    check.hasCampaignBalanceSchemaWithoutTotalItems(this.response);
  },
);

function removeField(body, field) {
  const clone = { ...body };
  delete clone[field];
  return clone;
}

function isValidCpf(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcCheckDigit = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return (
    calcCheckDigit(9) === Number(digits[9]) &&
    calcCheckDigit(10) === Number(digits[10])
  );
}

function discoverFromCampaignToExpire(world) {
  const body = (world.response && world.response.body) || {};
  const participants = body.participant || [];

  for (const p of participants) {
    const credits = p.creditToExpire || [];
    const withCode = credits.find((c) => c.externalCode);
    if (withCode) {
      world.walletDiscovered = {
        externalCode: withCode.externalCode,
        digitalAccountId: p.digitalAccountId,
      };
      break;
    }
  }

  const validCpfParticipant = participants.find((p) => isValidCpf(p.login));
  if (validCpfParticipant) {
    world.walletDiscovered = {
      ...world.walletDiscovered,
      participantKey: validCpfParticipant.login,
    };
  }
}

function discoverFromCampaignBalanceFallback(world, response) {
  const body = (response && response.body) || {};
  const items = body.items || [];
  const withBalance = items.find((i) => i.balance > 0);
  if (withBalance) {
    world.walletDiscovered = {
      ...world.walletDiscovered,
      digitalAccountId: withBalance.digitalAccountId,
    };
  }
}

function isInvalidTenantError(response) {
  const errors = (response && response.body && response.body.errors) || [];
  return (
    response &&
    response.status === 400 &&
    Array.isArray(errors) &&
    errors.some((e) => e.errorCode === "018")
  );
}

function depositBodyPadrao(world) {
  const discovered = (world && world.walletDiscovered) || {};
  return {
    participantKey:
      discovered.participantKey ||
      Cypress.env("walletParticipantKeyCpf") ||
      "00000000000",
    participantKeyType: "cpf",
    creditStampedId: "teste-" + Date.now(),
    amount: 0.01,
    description: "Teste automatizado",
  };
}

function createDepositAndTrack(world, extraOverrides) {
  const overrides = {
    ...(world.walletDiscovered
      ? {
          participantKey: world.walletDiscovered.participantKey,
          participantKeyType: "cpf",
        }
      : undefined),
    ...extraOverrides,
  };
  return call(
    world,
    walletService.createDeposit({ bearerToken: world.bearerToken, overrides }),
  ).then(() => {
    world.walletTransactionId = world.response.body && world.response.body.id;
    world.walletDepositDigitalAccountId =
      world.response.body && world.response.body.digitalAccountId;
  });
}

When("eu crio um deposito na Wallet API", function () {
  return createDepositAndTrack(this);
});

When(
  "eu crio um deposito na Wallet API sem token de autenticacao",
  function () {
    return call(this, walletService.createDeposit({ bearerToken: undefined }));
  },
);

When("eu crio um deposito na Wallet API sem o campo {word}", function (campo) {
  const bodyOverride = removeField(depositBodyPadrao(this), campo);
  return call(
    this,
    walletService.createDeposit({
      bearerToken: this.bearerToken,
      bodyOverride,
    }),
  );
});

When(
  "eu crio um deposito na Wallet API sem o header Idempotency-Key",
  function () {
    return call(
      this,
      walletService.createDeposit({
        bearerToken: this.bearerToken,
        omitIdempotencyKey: true,
      }),
    );
  },
);

When("eu consulto os depositos a expirar na Wallet API", function () {
  const digitalAccountId =
    this.walletDiscovered && this.walletDiscovered.digitalAccountId;
  return call(
    this,
    walletService.getDepositsToExpire({
      bearerToken: this.bearerToken,
      digitalAccountId,
    }),
  );
});

When(
  "eu consulto os depositos a expirar na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getDepositsToExpire({ bearerToken: undefined }),
    );
  },
);

When("eu consulto os depositos a consumir na Wallet API", function () {
  const digitalAccountId =
    this.walletDiscovered && this.walletDiscovered.digitalAccountId;
  return call(
    this,
    walletService.getDepositsToConsume({
      bearerToken: this.bearerToken,
      digitalAccountId,
    }),
  );
});

When("eu consulto um deposito pelo codigo externo na Wallet API", function () {
  const externalCode =
    this.walletDiscovered && this.walletDiscovered.externalCode;
  const digitalAccountId =
    this.walletDiscovered && this.walletDiscovered.digitalAccountId;
  return call(
    this,
    walletService.getDepositByExternalCode({
      bearerToken: this.bearerToken,
      externalCode,
      digitalAccountId,
    }),
  );
});

When(
  "eu consulto um deposito pelo codigo externo na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getDepositByExternalCode({ bearerToken: undefined }),
    );
  },
);

When(
  "eu consulto a campanha de depositos a expirar na Wallet API",
  function () {
    return call(
      this,
      walletService.getCampaignToExpire({
        bearerToken: this.bearerToken,
        pageSize: 100,
      }),
    ).then(() => {
      discoverFromCampaignToExpire(this);
      if (
        isInvalidTenantError(this.response) &&
        !(this.walletDiscovered && this.walletDiscovered.digitalAccountId)
      ) {
        return walletService
          .getCampaignBalance({ bearerToken: this.bearerToken, pageSize: 100 })
          .then((fallbackResponse) => {
            discoverFromCampaignBalanceFallback(this, fallbackResponse);
          });
      }
    });
  },
);

When(
  "eu consulto a campanha de depositos a expirar na Wallet API sem o header campaignId",
  function () {
    return call(
      this,
      walletService.getCampaignToExpire({
        bearerToken: this.bearerToken,
        omitCampaignId: true,
      }),
    );
  },
);

When(
  "eu consulto a campanha de depositos a expirar de um accounting ledger inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getCampaignToExpire({
        accountingLedgerId: missingLedgerId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("eu reverto o deposito recem-criado na Wallet API", function () {
  return call(
    this,
    walletService.reverseDeposit({
      transactionId: this.walletTransactionId,
      digitalAccountId: this.walletDepositDigitalAccountId,
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "eu reverto o deposito recem-criado na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.reverseDeposit({
        transactionId: this.walletTransactionId,
        digitalAccountId: this.walletDepositDigitalAccountId,
        bearerToken: undefined,
      }),
    );
  },
);

When(
  "eu reverto parcialmente o deposito recem-criado na Wallet API",
  function () {
    return call(
      this,
      walletService.reverseDepositPartial({
        transactionId: this.walletTransactionId,
        digitalAccountId: this.walletDepositDigitalAccountId,
        amount: 0.005,
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("eu importo transacoes em lote na Wallet API", function () {
  return call(
    this,
    walletService.importTransactions({ bearerToken: this.bearerToken }),
  ).then(() => {
    this.walletLotId = this.response.body && this.response.body.lotId;
  });
});

When(
  "eu importo transacoes em lote na Wallet API com corpo vazio",
  function () {
    return call(
      this,
      walletService.importTransactions({
        bearerToken: this.bearerToken,
        bodyOverride: [],
      }),
    );
  },
);

When("eu crio uma autorizacao na Wallet API", function () {
  const digitalAccountId =
    this.walletDiscovered && this.walletDiscovered.digitalAccountId;
  return call(
    this,
    walletService.createAuthorization({
      bearerToken: this.bearerToken,
      digitalAccountId,
    }),
  ).then(() => {
    this.walletTransactionId = this.response.body && this.response.body.id;
    this.walletAuthDigitalAccountId = digitalAccountId;
  });
});

When(
  "eu crio uma autorizacao na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.createAuthorization({ bearerToken: undefined }),
    );
  },
);

When(
  "eu crio uma autorizacao na Wallet API sem o header Idempotency-Key",
  function () {
    return call(
      this,
      walletService.createAuthorization({
        bearerToken: this.bearerToken,
        omitIdempotencyKey: true,
      }),
    );
  },
);

When("eu capturo a autorizacao recem-criada na Wallet API", function () {
  return call(
    this,
    walletService.captureAuthorization({
      transactionId: this.walletTransactionId,
      digitalAccountId: this.walletAuthDigitalAccountId,
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "eu capturo a autorizacao recem-criada na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.captureAuthorization({
        transactionId: this.walletTransactionId,
        digitalAccountId: this.walletAuthDigitalAccountId,
        bearerToken: undefined,
      }),
    );
  },
);

When("eu cancelo a autorizacao recem-criada na Wallet API", function () {
  return call(
    this,
    walletService.cancelAuthorization({
      transactionId: this.walletTransactionId,
      digitalAccountId: this.walletAuthDigitalAccountId,
      bearerToken: this.bearerToken,
    }),
  );
});

When("eu reverto a autorizacao recem-criada na Wallet API", function () {
  return call(
    this,
    walletService.reverseAuthorization({
      transactionId: this.walletTransactionId,
      digitalAccountId: this.walletAuthDigitalAccountId,
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "eu reverto a autorizacao recem-criada na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.reverseAuthorization({
        transactionId: this.walletTransactionId,
        digitalAccountId: this.walletAuthDigitalAccountId,
        bearerToken: undefined,
      }),
    );
  },
);

When(
  "eu reverto parcialmente a autorizacao recem-criada na Wallet API",
  function () {
    return call(
      this,
      walletService.reverseAuthorizationPartial({
        transactionId: this.walletTransactionId,
        digitalAccountId: this.walletAuthDigitalAccountId,
        amount: 0.005,
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("eu consulto o extrato da carteira na Wallet API", function () {
  return call(
    this,
    walletService.getStatements({ bearerToken: this.bearerToken }),
  );
});

When(
  "eu consulto o extrato da carteira na Wallet API sem token de autenticacao",
  function () {
    return call(this, walletService.getStatements({ bearerToken: undefined }));
  },
);

When(
  "eu consulto o extrato consolidado da carteira na Wallet API",
  function () {
    return call(
      this,
      walletService.getStatementsConsolidated({
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "eu consulto o extrato consolidado da carteira na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getStatementsConsolidated({ bearerToken: undefined }),
    );
  },
);

When("eu consulto o extrato paginado da carteira na Wallet API", function () {
  return call(
    this,
    walletService.getStatementsPaginated({ bearerToken: this.bearerToken }),
  );
});

When(
  "eu consulto o extrato paginado da carteira na Wallet API sem token de autenticacao",
  function () {
    return call(
      this,
      walletService.getStatementsPaginated({ bearerToken: undefined }),
    );
  },
);

When(
  "eu consulto o extrato paginado da carteira na Wallet API com pageNumber {int} e pageSize {int}",
  function (pageNumber, pageSize) {
    return call(
      this,
      walletService.getStatementsPaginated({
        bearerToken: this.bearerToken,
        pageNumber,
        pageSize,
      }),
    );
  },
);

When(
  "eu consulto o extrato paginado de um accounting ledger inexistente na Wallet API",
  function () {
    return call(
      this,
      walletService.getStatementsPaginated({
        accountingLedgerId: missingLedgerId(),
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When("eu consulto os depositos do tenant na Wallet API", function () {
  return call(
    this,
    walletService.getTenantDeposits({ bearerToken: this.bearerToken }),
  );
});

When(
  "eu consulto os depositos do tenant na Wallet API com um tenant divergente",
  function () {
    return call(
      this,
      walletService.getTenantDeposits({
        tenantId: "tenant-divergente-000",
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "eu consulto os depositos do tenant na Wallet API com pageNumber {int} e pageSize {int}",
  function (pageNumber, pageSize) {
    return call(
      this,
      walletService.getTenantDeposits({
        bearerToken: this.bearerToken,
        pageNumber,
        pageSize,
      }),
    );
  },
);

When("eu consulto os consumos do credito do tenant na Wallet API", function () {
  return call(
    this,
    walletService.getTenantDepositConsumptions({
      bearerToken: this.bearerToken,
    }),
  );
});

When(
  "eu consulto os consumos do credito do tenant na Wallet API com um tenant divergente",
  function () {
    return call(
      this,
      walletService.getTenantDepositConsumptions({
        tenantId: "tenant-divergente-000",
        bearerToken: this.bearerToken,
      }),
    );
  },
);

When(
  "eu consulto os consumos de um credito inexistente do tenant na Wallet API",
  function () {
    return call(
      this,
      walletService.getTenantDepositConsumptions({
        creditTransactionId: MISSING_UUID,
        bearerToken: this.bearerToken,
      }),
    );
  },
);

Then("a resposta da Wallet API deve seguir o schema de deposito", function () {
  check.hasDepositSchema(this.response);
});

Then(
  "a resposta da Wallet API deve seguir o schema de depositos a expirar",
  function () {
    check.hasDepositsToExpireSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de depositos a consumir",
  function () {
    check.hasDepositsToConsumeSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de deposito por codigo externo",
  function () {
    check.hasDepositByExternalCodeSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de campanha de depositos a expirar",
  function () {
    check.hasCampaignToExpireSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de reversao de credito",
  function () {
    check.hasCreditReversalSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de importacao de transacoes",
  function () {
    check.hasTransactionImportSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de autorizacao",
  function () {
    check.hasAuthorizationSchema(this.response);
  },
);

Then("a resposta da Wallet API deve seguir o schema de captura", function () {
  check.hasCaptureSchema(this.response);
});

Then(
  "a resposta da Wallet API deve seguir o schema de cancelamento",
  function () {
    check.hasCancellationSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de reversao de autorizacao",
  function () {
    check.hasReversalSchema(this.response);
  },
);

Then("a resposta da Wallet API deve seguir o schema de extrato", function () {
  check.hasStatementSchema(this.response);
});

Then(
  "a resposta da Wallet API deve seguir o schema de extrato consolidado",
  function () {
    check.hasStatementConsolidatedSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de extrato paginado",
  function () {
    check.hasStatementPaginatedSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de depositos do tenant",
  function () {
    check.hasTenantDepositsSchema(this.response);
  },
);

Then(
  "a resposta da Wallet API deve seguir o schema de consumos do credito do tenant",
  function () {
    check.hasTenantDepositConsumptionsSchema(this.response);
  },
);
