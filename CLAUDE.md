# Notas do projeto — sf-credits-points-admin (testes de API)

Suite de testes de API em Cypress + Cucumber/Gherkin (pt-BR) cobrindo
`e` do Admin Vertem.

## Pendências / a lembrar

- **`allowCypressEnv` (Cypress 15):** a v15 mostra um aviso a cada execucao
  dizendo que `Cypress.env()` sera removido num major futuro e recomenda migrar
  para `cy.env()` + setar `allowCypressEnv: false`. **Decisao atual: IGNORAR** —
  e so aviso, os testes passam. O codigo usa `Cypress.env()` em todo lugar
  (authService, endpoints.js, todos os services, e o loader dotenv no
  cypress.config.js), entao migrar e retrabalho grande (sincrono -> comando da
  fila). Reavaliar quando `cy.env()` estiver maduro/obrigatorio.

- **Retries globais:** desabilitados (`runMode: 0`) porque a suite faz muitas
  operacoes de escrita. Um retry depois de timeout pode duplicar lotes,
  depositos ou autorizacoes. Reexecute cenarios mutaveis explicitamente apos
  verificar o estado deixado no ambiente.

- **Precedencia de ambiente:** `.env.ci` e carregado primeiro; localmente
  `.env` pode sobrescreve-lo; no CI `.env` nao e carregado. Variaveis
  `CYPRESS_*` do processo sempre vencem os arquivos.

- **Possivel evolucao: MCP do projeto (ideia, nao implementado).** Servidor MCP
  (processo Node ao lado, SDK `@modelcontextprotocol/sdk`, transporte stdio local)
  expondo o projeto para clientes de IA. Superficie pensada:
  - Tools read-only: `get_last_report` (resumo do `cucumber-report.json`),
    `list_features`, ler `ACHADOS.md`.
  - Tools de execucao: `run_suite` / `run_spec` / `run_by_tag` (dispara
    `npx cypress run ...` via child_process e parseia o JSON).
  - Registrar via `.mcp.json` na raiz (comando `node mcp/server.js`).
    Cuidados: (1) tools de execucao tem EFEITO COLATERAL REAL — batem em dev/hml e
    as acoes de credit lot sao de escrita (criam/movimentam lotes); separar bem das
    read-only. (2) NAO vazar tokens nas respostas (herda `.env`/`cypress.env.json`).
    Comecar pela versao read-only.

- **Possivel evolucao: acesso direto ao banco nos testes (ideia, nao
  implementada, pendente de validacao com o time).** Objetivo: nos cenarios de
  lote/boleto, consultar o banco (SELECT) ANTES do request para buscar dados
  necessarios, e/ou DEPOIS para validar que o retorno da API bate com o que foi
  persistido. Acesso e via VPN (so tem acesso local por enquanto, nao pelo
  runner do CI). Pontos levantados:
  - Quem conectaria e a automacao (via `cy.task()` no `cypress.config.js`,
    fora do browser), nao o Claude diretamente.
  - Exigiria: 1 dependencia nova (client do banco, depende do motor — SQL
    Server/Postgres/Mongo/etc, a definir), uma task de leitura, e novos steps
    Gherkin. Connection string entraria como segredo no `.env` local
    (git-ignored), igual `authToken`/`servicoFinanceiroToken` — nunca
    versionar, nunca colar em chat.
  - Riscos: (1) CI sem VPN — se o Azure Pipelines precisar rodar esses
    cenarios, o runner nao tem acesso a rede interna hoje; (2) acoplamento do
    teste de API com o schema do banco, quebra se a estrutura interna mudar
    mesmo sem a API ter mudado; (3) escrita acidental — mitigar com usuario do
    banco restrito a SELECT (grant), nao so por convencao no codigo.
  - Bloqueado em: validacao com o time se e viavel (mesmo em ambiente dev).

## Versoes (upgrade feito em 2026-07)

