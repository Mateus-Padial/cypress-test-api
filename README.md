# Testes de API — sf-credits-points-admin

Suíte de testes de API em **Cypress** usando **BDD com Cucumber/Gherkin**
(`@badeball/cypress-cucumber-preprocessor`), escritos em **pt-BR**. Cobre 8
domínios do Admin Vertem e das APIs relacionadas:

| Domínio                        | Endpoint(s)                                                                                                   | Feature                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Importação de créditos         | `POST `                                                                                                       | `01_simples`, `02_com_id`, `03_completo`, `04_achados_qa`                                                            |
| Lote de crédito                | `POST/GET `, `/{id}/{approve\|reprove\|cancel}`                                                               | `05_credit_lot`                                                                                                      |
| CNAE                           | `POST `                                                                                                       | `06_cnae`                                                                                                            |
| Auditoria                      | `GET `                                                                                                        | `07_audit`                                                                                                           |
| BillPayment                    | `POST `, CRUD `/rules`, `GET /campaigns`                                                                      | `08_billpayment`                                                                                                     |
| PixOut                         | `POST `, CRUD `/rules`, `GET /installment`, `/campaigns`                                                      | `09_pixout`                                                                                                          |
| **Order API**                  | 41 endpoints: `, `, `, `, `, `                                                                                | `10_order_batch`, `11_order_recursos`, `12_order_fluxo`                                                              |
| **Wallet (Accounting Ledger)** | Balance, Credit/Deposit/Reversal/Import, Authorization/Capture/Cancellation/Reversal, Statement, TenantCredit | `13_wallet_balance`, `14_wallet_credit`, `15_wallet_authorization`, `16_wallet_statement`, `17_wallet_tenant_credit` |

Os domínios credit-lot, CNAE, Audit, BillPayment, PixOut, Order e Wallet rodam
contra hosts próprios (fora do `baseUrl` do Admin) e usam autenticação via
`client_credentials`. Os 3 primeiros (`01`–`04`) validam o upload de CSV do
Admin (``).