- cypress: **15.19.0** (era 13.17.0)
- @badeball/cypress-cucumber-preprocessor: **26.0.0** (era 20.1.2)
- @bahmutov/cypress-esbuild-preprocessor: 2.2.8
- esbuild: **0.28.1** (era 0.23.1)
- Node: versao do `.nvmrc` (20) e fonte de verdade; `engines.node` no `package.json` so exige >=18

## Config (cypress.config.js) — pontos sensiveis

- **`experimentalInteractiveRunEvents: true`** — NAO remover. Corrige o erro
  "Unexpected state in specEnvelopesHandler: uninitialized" do
  cypress-cucumber-preprocessor no modo visual (`cypress open`). Ainda existe na
  v15. Ao mudar o config, reiniciar o `cypress open` (setupNodeEvents so e lido
  na inicializacao).
- **`experimentalRunAllSpecs: true`** — MANTER. Habilita o botao "Run All Specs"
  no modo visual (rodar todas as features de uma vez). Continua existindo como
  flag experimental (default false) na v15 — nao foi promovido/removido.
- A limpeza de `cypress/reports` e feita direto no `setupNodeEvents` (NAO via
  `on("before:run")`), senao sobrescreve o handler do preprocessor e quebra.

## Variaveis de ambiente (.env via dotenv)

- `cypress.config.js` carrega `.env.ci` (versionado, nao-sensivel) e `.env`
  (git-ignored, segredos locais) e injeta em `Cypress.env()`.
- Precedencia: `.env.ci` (base) < `CYPRESS_*` do processo (secrets do CI) <
  `.env` local.
- Segredos: `authToken`, `servicoFinanceiroToken`, `tokenClientId`,
  `tokenClientSecret`. NUNCA versionar. `cypress.env.json` tambem e git-ignored
  (redundante com `.env`; pode ser aposentado migrando para `.env`).

## Parametros de dominio descobertos

- ``: campo do arquivo = `File`; taxa = `PointsConversionRate`
  (nao `ConversionRate`); `LoginTypeId` 1=CPF, 2=CNPJ.
- ``: campo do arquivo = `CsvFile`; exige 2 tokens (Bearer +
  authorization-vertem-servico-financeiro) + header `api-version`.
- **Acoes de lote** (`|reprove|cancel`): body
  `{ userName, userEmail }` (reprove/cancel tambem exigem `reason`). Regras
  observadas no ambiente dev:
  - **Atualizacao 2026-10-21:** com requester e executor configurados para o
    mesmo usuario (`userName`/`userEmail` alinhados a `requesterName`/
    `requesterEmail`), approve e reprove retornam 400 (`Aprovacao negada` /
    `Cancelamento negado`); cancel isolado continua retornando 200. A causa de
    negocio exata ainda nao foi confirmada. Os casos de aprovacao/reprovacao
    ficam marcados `@requer-condicao-ambiente` ate haver massa com executor
    distinto; podem ser habilitados com
    `CYPRESS_runEnvironmentDependentScenarios=true`.
  - Evidencia historica: approve/reprove/cancel isolados sobre lote recem-criado
    e approve -> reprove retornaram 200 em execucoes anteriores com massa/usuario
    que permitiam a acao. No reteste de 2026-10-21, so cancel isolado retornou 200
    usando o mesmo requester e executor; approve/reprove foram negados (400).
  - approve -> cancel: **400** (cancelamento so e aceito ANTES da aprovacao,
    comportamento observado anteriormente).
  - 3a acao encadeada: 400 (comportamento observado anteriormente; depende de
    executor distinto para passar pelas acoes anteriores).
  - As acoes precisam aguardar o lote sair do estado de processamento (polling
    do GET by id) antes de agir.