> **Order API (10/11) — estado:** estrutura/contrato inicial. O token do admin
> **não é aceito** (aud incompatível → `401` em todos os endpoints); exige
> `orderTokenClientId/Secret` próprios + massa real. Ver
> [Order API](#order-api-1011--sffinancialserviceorder).

> **Wallet — TenantCredit (17) — estado:** todo o grupo retorna `403 Forbidden`
> (formato de API Management/gateway) — a subscription key atual não tem
> acesso liberado a este produto no APIM, independente de tenant/crédito
> válidos. Ver [Wallet](#wallet-13-17--accounting-ledger-transactional-api).

## Sumário

- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Como rodar](#como-rodar)
- [O que cada suíte valida](#o-que-cada-suíte-valida)
  - [Wallet (13–17) — Accounting Ledger Transactional API](#wallet-1317--accounting-ledger-transactional-api)
- [Como a suíte funciona (arquitetura)](#como-a-suíte-funciona-arquitetura)
- [Tags e filtros](#tags-e-filtros)
- [Evidências e relatórios](#evidências-e-relatórios)
- [Achados de comportamento real (divergências do contrato)](#achados-de-comportamento-real-divergências-do-contrato)
- [Qualidade de código (lint/format)](#qualidade-de-código-lintformat)
- [Melhorias conhecidas / pendências](#melhorias-conhecidas--pendências)
- [Rodando no Azure DevOps](#rodando-no-azure-devops)
- [Troubleshooting](#troubleshooting)

## Estrutura do projeto

```
cypress/
  e2e/
    features/                       # cenarios Gherkin (pt-BR)
      00_smoke.feature              # contrato de sucesso/erro de  + health
      01_simples.feature            # layout login;nome;descricao;valor
      02_com_id.feature             # layout id;login;nome;descricao;valor
      03_completo.feature           # layout id;login;nome;descricao;valor;expiracao;origem
      04_achados_qa.feature         # @achado-qa: negativos que a API aceita indevidamente
      05_credit_lot.feature         # POST  + acoes (approve/reprove/cancel)
      06_cnae.feature               # POST
      07_audit.feature              # GET
      08_billpayment.feature        # POST  + CRUD de regras + campanhas
      09_pixout.feature             # POST  + CRUD de regras + parcelamento + campanhas
      10_order_batch.feature        # Order API: Batch + BatchGroup (lotes e grupos)
      11_order_recursos.feature     # Order API: billings, boleto, pix, supplier, transaction
      12_order_fluxo.feature.skip   # Order API: fluxo de vida do lote (criar -> aprovar) - EM SKIP
      13_wallet_balance.feature        # Wallet: saldo (Balance/on hold/campanha)
      14_wallet_credit.feature         # Wallet: Deposit/Reversal/Transactions import
      15_wallet_authorization.feature  # Wallet: Authorization/Capture/Cancellation/Reversal
      16_wallet_statement.feature      # Wallet: extrato (por periodo/consolidado/paginado)
      17_wallet_tenant_credit.feature  # Wallet: depositos por tenant (bloqueado no APIM - ver secao)
    step_definitions/
      hooks.js                      # screenshot pos-cenario (so no modo headless)
      health.steps.js
      validate_file.steps.js
      credit_lot.steps.js           # inclui polling do status do lote
      cnae.steps.js
      audit.steps.js
      billpayment.steps.js
      pixout.steps.js
      order.steps.js                # Order API (1 step por endpoint)
      wallet.steps.js                # Wallet (1 step por endpoint, 5 features)
  support/
    services/                       # 1 modulo por dominio: monta request e chama a API
      authService.js                # gera bearerToken (admin / CNAE / Validation / Order / Wallet)
      healthService.js
      fileValidationService.js
      creditLotService.js
      cnaeService.js
      auditService.js
      billPaymentService.js
      pixOutService.js
      orderService.js               # Order API (1 metodo por endpoint)
      walletService.js               # Wallet (1 metodo por endpoint)
      index.js                      # barrel export
    assertions/                     # 1 modulo por dominio: valida contrato/shape da resposta
      common.js                     # primitivas (status, statusOneOf, etc)
      validationCommon.js           # helpers compartilhados por audit/billPayment/pixOut
      orderCommon.js                # envelopes da Order API (BooleanErrorOr/Paged) - provisorio
      fileValidationAssertions.js
      creditLotAssertions.js
      cnaeAssertions.js
      auditAssertions.js
      billPaymentAssertions.js
      pixOutAssertions.js
      orderAssertions.js
      walletAssertions.js            # schemas da Wallet - varios ainda so checam "e objeto" (ver Pendencias)
    core/
      apiClient.js                  # nucleo unico de requisicao (cy.request / cy.task)
      httpHeaders.js                # helpers de auth compartilhados (Bearer, api-version, Tenant-Id)
    evidence/
      renderApiPanel.js             # painel de evidencia (method/URL/status/body) no DOM
    utils/
      mask.js                       # mascara token/host nos logs e evidencias
      randomUuid.js                 # UUID v4 aleatorio (id "sabidamente inexistente" sem massa)
    constants/
      endpoints.js                  # paths e URLs (com override via env)
      errorCodes.js
    commands.js                     # cy.validateFile() - wrapper legado, ver comentario no arquivo
    e2e.js
cenarios_importacao_creditos/       # massa de testes (.csv) - positivos e negativos
docs/
  achados/                          # achados de QA por dominio (ver secao dedicada abaixo)
scripts/
  gerar-relatorio.js                # cucumber-report.json -> relatorio HTML navegavel
  exportar-checklist.js             # cucumber-report.json -> checklist-import.json
  abrir.js                          # abre relatorio/checklist/pasta de evidencias no SO
cypress.config.js                   # setup, plugins, carregamento de .env/.env.ci
eslint.config.js                    # ESLint 10 (flat config) + eslint-plugin-cypress
azure-pipelines.yml                 # pipeline de CI (Azure DevOps)
package.json
```

## Pré-requisitos

- Node.js na versão do `.nvmrc` (mínimo `engines.node` do `package.json`; testado com v22)
- Acesso aos ambientes de dev/hml da Vertem (para os testes que fazem chamadas
  reais de API)
- Credenciais (ver [Configuração](#configuração)):
  - Um token JWT válido do header `authorization-vertem-servico-financeiro`
    (endpoint ``)
  - Um JWT de serviço para ``
  - `client_id`/`client_secret` de 2 a 3 pares `client_credentials`
    (admin, CNAE, e opcionalmente Validation)

## Configuração

O projeto carrega variáveis de 3 fontes, por ordem crescente de prioridade:

1. **`.env.ci`** — valores **não-sensíveis**, versionados no repositório. Base
   comum para qualquer ambiente (dev/CI).
2. **`CYPRESS_*`** — variáveis de ambiente do processo (usadas no CI/Azure).
3. **`.env`** — segredos/overrides **locais**, git-ignored.

Além disso, o Cypress também lê `cypress.env.json` (git-ignored) com prioridade
ainda maior que `.env` — hoje é onde os segredos e alguns dados de massa reais
ficam na máquina do desenvolvedor.

**Passo a passo:**

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure os segredos. Duas opções (pode combinar):

   **a) `cypress.env.json`** (git-ignored):

   ```bash
   cp cypress.env.json.example cypress.env.json
   # edite cypress.env.json e preencha authToken, servicoFinanceiroToken,
   # tokenClientId/Secret, cnaeTokenClientId/Secret etc.
   ```

   **b) `.env`** (git-ignored):

   ```bash
   cp .env.example .env
   # edite .env e preencha os mesmos segredos
   ```

   **c) variáveis de ambiente** (útil em CI):

   ```bash
   export CYPRESS_authToken="..."
   ```

3. Os dados não-sensíveis (URLs de ambiente, ids de campanha/catálogo de
   teste, etc.) já vêm preenchidos em `.env.ci`. Ajuste esse arquivo se for
   mudar de ambiente (dev → hml, por exemplo).

> Cadastrando no Azure DevOps? Veja [Rodando no Azure DevOps](#rodando-no-azure-devops).

## Como rodar

```bash
npm run open                # modo interativo (Cypress)
npm test                     # todas as features + relatorio HTML + checklist

# por layout de importacao de creditos
npm run test:smoke
npm run test:simples
npm run test:com-id
npm run test:completo

# por tipo (importacao de creditos)
npm run test:regra           # so a regressao (ignora @achado-qa)
npm run test:achados         # so os achados de QA

# credit-lot / CNAE / audit / billpayment / pixout
npm run test:credit-lot
npm run test:cnae
npm run test:cnae-contrato   # so contrato, sem @requer-massa
npm run test:audit
npm run test:billpayment
npm run test:pixout

# Order API
npm run test:order            # suite da Order (verde; fluxos ja em SKIP, nem entram)
npm run test:order-contrato   # so o que nao depende de massa (listas + negativos)
npm run test:order-batch      # so Batch + BatchGroup
npm run test:order-recursos   # so billings/boleto/pix/supplier/transaction
npm run test:order-fluxo      # EM SKIP (12_order_fluxo.feature.skip) - ver secao "Fluxos de vida"
npm run test:order-resend     # ISOLADO (~25-30min) - resend + reprocessamento pelo cronjob

# Wallet (Accounting Ledger Transactional API)
npm run test:wallet               # so Balance (13)
npm run test:wallet-credit        # so Credit/Deposit/Reversal/Import (14)
npm run test:wallet-authorization # so Authorization/Capture/Cancellation/Reversal (15)
npm run test:wallet-statement     # so Statement (16)
npm run test:wallet-tenant        # so TenantCredit (17) - hoje 403 (ver secao Wallet)
npm run test:wallet-full          # tudo com a tag @wallet (13 a 17)

# evidencias / export
npm run relatorio            # regera o relatorio HTML
npm run relatorio:abrir      # abre o relatorio no navegador
npm run checklist            # regera o checklist-import.json
npm run checklist:abrir      # abre o checklist
npm run evidencias           # abre a pasta cypress/reports
npm run limpar                # apaga cypress/reports

# lint / formatacao
npm run lint                 # ESLint (cypress/**, eslint.config.js)
npm run lint:fix              # ESLint com autofix
npm run format                # Prettier --write em todo o repo
npm run format:check          # Prettier --check (usado no CI)
```

Rodar uma feature específica sem script dedicado (Order recursos):

```bash
npx cypress run --spec "cypress/e2e/features/11_order_recursos.feature"
```

### Política de retries e escrita

A suíte desabilita retries automáticos no modo `run` porque vários cenários
fazem operações mutáveis (criação de lotes, depósitos, autorizações e
reversões). Repetir automaticamente uma operação após timeout pode duplicar
registros ou alterar o estado do ambiente novamente. Para reexecutar um
cenário, faça isso de forma explícita depois de verificar o estado criado.

### Configuração no CI

No CI, as variáveis `CYPRESS_*` do processo têm prioridade sobre `.env.ci` e
`.env` não é carregado. Isso evita que um arquivo local do agente sobrescreva
credenciais, URLs ou massa configuradas no pipeline. Localmente, `.env` pode
sobrescrever os valores-base de `.env.ci`.

Para apontar para outro ambiente:

```bash
npx cypress run --config baseUrl=
# a Validation API, o CNAE e os endpoints de token tem host proprio -
# sobrescreva via env (validationBaseUrl, cnaeBaseUrl, tokenUrl, etc), ver .env.ci.
```

## O que cada suíte valida

### Importação de créditos (`00`–`04`) — `POST `

Recebe um arquivo `.csv` via `multipart/form-data`, valida estrutura, tabelas e
valores, e retorna um `summary` + `validationDetails`.

Campos do multipart:

- **`File`** — o arquivo `.csv`
- **`PointsConversionRate`** — taxa de conversão pontos/moeda (`ConversionRate`
  errado causa `400 "Attempted to divide by zero."`)
- **`LoginTypeId`** — `1` = CPF, `2` = CNPJ (tradicional e alfanumérico)

Contrato de resposta:

- **Sucesso:** `200` + `success:true` + `data.summary` +
  `data.validationDetails.isValid:true`.
- **Erro de validação:** `400` + `success:false` + `data.validationDetails`
  com `errorCount`/`errorsByLine` (`line`, `message`, `code`, ex.: `INVALID_HEADER`).
- **Erro de request** (arquivo vazio): `400` + `success:false` **sem** `data`.

O que é testado:

- `00_smoke` — contrato de sucesso, contrato de erro (`INVALID_HEADER`), health
  liveness/readiness.
- `01_simples` / `02_com_id` / `03_completo` — todos os positivos e negativos
  de cada layout (`Esquema do Cenário` data-driven, um `.csv` por linha da
  tabela `Exemplos`), mais os casos de contrato "só cabeçalho"/"emoji" tratados
  separadamente.
- `04_achados_qa` (`@achado-qa`) — arquivos que **deveriam** ser rejeitados mas
  a API aceita. Testes de caracterização: passam hoje, quebram quando a regra
  for corrigida. Detalhes em [docs/achados/file-validate.md](docs/achados/file-validate.md).

O upload roda via `cy.task("uploadCsv")` (Node, não browser) para preservar os
bytes exatos do arquivo (BOM, UTF-16, ISO-8859-1) — montar o multipart no
browser corromperia esses encodings por re-encode UTF-8.

### Lote de crédito (`05_credit_lot`) — `POST `

Fluxo completo: criar lote a partir de um `.csv` válido → aguardar o status
ficar pronto (polling) → executar ações (`approve`/`reprove`/`cancel`).

O que é testado:

- Criação de lote com arquivo válido, captura do `CreditLotId`, consulta de
  status.
- Criação recusada (400) para arquivos estruturalmente inválidos.
- Cada ação isolada aceita (200) sobre um lote recém-criado.
- Combo de redecisão: aprovar → reprovar o mesmo lote (permitido).
- Transição inválida: uma terceira ação encadeada (aprovar → reprovar →
  cancelar) é recusada (400).
- **Observação de comportamento:** cancelamento só é aceito enquanto o lote
  não foi aprovado; cancelar após aprovar retorna 400. Por isso o
  cancelamento é testado isoladamente sobre o lote recém-criado, não como
  combo após aprovação.

### CNAE (`06_cnae`) — `POST `

Valida um documento (CNPJ) contra o catálogo de CNAEs elegíveis.

Contrato: `ValidateCnaeResponseErrorOr { isError, errors[], value: { valid,
campaingName, document } }`.

O que é testado:

- Documento válido do catálogo (`@requer-massa`) → 200, `valid:true`, resposta
  ecoa o documento enviado.
- Requisição sem `document` / corpo vazio / documentos malformados (curto
  demais, não-numérico, DV inválido, com máscara) → `200` ou `400` conforme o
  comportamento observado (fixado como contrato atual).

### Auditoria (`07_audit`) — `GET `

Consulta o histórico de operações de regras (BillPayment/PixOut).

Contrato: `{ summary: { totalRecords, pageNumber, pageSize, totalPages,
hasPreviousPage, hasNextPage }, logs: [...] }`.

Filtros (todos opcionais): `CampaignId`, `CatalogId`, `UserEmail`,
`EntityType` (`BILL_PAYMENT_RULES`|`PIX_RULES`), `OperationType`
(`CREATE`|`UPDATE`|`DELETE`), `Success`, `StartDate`, `EndDate`, `PageNumber`,
`PageSize`.

O que é testado:

- Consulta com filtros válidos (`@requer-massa`) → 200 paginado, contrato do
  log.
- Consulta sem filtros → 200 com lista vazia (comportamento atual,
  `@caracterizacao`).
- Valores inválidos para filtros enumerados (`EntityType`, `OperationType`,
  `Success`) e paginação inválida (`PageNumber` negativo) → `200` ou `400`.

> O endpoint é lento no ambiente dev (~30s); os services usam timeout
> generoso para não estourar por lentidão de infraestrutura.

### BillPayment (`08_billpayment`) — `POST ` + CRUD de regras

Valida um boleto contra as regras da campanha/catálogo, e expõe CRUD das
regras (criar/consultar/atualizar/deletar) e listagem paginada de campanhas.

O que é testado:

- Validação de boleto válido → 200, `{valid:true, ...}`.
- Consulta de regras configuradas → 200, shape `{minValue, maxValue,
quantityPerDay, ...}`.
- CRUD completo (criar → atualizar → deletar) num par campanha/catálogo
  dedicado ao teste (não colide com massa de leitura).
- Criar regras duplicadas → 400 do Rule Engine ("já existem") — **não** 409
  como o swagger sugeria.
- Atualizar regras inexistentes → 400 — **não** 404 como o swagger sugeria.
- `@caracterizacao`: paymentAmount elevado pode estourar limite acumulado
  (400) ou passar (200), dependendo do estado do ambiente; consulta de regras
  inexistentes → 400 do Rule Engine; listagem paginada de campanhas.
- Negativos de contrato: sem `barCode`/`campaignId`, corpo vazio, criar sem
  `userEmail`, deletar sem `campaignId`.

### PixOut (`09_pixout`) — `POST ` + CRUD de regras + parcelamento

Mesma estrutura do BillPayment, para validação de chave PIX.

O que é testado:

- Validação PIX válida → 200, `{valid:true, pixKey, amount, ...}`.
- Consulta de parcelamento configurado → 200, `{installmentDailylimit,
transactionLimit, amount, dailyPaymentPlan[]}`.
- CRUD completo de regras PIX (par dedicado ao teste).
- Criar regras duplicadas / atualizar inexistentes → 400 do Rule Engine (não
  409/404).
- `@caracterizacao`: consulta de regras sem regra cadastrada, validação sem
  massa, parcelamento de campanha inexistente, listagem paginada de campanhas.
- Negativos de contrato: sem `pixKey`, `keyType` inválido, `projectId`
  não-UUID, criar sem `userEmail`, deletar sem `campaignId`.

### Order API (`10`/`11`) — `SF.FinancialService.Order`

Cobre os **41 endpoints** do swagger
(``),
em 6 grupos:

| Grupo           | Endpoints                                                                                                                                                                                                                                          | O que é                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Batch**       | `POST/GET `, `PUT /approve` `/reprove` `/{batchId}/resend-failed`, `GET /{batchId}` `/details` `/transactions`, `PUT /{batchId}/transactions/{transactionId}`, `GET /batches/transactions/{transactionId}`                                         | Lotes de boletos/pix          |
| **BatchGroup**  | `POST/DELETE/GET `, `PUT /{id}/business-approve` `/invoice-approve` `/remove` `/associate` `/confirmed-payment`, `GET /{id}/report` `/details` `/batches`, `POST/GET/PUT /{id}/billings`, `DELETE /billings/{billingId}`, `GET /pending-associate` | Grupos de lotes + faturamento |
| **Boleto**      | `POST `, `GET /{batchId}` `/order/{orderId}` `/receipt/{orderId}`                                                                                                                                                                                  | Pagamento de boleto           |
| **Pix**         | `POST `, `GET /{batchId}` `/order/{orderId}` `/receipt/{transactionId}`                                                                                                                                                                            | Pagamento de pix              |
| **Supplier**    | `GET `                                                                                                                                                                                                                                             | Suppliers (paginado)          |
| **Transaction** | `GET /{id}/pix/details` `/bill-payment/details` `/history`, `PUT /{id}/cancel` `/cancel/{id}/order` `/confirm-cancel/{id}` `/{transactionId}/resend`, `GET /filter`                                                                                | Transações                    |

**Estado atual: autenticada e rodando contra o dev real (52 cenários verdes em
`test:order`).** A suíte bate na Order de verdade com **asserções estritas**:
cenário positivo espera retorno positivo (`200`/`201`), cenário negativo espera
retorno negativo (`400`). Nada de banda "aceita qualquer status" — se quebrar,
você vê na hora.

1. **Autenticação (resolvida):** o client/secret da Order são **os mesmos do
   CNAE** (identity-dev, campo `scopes`, aud `sf-financial-services-apis`). O
   `getOrderBearerToken()` **reusa o token do CNAE** por padrão — basta ter
   `cnaeTokenClientId`/`cnaeTokenClientSecret` configurados (não precisa de
   `orderTokenClientId/Secret`, que só existiriam se a Order um dia tiver
   credenciais próprias). O token do **admin não é aceito** (aud
   `walletgatewaysemparar`/`eng/api-gateway` → `401`).
2. **Massa (descoberta do dev):** ids reais lidos do próprio dev e commitados
   em `.env.ci` (`orderBatchId`, `orderTransactionId` **Boleto**,
   `orderPixTransactionId` **Pix**, `orderGroupId`, `orderOrderId` Pix,
   `orderBoletoOrderId` Boleto, `orderSupplierId`, `orderClientId=1`,
   `orderCampaignId=1`). **Falta descobrir:** `orderBillingId`, `orderCatalogId`,
   `orderProjectId`, um lote do tipo **Pix** e um lote **disponível** p/ o fluxo.

**Contrato confirmado no dev (positivo = `200`/`201`, negativo = `400`):**

- **"Não encontrado" retorna `400`** (não `404`) — id inexistente/inválido.
- **Listagens paginadas** → envelope **`{total, count, items[]}`**. Exceção:
  `GET ` devolve a **lista crua** (array na raiz).
- **`POST `** valida o corpo **antes** da autenticação → corpo vazio
  dá `400` com `{status, errors:[{code}]}` (`BarCode`, `PaymentAmount`,
  `PayerDocument`, `ClientId`, `CampaignId`, `CatalogId`, `OrderNumber`).
- **`POST `** sem transações elegíveis no filtro → `400`
  `SF.FinancialService.Order.RuleEngine.Api` ("Nenhum registro encontrado!").
- **Caracterizações** (`@caracterizacao`, esperam `400` por falta de massa que
  dê sucesso — viram `200` quando houver): comprovantes (receipt) exigem
  pagamento já confirmado; `GET billings` do grupo conhecido → `400`;
  `GET /pix/out/{batchId}` com lote **Boleto** → `400` (não há lote Pix no dev).

**Escritas são testadas como negativo (não mutam o dev):** criar/aprovar/
associar/confirmar/cancelar com **corpo vazio** ou **id inexistente** → `400`.
O caminho positivo de escrita fica só nos fluxos, hoje **em SKIP** (veja abaixo).

### Fluxos de vida (`12_order_fluxo.feature.skip`) — EM SKIP

Os dois fluxos E2E (lote e grupo) ficam **desativados de propósito**: o arquivo
foi renomeado para `12_order_fluxo.feature.skip`, então o Cypress **nem
enumera** o spec (`specPattern` só casa `*.feature`) — não tem tag nem `--env`
que ligue ele por acidente em nenhum comando (`npm test`, `test:order`, CI,
etc.). `npm run test:order-fluxo` só imprime o motivo e falha (`exit 1`), pra
quem tentar rodar não confundir com "0 testes = passou".

**Por que skip, e não tag:** a lógica dos dois fluxos já está **validada e
correta** (confirmado via chamadas diretas à API, passo a passo). O bloqueio é
só falta de massa "fresca" no dev, e **essa massa não é permanente** — cada
execução bem-sucedida consome o que usou (lote associado a um grupo não tem
volta). Uma tag (`@requer-massa`) dá a falsa impressão de "só falta configurar
um id uma vez"; skip deixa claro que é uma decisão consciente até haver uma
solução melhor (ex.: endpoint de setup dedicado, ambiente próprio de teste) ou
decidirmos descontinuar esses dois cenários.

**As duas dependências colapsam em uma só:** o fluxo de lote cria o lote do
zero (`POST `); todo lote recém-criado nasce **sem grupo**. Então se
o time gerar a massa que o fluxo de LOTE precisa, o fluxo de GRUPO também fica
desbloqueado — não precisa pedir duas coisas separadas.

**O que falta no dev:** transações do tipo **Boleto** no status **`Captured`**
(capturada, ainda sem lote). Confirmado em 2026-07-24 que isso é zero no dev
inteiro (nas 5 transações Boleto existentes: 3 `Canceled`, 1 `Paid`, 1
`AssociatedToBatch` — nenhuma `Captured`), mesmo testando o período mais amplo
possível (2020–2027) e sem filtro de cliente/campanha — `POST ` dá
`400 "Nenhum registro encontrado!"` de qualquer forma. Existem 62 transações
**Pix** `Captured`, mas não contam para esse endpoint (ele não achou nada
mesmo com o período ajustado para cobri-las).

- **Lote (Batch):** criar → guardar `id` → consultar detalhe (lê o `supplier`
  do próprio lote) → polling até sair do processamento → aprovar → conferir
  `status: "Aprovado"`.
- **Grupo (BatchGroup):** descobre em runtime um lote **sem grupo**
  (`GET `, item com `batchGroupCode` vazio — não usa `orderBatchId`
  fixo, porque cada execução bem-sucedida "consome" um lote e não há como
  desfazer) → cria o grupo com esse lote → **business-approve** (com um `idPo`
  novo) → **invoice-approve** (com um `invoiceNumber` novo) →
  **confirmed-payment** (com um `creditTransactionId` novo + `orderSupplierId`).
  **Lógica validada por chamadas diretas em 2026-07-24** (confirmado:
  `business-approve`/`invoice-approve`/`confirmed-payment` aceitam `200` com
  listas vazias mas **não avançam o status** — exigem valores não-vazios de
  verdade; e o `supplier` do lote/grupo **nunca** vem preenchido, por isso o
  `supplierId` vem fixo do env). Máquina de estados **confirmada**:
  `PendingBusinessApproval → PendingBilling → PendingCreditTransaction →
PendingProcess/Processing → Finished`.

> **Efeito colateral já ocorrido:** validar a lógica do fluxo de grupo consumiu
> os 8 lotes que estavam sem grupo no dev (associados a grupos de teste reais,
> sem volta — `DELETE` recusa depois de qualquer aprovação: `"grupo já está em
processamento"`). Confirmado sem impacto financeiro (`totalAmount: 0` em
> todos).
>
> **Atenção (efeito colateral real, ao reativar):** quando a massa permitir,
> esses dois fluxos **criam e movimentam dados de verdade no dev** (criam
> lote/grupo, aprovam, confirmam pagamento) — são operações de escrita, não
> só leitura.

**Para reativar:**

1. Time gerar transações Boleto `Captured` no dev (desbloqueia os dois fluxos
   de uma vez, ver acima).
2. Renomear `12_order_fluxo.feature.skip` de volta para `12_order_fluxo.feature`.
3. Restaurar `test:order-fluxo` em `package.json` para
   `cypress run --env tags=@fluxo`.
4. Rodar `npm run test:order-fluxo` — a lógica já está validada, deve passar
   de primeira.

**Próximos passos (não bloqueados pelo skip):**

1. Descobrir `orderBillingId`, `orderCatalogId`, `orderProjectId` (massa ainda
   não localizada) para os cenários `@caracterizacao`/`@requer-massa` de 10/11.

### Resend e reprocessamento pelo cronjob (`18_order_resend_reprocessamento.feature`)

Cobre a recuperação de transações com falha de pagamento (`TransactionStatus.
PaymentFailed`), reenviando-as para o cronjob de processamento:

- **`PUT `** — reenvia **todas** as
  transações com falha do lote de uma vez. `200 ResendFailedBatchResponseDto
{id, status (BatchStatus), resentTransactionIds[]}`. Cenário de contrato
  (rápido) em `10_order_batch.feature`.
- **`PUT `** — reenvia **uma**
  transação específica. `200 TransactionResponseDto {id, code, status
(TransactionStatus), updatedBy, updatedAt}`. Cenários de contrato (rápidos)
  em `11_order_recursos.feature`, incluindo um cenário que verifica se a API
  **recusa** (`400`) reenviar uma transação que não está em `PaymentFailed`
  — se aceitar (`200`), é achado de QA a reportar ao time.

Ambos descobrem a massa **em runtime** via
`GET ` (mesmo princípio da
descoberta dinâmica usada na Wallet, ver `campaign-to-expire`) em vez de
depender de um id fixo no `.env.ci` — a massa aqui é transiente (reenviar/
reprocessar muda o status da transação usada).

**Fluxo completo (feature 18, isolada):** reenviar → reaprovar o lote (`PUT
`) → aguardar o cronjob processar (**~25 min no ambiente**)
→ conferir o status final. Fica **fora de qualquer comando sem `--spec`
explícito** (`npm test`, `test:order`, `cypress open`) via `excludeSpecPattern`
no `cypress.config.js` — só roda com `npm run test:order-resend`. O polling
usa intervalo de 60s (até 30 tentativas, teto de 30min), bem mais longo que o
polling normal da suíte (2s), para não gerar centenas de requests numa espera
tão longa.

> **Não confirmado ainda:** se `PUT ` aceita reaprovar um
> lote que já foi aprovado antes (o lote só tem transação `PaymentFailed`
> porque já foi processado uma vez). A 1ª execução real contra o dev vai
> esclarecer; se a reaprovação for rejeitada, o resend pode já ser
> suficiente para reenfileirar sem precisar de approve de novo.
>
> **Confirmação definitiva do resultado** (se o job de fato persistiu o
> pagamento) depende de acesso a banco, ainda pendente de validação com o
> time (ver `CLAUDE.md`). O cenário confirma via API (`GET .../transactions`)
> o status observado após a janela de polling e registra no log/evidência
> para conferência manual — não é uma confirmação via banco.
>
> **Sobre os status numéricos (5/3):** o swagger só expõe os enums como
> string (`TransactionStatus`: `Captured, AssociatedToBatch,
AwaitingProcessing, Processing, PaymentFailed, PendingCancellation,
CancellationFailed, Paid, Sent, Canceled`). Não há campo numérico na API —
> a correspondência com inteiros é inferência pela posição do enum, não
> confirmada.

### Wallet (13–17) — Accounting Ledger Transactional API

Cobre a **Wallet Transactional API** (host próprio, `walletBaseUrl`/
`walletHostUrl`), que roda em **HML** — não em dev como o swagger público
(``) sugere. Auth: Bearer JWT próprio
(`getWalletBearerToken`, `client_credentials` com o campo `scopes`) + header
`Ocp-Apim-Subscription-Key` (API Management na frente da API, não documentado
no swagger). O token do **admin não é aceito** (`401 "Invalid Tenant"`).

| Feature                   | Endpoints                                                                                              | Escopo                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `13_wallet_balance`       | `GET .../balances`, `/balances/onhold`, `/balances/campaign`                                           | Saldo (total, bloqueado, agregado por campanha)          |
| `14_wallet_credit`        | `POST .../payments/deposit`, `GET .../deposits/*`, `POST .../reversal`, `POST .../transactions/import` | Depósito, reversão (total/parcial), import em lote       |
| `15_wallet_authorization` | `POST .../authorizations`, `/capture`, `/cancellation`, `/reversal`                                    | Autorização de pagamento e captura/cancelamento/reversão |
| `16_wallet_statement`     | `GET .../statements`, `/statements/consolidated`, `/statements/paginated`                              | Extrato (por período, consolidado, paginado)             |
| `17_wallet_tenant_credit` | `GET `, `.../deposits/{id}/consumptions`                                                               | Depósitos por tenant — **hoje bloqueado, ver abaixo**    |

O que é testado:

- **Balance (13)** — saldo com ids válidos (`@requer-massa`), sem token
  (`401`), ledger/conta inexistente no on-hold (`404`). `@achado-qa`: a
  `Ocp-Apim-Subscription-Key` não é validada de fato (qualquer valor dá
  `200`); `creditStampedId` inexistente é aceito e ignorado; paginação da
  campanha com `pageNumber >= 2` perde `totalItems`/`totalBalance` no corpo;
  `campaignId`/`Tenant-Id` não são validados contra o token (sempre agrega o
  ledger inteiro); `pageSize`/`pageNumber` inválidos não são rejeitados
  (exceto `pageSize > 1000`, que passou a dar `400` em 2026-08-12).
- **Credit (14)** — massa descoberta dinamicamente via
  `GET .../deposits/campaign-to-expire` (evita depender de ids fixos do
  `.env` sem saldo suficiente). Depósito válido (`@wallet-write
@requer-massa`), sem token (`401`), campo/header obrigatório ausente
  (`400` ou `422`, tolerante até confirmar contrato oficial). Reversão total
  e parcial de um depósito recém-criado (`201`). Import de transações em
  lote válido e com corpo vazio.
- **Authorization (15)** — mesma descoberta de massa via
  campaign-to-expire (a conta fixa do `.env` não tem saldo). Criar
  autorização, capturar, cancelar, reverter (total/parcial). **Achado:**
  reversão de autorização **não capturada** é rejeitada (`400` "must be
  fully or partially captured to be reversed") — captura sempre precede a
  reversão nos cenários. `POST .../authorizations/composed` está no swagger
  de HML mas retorna `404` com corpo vazio (indício de rota não implantada).
- **Statement (16)** — extrato por período, consolidado e paginado
  (`@requer-massa`), sem token (`401`), ledger inexistente no paginado
  (`404`). `startDate`/`endDate` são `nullable` no swagger mas exigidos de
  fato, com limite de diferença `< 365` dias (não documentado).
- **TenantCredit (17)** — path base diferente
  (``, mesmo host raiz). **Achado bloqueante:**
  todo o grupo retorna `403 {"message":"Forbidden"}` (formato de gateway,
  não de negócio) — a subscription key atual não tem acesso liberado a este
  produto no APIM, independente de tenant/crédito válidos ou não. Os
  cenários documentam esse `403` observado; falta confirmar com o time se a
  key precisa de acesso liberado.

Detalhes completos (payloads, schemas, achados por endpoint) em
[docs/achados/wallet-balance.md](docs/achados/wallet-balance.md) e
[docs/achados/wallet-credit-auth.md](docs/achados/wallet-credit-auth.md).

## Como a suíte funciona (arquitetura)

Cada domínio segue o mesmo padrão em 3 camadas:

```
step_definitions/*.steps.js   Given/When/Then em pt-BR, finos - so orquestram
        |
support/services/*.js         monta o request (URL, headers, body/qs) e chama
        |                      apiClient
support/assertions/*.js       valida o contrato/shape da resposta (1 funcao =
                               1 fato de negocio)
```

- **`apiClient` (`support/core/apiClient.js`)** é o núcleo único de
  requisição: todo service passa por ele. Usa `cy.request` (JSON,
  `failOnStatusCode:false`, para poder testar 4xx/5xx sem o Cypress falhar
  antes da assertion) e `cy.task("uploadCsv")` para multipart. Centraliza log
  (`Cypress.log`, com URL/token mascarados) e o painel visual de evidência
  (aparece em vídeo/screenshot mesmo sem `cy.visit`, porque são testes de API).
- **`authService`** gera o `bearerToken` dinamicamente via `client_credentials`
  e cacheia por execução (evita bater no identity a cada cenário). Tem
  variantes: `getBearerToken()` (admin, identity-hml), `getCnaeBearerToken()`
  (identity-dev, credenciais próprias — reusada pela Order), `getValidationBearerToken()`
  (Validation API — reusa o token do admin se não houver credenciais
  próprias configuradas), `getWalletBearerToken()` (Wallet, identity-hml,
  credenciais próprias com `scopes` no body).
- **`endpoints.js`** centraliza paths e hosts, todos com override via env —
  trocar de ambiente é editar `.env.ci`, não o código.
- **Evidência visual**: como são testes de API (sem `cy.visit`), o
  `renderApiPanel` injeta um painel HTML no DOM do runner (método, URL
  mascarada, status colorido, campos do request, corpo da resposta) só para
  aparecer no vídeo/screenshot — não afeta o teste em si.

## Tags e filtros

| Tag                                                                                 | Significado                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@achado-qa`                                                                        | Negativo que a API aceita indevidamente (caracterização, ver ACHADOS.md)                                                                         |
| `@requer-massa`                                                                     | Depende de massa/dados reais já cadastrados no ambiente                                                                                          |
| `@caracterizacao`                                                                   | Fixa o comportamento atual observado no ambiente (pode não ser o "ideal" segundo o contrato/swagger)                                             |
| `@simples` / `@com-id` / `@completo`                                                | Por layout de importação de créditos                                                                                                             |
| `@credit-lot` / `@credit-lot-actions`                                               | Criação de lote / ações sobre o lote                                                                                                             |
| `@cnae` / `@audit` / `@billpayment` / `@pixout` / `@order` / `@wallet`              | Por domínio                                                                                                                                      |
| `@wallet-credit` / `@wallet-authorization` / `@wallet-statement` / `@wallet-tenant` | Por sub-feature da Wallet (13 não tem tag própria, só `@wallet`)                                                                                 |
| `@wallet-write`                                                                     | Cenário da Wallet que cria/movimenta dados **de verdade em HML** (depósito, autorização, captura, etc)                                           |
| `@fluxo`                                                                            | Jornadas E2E encadeadas da Order (lote/grupo) — **feature em SKIP** (`12_order_fluxo.feature.skip`), tag não é o mecanismo de desativação ativo  |
| `@resend`                                                                           | Reenvio de transação/lote com falha de pagamento (`10_order_batch`/`11_order_recursos`) — cenários rápidos de contrato                           |
| `@resend-cronjob`                                                                   | Fluxo completo de reenvio + reprocessamento pelo cronjob (`18_order_resend_reprocessamento.feature`) — isolado via `excludeSpecPattern`, não tag |

```bash
# Regressao "de regra" da importacao de creditos, sem os achados de QA
npx cypress run --env tags='not @achado-qa'

# So os achados de QA
npx cypress run --env tags=@achado-qa

# So cenarios que dependem de massa real do ambiente
npx cypress run --env tags=@requer-massa

# Regressao de contrato, sem depender de massa
npx cypress run --env tags='not @requer-massa'
```

## Evidências e relatórios

Cada execução gera evidências em `cypress/reports/` (git-ignored):

- **Vídeo** por feature em `reports/videos/*.mp4`.
- **Screenshot** de cada cenário em `reports/screenshots/**/evidencia/*.png`,
  com o painel de request/response (método, URL, token mascarado, campos do
  request, JSON de resposta).
- **Relatório HTML** navegável em `reports/html/index.html` (gerado por
  `multiple-cucumber-html-reporter`), com passos, duração e screenshots
  embutidos.
- **`checklist-import.json`** — export no layout de import de checklist de
  outra plataforma (modelo PortoPlus). Cada caso tem `Id`, `Grupo` (feature),
  `Titulo` (nome do cenário), `Resultado` (`OK`/`NOK`/`Pendente`),
  `CriteriosAceite` (passos Gherkin), `Observações` (erro ou nota do achado),
  `Evidencias.arquivo_1_base64` (screenshot comprimido).

O relatório HTML e o checklist são gerados automaticamente ao final de
`npm test` (via `posttest`). Para regerar a partir de um `cucumber-report.json`
já existente:

```bash
npm run relatorio
npm run checklist
# saida customizada do checklist:
node scripts/exportar-checklist.js --out caminho/checklist.json
```

Os cenários `@achado-qa` são exportados como **OK** (seguem o resultado do
teste, que passa hoje), com uma observação indicando que é um negativo
aceito indevidamente e a regra relacionada.

## Achados de comportamento real (divergências do contrato)

Durante a implementação, vários endpoints da Validation API (BillPayment,
PixOut) mostraram comportamento **diferente** do que o swagger declara.
Todos foram confirmados com chamadas diretas (fora do Cypress) antes de
fixar o cenário, e estão documentados nos comentários de cabeçalho das
respectivas features (`08_billpayment.feature`, `09_pixout.feature`):

- `POST ` e `POST ` retornam `{valid: true/false,
...}` — **não** o envelope `Result<T> {isError, value}` que o swagger
  sugere.
- `GET /rules` retorna o objeto de regras "cru" (`{minValue, maxValue,
...}`) — também não é `Result<T>`.
- Criar regras para uma campanha/catálogo que **já tem** regras retorna
  **400** do Rule Engine ("já existem") — **não** `409 Conflict`.
- Atualizar/consultar regras de uma campanha/catálogo **inexistente**
  retorna **400** do Rule Engine — **não** `404 Not Found`.
- Um `PUT` de regras que envia os **mesmos valores** já salvos na criação
  retorna 400 ("erro ao atualizar... no banco de dados") — não é problema de
  timing/race condition (confirmado com delays de 0s a 5s); os steps de CRUD
  usam valores de atualização propositalmente diferentes dos de criação.
- `minValue: 0` é rejeitado na criação de regras PIX (precisa ser `> 0`).
- `POST ` pode retornar 400 por instabilidade **externa** e
  intermitente da conexão com a CIP — mensagem
  `"Nossa conexão com a CIP está com instabilidades..."` — não é falha de
  massa/configuração; o cenário `@caracterizacao` correspondente tolera
  `400 ou 200`.

Para o domínio de importação de créditos (``), as divergências
regra-de-negócio × comportamento real (CPF/CNPJ com DV inválido aceitos,
regras da coluna `id` não validadas, etc.) estão em
**[docs/achados/file-validate.md](docs/achados/file-validate.md)**.

Os demais domínios (Wallet Balance, Wallet Credit/Authorization/Statement/
TenantCredit, BillPayment, e os stubs pendentes de CNAE/Audit/PixOut) estão
documentados em **[ACHADOS.md](ACHADOS.md)**, que funciona como índice para
os arquivos individuais em `docs/achados/`.

## Qualidade de código (lint/format)

O projeto usa **ESLint 10** (flat config, `eslint.config.js`) com
`eslint-plugin-cypress` + **Prettier 3**. `npm run lint` e
`npm run format:check` rodam no CI (ver `azure-pipelines.yml`) — um PR com
lint/format quebrado falha o pipeline antes mesmo de chegar aos testes.

```bash
npm run lint          # ESLint
npm run lint:fix       # ESLint com autofix
npm run format         # Prettier --write
npm run format:check   # Prettier --check (o que o CI roda)
```

O conjunto de regras é conservador de propósito (`js.configs.recommended` +
`cypressPlugin.configs.recommended` + `eslint-config-prettier`, sem regras de
estilo adicionais) — o objetivo inicial é pegar bugs reais (variável não
usada, `no-undef`) e alinhar formatação, não impor um estilo agressivo num
projeto que nunca teve lint antes.

## Melhorias conhecidas / pendências

Backlog de manutenção levantado numa auditoria do projeto, não bloqueante
para o uso diário da suíte:

- **Scripts por feature ainda faltando:** `10_order_fluxo` continua sem
  script dedicado além do placeholder de skip; para `11_order_recursos` use
  `npx cypress run --spec "..."` diretamente (ver [Como rodar](#como-rodar)).
- **`npm audit`** reporta vulnerabilidades em dependências transitivas
  (herdadas de `cypress`/`sharp`/`esbuild`) — nenhuma delas expõe superfície
  de ataque nova neste projeto (são libs de dev, não código servido), mas
  vale reavaliar a cada major bump dessas libs.
- **Cobertura de assertion rasa:** vários helpers de `walletAssertions.js`
  (`hasDepositSchema`, `hasAuthorizationSchema`, `hasCaptureSchema`,
  `hasCancellationSchema`, `hasCreditReversalSchema`,
  `hasCampaignToExpireSchema`, `hasAccountStatementSchema`,
  `hasTenantDepositSchema`, `hasTenantCreditConsumptionSchema`) e dois
  helpers estruturais em `orderCommon.js` (`okObject`, `pagedOk`) só
  verificam `to.be.an("object")`, sem checar campos — deliberado hoje (schema
  real da Wallet/Order ainda não confirmado a fundo com o time), mas é uma
  boa lista de partida para endurecer assim que a massa/contrato for
  validado oficialmente.
- **`Tenant-Id` (grafia do header):** corrigido nesta rodada — havia 3
  ocorrências grafadas `"Tenant-ID"` e 2 como `"Tenant-Id"` dentro de
  `walletService.js` (headers HTTP são case-insensitive, então não quebrava
  nada, mas divergia). Centralizado em `TENANT_ID_HEADER`
  (`cypress/support/core/httpHeaders.js`).
- **`randomUuid` duplicado:** a mesma função (UUID v4 com fallback manual)
  existia igual em `orderService.js` e `walletService.js`. Extraída para
  `cypress/support/utils/randomUuid.js`.
- **`devDependencies` com range aberto (`^`):** as libs mais antigas do
  projeto (cucumber-preprocessor, esbuild, dotenv, rimraf,
  multiple-cucumber-html-reporter) usavam `^x.y.z`, enquanto o ESLint/Prettier
  novos entraram pinados exato. Pinadas todas nesta rodada, por consistência
  e reprodutibilidade de build (`npm ci` já usa o lockfile, mas o range
  aberto no `package.json` ainda permite drift em atualizações manuais).

Nenhum destes é urgente — a suíte funciona e os testes passam; são pontos de
manutenibilidade a considerar quando o time tiver espaço.

## Rodando no Azure DevOps

O pipeline já está descrito em [`azure-pipelines.yml`](azure-pipelines.yml):
instala dependências, roda a suíte, gera relatório/checklist (mesmo se algum
teste falhar) e publica tudo em `cypress/reports` como artefato do pipeline.

**Antes de rodar pela primeira vez:**

1. Confirme que o projeto ainda não está numa pipeline automática (trigger
   em `main`/`master`) até terminar de configurar as variáveis — do
   contrário o primeiro push já dispara uma execução que vai falhar por
   falta de segredos.
2. Crie um **Variable Group** em _Pipelines → Library_ (ex.:
   `sf-credits-points-admin-tests`) e cadastre cada variável do arquivo
   **`azure-devops-variables.env`** (gerado localmente, git-ignored — veja a
   seção abaixo). Marque como _secret_ (cadeado) todas as linhas marcadas
   `[SECRET]` nesse arquivo.
3. **Gere tokens novos** antes de cadastrar `CYPRESS_authToken` e
   `CYPRESS_servicoFinanceiroToken` — os valores capturados durante o
   desenvolvimento local já expiraram (JWT com `exp` no passado). Os pares
   `client_credentials` (`tokenClientId`/`tokenClientSecret` etc.) não têm
   esse problema — são a via preferida para automação.
4. Vincule o Variable Group ao job no YAML (`variables: - group: <nome>`) ou
   cadastre as mesmas variáveis diretamente nas _Variables_ do pipeline.

### `azure-devops-variables.env`

Foi gerado um arquivo **`azure-devops-variables.env`** na raiz do projeto,
**git-ignored** (nunca será commitado), com o nome exato de cada variável a
cadastrar, o valor atual (capturado do ambiente de desenvolvimento local) e
uma marcação `[SECRET]` para as que devem ir com o cadeado marcado. Use-o só
como referência para copiar/colar no cadastro do Azure — não é consumido pelo
Cypress nem deve circular fora da sua máquina.

## Troubleshooting

- **`Credenciais de token ausentes`** — falta `tokenClientId`/`tokenClientSecret`
  (ou o par equivalente do CNAE/Validation) em `.env`/`cypress.env.json`/env
  do processo.
- **401 em `ou`** — o JWT fixo
  (`authToken`/`servicoFinanceiroToken`) expirou; gere um novo.
- **400 "Attempted to divide by zero."** em `` — o campo
  `PointsConversionRate` não foi enviado (verifique `conversionRate` no env).
- **400 "Nossa conexão com a CIP está com instabilidades"** em
  `POST ` — instabilidade externa e intermitente, não é bug
  do teste nem da massa; tente de novo em alguns minutos.
- **Erro de step indefinido do cucumber-preprocessor** — confira se o texto
  do step na feature bate exatamente com a definição em
  `step_definitions/*.steps.js` (o preprocessor casa por expressão exata,
  incluindo acentuação/maiúsculas removidas conforme o padrão pt do projeto).
- **Relatório HTML não gera / "Nao encontrei cucumber-report.json"** — rode
  `npm test` (ou `npx cypress run`) antes de `npm run relatorio`.