- **Wallet Transactional API (Accounting Ledger) - Balance:** host proprio
  (`walletBaseUrl`), roda em **HML** (`), nao em
DEV como o swagger publico (`) sugeria - confirmado
  via curl real do usuario. Swagger real: `GET
{walletBaseUrl}/swagger/docs/transactional-api-v1.json` (titulo "Accounting
  Ledger Transactional API"; a index.html carrega 2 docs, v1 e v2, mas v2
  retornou vazio/404 no dia da descoberta). `GET
`:
  path params uuid/string; query opcional `creditStampedId`; header
  `api-version` (default "1.0"); resposta 200 = `BalanceResponse
{ accountingLedgerId, totalBalance, currency, items[] }`.
  Auth: **CONFIRMADO 2026-08-06 que o token do admin NAO funciona** (401
  "Unauthorized - Invalid Tenant", ErrorCode 017) - a nota anterior dizia que
  o `aud` "walletgatewaysemparar"/"eng/api-gateway" batia com o tenant, mas
  testado ao vivo deu 401. `getWalletBearerToken` precisa de credenciais
  proprias da Wallet (`walletTokenClientId`/`walletTokenClientSecret`,
  identity-hml) via client_credentials, **com o campo `scopes` no body**
  ("scopes.read scopes.write", igual CNAE/Order - sem isso o token gerado
  nao inclui o scope `wallet.transactional` nem o `tenant_alias: semparar` no
  `aud`, e a API rejeita). Alternativa (nao recomendada, expira em ~1h): colar
  um token pronto em `walletAuthToken` no `cypress.env.json`. Alem do Bearer,
  exige header `Ocp-Apim-Subscription-Key` (API Management na frente da API -
  **nao aparece no swagger**, so foi descoberta pelo curl real). Swagger so
  documenta 200/401 para este endpoint; comportamento para ledger/conta
  inexistente ou sem subscription key nao e especificado no contrato - ver
  docs/achados/wallet-balance.md quando confirmado contra hml.

- **Wallet - mais 2 endpoints de Balance cobertos (2026-08-06):**
  - `GET .../digital-account/{id}/balances/onhold` (saldo bloqueado): 200 =
    `{ totalBalance }`. 404 se ledger ou digital account nao existir (nao
    documentado no swagger, so 200/401 - achado de QA).
  - `GET ` (saldo agregado por
    campanha, paginado): `campaignId` e `Tenant-Id` sao **headers**, nao
    query/path (assim como `pageNumber`/`pageSize`, default 1/10). 200 =
    `WalletBalanceCampaignResponse { totalItems, totalBalance, pageNumber,
pageSize, items[] { digitalAccountId, login, balance } }`. 400 se faltar
    `campaignId`. 404 se o ledger nao existir. **ACHADO DE QA:** a API NAO
    valida se `campaignId` existe nem se `Tenant-Id` bate com o tenant do
    token - ambos os casos retornam 200 normalmente, ignorados silenciosamente
    (swagger so documenta 400/401/404, nenhum desses dois casos).
  - **Atualizacao 2026-08-12:** `pageSize` de `balances/campaign` passou a ter
    limite maximo (`pageSize=99999` agora retorna `400 "'PageSize' must not
exceed 1000."` - o achado de "sem limite" nao se confirmou no reteste).

- **Wallet - Credit/Deposit/Reversal/Import, Authorization/Capture/
  Cancellation/Reversal, Statement, TenantCredit (validados ao vivo contra
  HML em 2026-08-12):** mesmo host/auth do Balance. Massa descoberta
  dinamicamente via `GET .../payments/deposits/campaign-to-expire` (retorna
  `creditToExpire[]` com `digitalAccountId`, `participantKey`/CPF e
  `externalCode` reais) em vez de depender dos ids fixos do `.env` - a conta
  `walletDigitalAccountId` do `.env` (massa do Balance) nao tem saldo/
  depositos suficientes para os fluxos de escrita destes grupos.
  - **Deposit:** `POST .../payments/deposit` exige `participantKey`+
    `participantKeyType=cpf` no body (nao aparece como obrigatorio isolado no
    swagger, mas a chamada real rejeita sem ele - mesmo padrao do
    Idempotency-Key). Resposta de sucesso e o schema `DepositResponse`.
  - **Authorization:** `AuthorizationResponse` (200 de sucesso) so tem `id`
    (nao `transactionId` como os steps iniciais assumiam) - capture/
    cancellation/reversal dependem desse id no path, corrigido para ler
    `body.id`. Reversao (total e parcial) de uma autorizacao NAO capturada e
    rejeitada com `400 "Authorization must be fully or partially captured to
be reversed."` - captura (mesmo que so parcial) antes de reverter.
    `capture` exige `{amount}` no body mesmo sendo `nullable` no swagger
    (`400` "captureRequest field is required" se omitido, "'Amount' must not
    be empty" se `{}` sem amount). `POST .../authorizations/composed` esta
    documentado no swagger servido pelo proprio host de HML mas retorna
    `404` com corpo vazio (sem o JSON estruturado de erro de negocio) -
    indicio de rota nao implantada, nao falha de contrato.
  - **Statement:** `startDate`/`endDate` (query) de `statements` e
    `statements/paginated` sao `nullable` no swagger mas exigidos de fato
    (`400` se omitidos), com limite adicional de diferenca < 365 dias entre
    eles (nao documentado). Default aplicado no service: ultimos 300 dias
    (ampliado de 30 para 300 em 2026-09-18 - com 30 dias, contas com pouca
    movimentacao ficavam fora da janela e caiam em 404 por falta de massa).
  - **ACHADO 2026-09-19:** `getCampaignToExpire` (`campaign-to-expire`,
    headers `startDate`/`endDate`) tem uma validacao PROPRIA e mais estrita
    que a de `statements`: diferenca entre startDate/endDate deve ser
    `< 90` dias (`400 "Difference between start date and end date should be
less than 90 days."` se ultrapassado) - diferente do limite de 365 dias
    de `statements`. Usar o mesmo default de 300 dias de
    `defaultStatementDateRange` aqui (como feito em 2026-09-18) violava
    esse limite e quebrava a propria descoberta de massa, o que em cascata
    fazia os cenarios de `15_wallet_authorization.feature` (que dependem
    dessa descoberta) carem em 400 "Insufficient balance" no fallback do
    `.env`. Corrigido com uma janela dedicada de 89 dias
    (`campaignToExpireDateRange`, separada de `defaultStatementDateRange`).
  - **ACHADO BLOQUEANTE 2026-09-19 (apos a correcao acima):** com a janela de
    datas corrigida, `campaign-to-expire` passou a retornar um erro
    DIFERENTE e mais serio: `400 errorCode "018" "Invalid Tenant."` em
    **toda** chamada, mesmo variando campaignId (1 a 100), mesmo passando o
    `Tenant-Id` extraido direto do claim `tenant_id` do proprio JWT (o mesmo
    valor que `balances/campaign` e `deposits/toconsume` aceitam sem erro
    nas MESMAS condicoes - testado ao vivo lado a lado). Ledger invalido de
    proposito retorna `404 AccountingLedgerNotFound` normalmente (prova que
    o roteamento/ledger esta ok, o bloqueio e so na validacao de tenant
    deste endpoint especifico). **Bug isolado no proprio endpoint
    `campaign-to-expire`, nao corrigivel do lado do teste.** Ultima vez
    confirmado funcionando: 2026-08-12 (ver
    docs/achados/wallet-credit-auth.md). Mitigacao aplicada no step "eu
    consulto a campanha de depositos a expirar na Wallet API"
    (`wallet.steps.js`): quando detecta esse erro (`errorCode 018`), busca
    `digitalAccountId` com saldo real via `balances/campaign` (endpoint
    funcional) como fallback, SEM sobrescrever `this.response` - preserva o
    contrato dos cenarios de `[Campaign to expire]`
    (`14_wallet_credit.feature`), que continuam afirmando o `200` real
    (hoje falhando de proposito, refletindo o bug) em vez de mascarar.
    Cenarios afetados que ficam vermelhos ate o backend corrigir:
    `[Deposit] Criar deposito com dados validos`, `[Deposits by external
code] Consulta com codigo existente` e `[Campaign to expire] Consulta
com ids validos` (todos em `14_wallet_credit.feature`) - dependem do
    `participantKey`/`externalCode` reais que so vem desse endpoint; o
    fallback de `digitalAccountId` via `balances/campaign` NAO cobre esses
    dois campos, so desbloqueia `15_wallet_authorization.feature`
    (Authorization/Capture/Cancellation/Reversal), que so precisa de uma
    conta com saldo.
  - **TenantCredit:** path base diferente (``,
    mesmo host raiz via `walletHostUrl`). **ACHADO:** todo o grupo retorna
    `403 {"message": "Forbidden"}` (formato de API Management/gateway, nao
    da aplicacao) - a subscription key atual nao tem acesso liberado a este
    produto especifico no APIM, independente de tenant/credito validos ou
    nao. Ver docs/achados/wallet-credit-auth.md para o achado anterior que
    interpretava esse 403 como resposta de negocio (superado).

- **Order API - resend/reprocessamento (2026-08-20, swagger real inspecionado
  via `GET {orderBaseUrl}/swagger/v1/swagger.json`):**
  - `PUT ` (nao `/resend` - nome real
    confirmado no swagger) reenvia **todas** as transacoes `PaymentFailed` do
    lote de uma vez. Body `ResendFailedBatchRequestDto { resendBy }` -> `200
ResendFailedBatchResponseDto { id, status (BatchStatus), resentTransactionIds[]
}`. O `status` da resposta e do **LOTE** (BatchStatus:
    AguardandoAprovacao/Aprovado/Reprovado), nao da transacao - cuidado ao
    escrever assertion, e um schema diferente do resend individual.
  - `PUT ` reenvia **uma** transacao.
    Body `ResendTransactionRequestDto { resendBy }` -> `200
TransactionResponseDto { id, code, status (TransactionStatus), updatedBy,
updatedAt }` - aqui o `status` E da transacao.
  - `TransactionStatus` (enum completo, 10 valores):
    `Captured, AssociatedToBatch, AwaitingProcessing, Processing,
PaymentFailed, PendingCancellation, CancellationFailed, Paid, Sent, Canceled`.
  - **Sobre os numeros 5/3 mencionados pelo usuario** (5=PaymentFailed,
    3=AwaitingProcessing pela posicao no enum, contando a partir de 1): o
    swagger **so expoe strings**, nao ha campo numerico na API. A
    correspondencia com os inteiros e inferencia pela ordem do enum, **nao
    confirmada** - so seria confirmavel com acesso a banco (pendencia ja
    registrada acima).
  - Massa (transacoes `PaymentFailed`) e **transiente** (reprocessar muda o
    status) - suite descobre em runtime via `GET 
Status=PaymentFailed&Type=Boleto|Pix`, mesmo principio da descoberta dinamica
    da Wallet (`campaign-to-expire`).
  - Fluxo completo (resend -> approve -> aguardar cronjob ~25min) isolado em
    `18_order_resend_reprocessamento.feature`, excluido de qualquer run sem
    `--spec` via `excludeSpecPattern` (`cypress.config.js`). Roda so com
    `npm run test:order-resend`. **Nao confirmado ainda** se `PUT
` aceita reaprovar um lote ja aprovado antes (1a execucao
    real esclarece).

## Achados de QA

Divergencias regra x comportamento real da API estao em `ACHADOS.md` e fixadas
como testes de caracterizacao em `04_achados_qa.feature` (tag `@achado-qa`).

## Comandos uteis

- `npm test` — suite completa + relatorio HTML + checklist.
- `npm run open` — modo visual.
- `npx cypress run --spec "cypress/e2e/features/05_credit_lot.feature"` — 1 spec.
- `npx cypress run --env tags=@credit-lot-actions` — so as acoes de lote.
- `npx cypress run --env tags='not @achado-qa'` — regressao sem os achados.
