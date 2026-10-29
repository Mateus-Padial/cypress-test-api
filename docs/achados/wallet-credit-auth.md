# Achados de QA — Wallet Transactional API (Credit/Deposit, Authorization, Statement, TenantCredit)

Levantados em **2026-08-12** contra **HML** (``),
rodando ao vivo os cenários de `14_wallet_credit.feature`,
`15_wallet_authorization.feature`, `16_wallet_statement.feature` e
`17_wallet_tenant_credit.feature`. Massa real descoberta dinamicamente via
`GET .../payments/deposits/campaign-to-expire` (a conta digital fixa do
`.env`, `walletDigitalAccountId`, não tem saldo/depósitos ativos suficientes
para vários desses fluxos).

## 🟡 Achado — Vários endpoints exigem campos que o swagger marca como opcionais

Padrão repetido em 3 grupos distintos: o swagger declara os campos como
`nullable`/opcionais, mas a API rejeita a chamada real se eles forem
omitidos.

| Endpoint                               | Campo                            | Swagger diz                    | Comportamento real                                                                                                                                                             |
| -------------------------------------- | -------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST .../authorizations/{id}/capture` | `amount` (body `CaptureRequest`) | nullable, sem body obrigatório | `400` "A non-empty request body is required." + "The captureRequest field is required." se o body for omitido; `400` "'Amount' must not be empty." se enviar `{}` sem `amount` |
| `GET .../statements`                   | `startDate`/`endDate` (query)    | opcionais                      | `400` "'Start Date' must not be empty." + "'End Date' must not be empty." se omitidos                                                                                          |
| `GET .../statements/paginated`         | `startDate`/`endDate` (query)    | opcionais                      | mesmo 400 acima                                                                                                                                                                |

Correções aplicadas no `walletService.js`: `captureAuthorization` agora
sempre envia `{ amount }` (default `0.01`, mesmo valor da autorização criada
por default); `getStatements`/`getStatementsPaginated` agora enviam por
default os últimos 300 dias (`defaultStatementDateRange`) quando
`startDate`/`endDate` não são passados explicitamente.

**Atualizado em 2026-09-18:** o mesmo padrão foi confirmado ao vivo em
`GET .../payments/deposits/campaign-to-expire` (`getCampaignToExpire`) - sem
`startDate`/`endDate` a API retorna `400` de validação, apesar do swagger
marcar os dois como opcionais. Esse achado nunca tinha sido corrigido nesse
endpoint (só em `statements`/`statements/paginated`), e a falta do default
causava uma cascata: como `getCampaignToExpire` é o step de descoberta de
massa usado por `[Authorization]`, `[Capture]`, `[Cancellation]`,
`[Reversal]` e `[Reversal parcial]` (`15_wallet_authorization.feature`),
a descoberta falhava silenciosamente (400, sem crédito elegível
descoberto), os cenários caíam no fallback do `.env` sem saldo suficiente, e
a criação da autorização retornava 400 "Insufficient balance" - um erro que
parecia falta de massa mas na verdade era o bug de data não corrigido.
`getCampaignToExpire` agora reusa `defaultStatementDateRange` (últimos 300
dias) do mesmo jeito que `getStatements`.

## 🟡 Achado — `statements`/`statements/paginated` exigem diferença < 365 dias entre `startDate` e `endDate`

Não documentado no swagger (nenhum limite de intervalo é mencionado). Se o
intervalo runtime exceder 365 dias, a API retorna `400` `errorCode "004"`
`"Difference between start date and end date should be less than 365 days."`
junto com os erros de campo ausente quando ambas as datas faltam.

## 🟡 Achado — `campaign-to-expire` tem limite de diferença < 90 dias entre `startDate`/`endDate` (diferente de `statements`)

Confirmado ao vivo em 2026-09-19: `campaign-to-expire` **não** compartilha o
limite de 365 dias de `statements` — o limite real é `< 90` dias (`400
errorCode "004" "Difference between start date and end date should be less
than 90 days."`). Usar o mesmo default de 300 dias
(`defaultStatementDateRange`) aqui — como corrigido em 2026-09-18 para o
achado de campo obrigatório omitido — violava esse limite mais estrito e
quebrava a própria descoberta de massa. Corrigido com uma janela dedicada
de 89 dias (`campaignToExpireDateRange`, separada de
`defaultStatementDateRange`).

## 🔴 Achado BLOQUEANTE — `campaign-to-expire` rejeita todo Tenant-Id válido com `400 "Invalid Tenant."`

Confirmado ao vivo em 2026-09-19, **após** corrigir o achado de limite de
90 dias acima: com a janela de datas corrigida, o endpoint passou a
retornar um erro diferente e mais sério — `400 errorCode "018" "Invalid
Tenant."` — em **toda** chamada testada:

- Variando `campaignId` de 1 a 100 (nenhum aceito).
- Passando `Tenant-Id` extraído diretamente do claim `tenant_id` do próprio
  JWT usado na chamada (o mesmo valor, no mesmo instante, que
  `balances/campaign` e `deposits/toconsume` **aceitam sem erro** — testado
  lado a lado).
- Com e sem `pageNumber`/`pageSize`.

Para isolar a causa, um ledger inválido de propósito (`uuid` aleatório) foi
testado com o mesmo `Tenant-Id`: retornou `404 AccountingLedgerNotFound`
normalmente — confirma que o roteamento e a resolução do ledger funcionam,
e que o bloqueio é especificamente na validação de tenant deste endpoint.

```
400
{
  "errorCode": "018",
  "errorMessage": "Invalid Tenant."
}
```

**Última confirmação de funcionamento:** 2026-08-12 (ver achado acima "Vários
endpoints exigem campos..." e o resumo no final deste arquivo, que ainda
descrevia `campaign-to-expire` retornando `creditToExpire[]` com dados
reais). O endpoint parou de funcionar em algum momento entre 2026-08-12 e
2026-09-19 — não é um problema introduzido pela correção de datas, e sim
uma regressão separada no próprio backend.

**Mitigação aplicada no teste** (não corrige a causa raiz, que é do
backend): o step "eu consulto a campanha de depositos a expirar na Wallet
API" (`wallet.steps.js`), ao detectar esse erro específico (`errorCode
"018"`), busca `digitalAccountId` com saldo real via `balances/campaign`
(endpoint funcional) como fonte alternativa de massa — **sem** sobrescrever
`this.response` da chamada original a `campaign-to-expire`. Isso preserva o
contrato dos cenários que afirmam o status/schema reais desse endpoint
(`14_wallet_credit.feature`), que continuam vermelhos de propósito até o
bug ser corrigido no backend, em vez de mascarar o problema.

Cenários que a mitigação **desbloqueia** (só precisam de uma conta com
saldo, não de `participantKey`/`externalCode` reais):
`15_wallet_authorization.feature` inteira (Authorization, Capture,
Cancellation, Reversal, Reversal parcial).

Cenários que **continuam falhando** até o backend corrigir (dependem de
`participantKey`/`externalCode` reais, que só vêm de `campaign-to-expire`,
ou afirmam o próprio status/schema do endpoint):
`[Deposit] Criar depósito com dados válidos`, `[Deposits by external code]
Consulta com código existente` e `[Campaign to expire] Consulta com ids
válidos` (todos em `14_wallet_credit.feature`).

**Repassar ao time de backend:** o endpoint `GET
.../payments/deposits/expirecampaign` está rejeitando com `400 "Invalid
Tenant."` chamadas com `Tenant-Id` que outros endpoints do mesmo ledger
(`balances/campaign`, `.../payments/deposits/toconsume`) aceitam
normalmente no mesmo instante, com o mesmo token.

## 🔴 Achado — Autorização (`AuthorizationResponse`) não tem `transactionId`, só `id`

O corpo de sucesso do `POST .../payments/authorizations` (e do `composed`)
segue o schema `AuthorizationResponse`, que só define `id` (`uuid`),
`digitalAccountId`, `amount`, `description`, `createdAt` — **não existe**
campo `transactionId`. O código inicial dos steps lia
`response.body.transactionId`, que sempre resultava em `undefined` e quebrava
em cascata os cenários de capture/cancellation/reversal (que dependem desse
id no path). Corrigido para ler `response.body.id`.

## 🟡 Achado — Reversão (total e parcial) de autorização exige captura prévia

Diferente do fluxo de depósito (onde a reversão de um depósito intacto
funciona sem exigência prévia), uma **autorização** recém-criada e ainda não
capturada é rejeitada tanto na reversão total quanto na parcial:

```
400 errorCode "010"
"Authorization must be fully or partially captured to be reversed."
```

Confirmado ao vivo chamando `capture` (mesmo que parcial) antes de
`reversal`/`reversal/partial` — aí sim retorna `201` normalmente. Os cenários
`[Reversal]` e `[Reversal parcial]` em `15_wallet_authorization.feature`
foram ajustados para capturar antes de reverter.

## 🟢 Resolvido — `POST .../payments/authorizations/composed` não existe (confirmado com o time)

O endpoint aparecia no swagger servido pelo próprio host de HML
(`operationId: authorizations-composed-post`, 200/401/409/422 documentados),
mas a chamada real retornava `404` com corpo **vazio** — assinatura de
roteamento/gateway, não de regra de negócio. **Confirmado com o time em
2026-08-26: o endpoint de fato não existe/não foi implantado** — era só uma
entrada de swagger sem implementação real por trás. O cenário
`[Authorization composed]` e todo o código de suporte (`walletService.js`,
`endpoints.js`, step definition) foram removidos de `walletService.js`,
`endpoints.js` e `15_wallet_authorization.feature` — não faz sentido manter
teste/cobertura para um endpoint que não existe.

## 🔴 Achado — Grupo TenantCredit (``) bloqueado no gateway (403 genérico)

**Todas** as chamadas ao grupo TenantCredit (`GET .../payments/deposits` e
`GET .../payments/deposits/{id}/consumptions`, com tenant válido, tenant
divergente, credito válido ou inexistente) retornam `403` com corpo
`{"message": "Forbidden"}` — formato genérico de gateway, **diferente** do
JSON estruturado (`errorCode`/`ServiceError`) que a aplicação Wallet devolve
nos grupos que funcionam (Balance, Credit, Authorization, Statement).

Um achado anterior (2026-08-11) já registrava 403 nesses cenários mas
interpretava como comportamento de negócio ("tenant divergente retorna 403
em vez de 401"); a investigação de 2026-08-12 identificou a causa como
bloqueio de gateway, mas atribuiu inicialmente à `Ocp-Apim-Subscription-Key`
(hipótese de Azure API Management). **Atualizado em 2026-08-26:** testes ao
vivo variando token (inclusive com todos os scopes que a plataforma
esperava), subscription key (presente/ausente/header alternativo `x-api-key`)
e path (inclusive paths arbitrários no mesmo prefixo) mostraram que a
rejeição é **anterior a qualquer credencial** — os headers de resposta são
assinatura de **AWS API Gateway** (`x-amzn-errortype: ForbiddenException`),
não Azure APIM, e o bloqueio afeta o prefixo de rota inteiro
(`*`) independente de token/key. Causa raiz
detalhada e evidências completas em
[wallet-tenant-credit-403.md](wallet-tenant-credit-403.md) — hipótese de
trabalho é allowlist de IP de origem no API Gateway, que não é viável para
máquinas de teste sem IP fixo (precisa de liberação por identidade de
serviço ou mecanismo equivalente, a confirmar com o time de plataforma).

Todos os 6 cenários de `17_wallet_tenant_credit.feature` continuam
esperando `403` diretamente (sem tolerância `401 ou 403` / `403 ou 404`) até
a liberação de rota ser confirmada — nenhum desses cenários hoje valida
regra de negócio real, só confirma que o bloqueio de gateway continua
ativo.

**Repassar ao time de plataforma/infra:** ver pergunta objetiva em
[wallet-tenant-credit-403.md](wallet-tenant-credit-403.md#pergunta-objetiva-para-o-time-de-plataformainfra).

## 🟢 Contra-achado (correção de achado anterior) — Reversão parcial de depósito NÃO exige consumo prévio

Um achado de 2026-08-11 registrava que a API rejeitava com `400` "Deposit has
the full amount... Call the total reversal method." a reversão parcial de um
depósito recém-criado (intacto, sem consumo prévio). Reteste ao vivo em
2026-08-12 (3 execuções consecutivas, valores e contas diferentes): a
reversão parcial de um depósito intacto retorna `201` normalmente, **sem**
exigir consumo prévio. O achado anterior não se confirmou nesta rodada
(possível erro de execução na sessão original, ou o comportamento mudou em
HML). O cenário `[Deposit reversal parcial]` em `14_wallet_credit.feature`
foi corrigido para esperar `201`.

## Resumo para o time de backend

| Achado                                                                          | Endpoint(s)                                     | Esperado                             | Comportamento real                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Campos "opcionais" na prática obrigatórios                                      | `capture`, `statements`, `statements/paginated` | aceitar omissão (swagger `nullable`) | `400` de validação                                                                                        |
| Limite de intervalo de datas não documentado                                    | `statements`, `statements/paginated`            | sem limite (swagger não menciona)    | `400` se > 365 dias                                                                                       |
| `transactionId` ausente na resposta                                             | `authorizations`                                | -                                    | schema real só tem `id`                                                                                   |
| Reversão de autorização exige captura prévia                                    | `authorizations/{id}/reversal[/partial]`        | reverter autorização intacta         | `400` "must be fully or partially captured"                                                               |
| `authorizations/composed` não existe (confirmado com o time, removido da suíte) | `authorizations/composed`                       | -                                    | endpoint nunca foi implantado                                                                             |
| Rota bloqueada no API Gateway (AWS), independente de credencial                 | grupo TenantCredit inteiro                      | 200/401/404 conforme regra           | `403 ForbiddenException` em toda chamada — ver [wallet-tenant-credit-403.md](wallet-tenant-credit-403.md) |
| Limite de intervalo de datas mais estrito que `statements` (não documentado)    | `campaign-to-expire`                            | mesmo limite de `statements` (365d)  | `400 errorCode "004"` se > **90** dias                                                                    |
| 🔴 **BLOQUEANTE:** rejeita todo `Tenant-Id` válido (regressão pós-2026-08-12)   | `campaign-to-expire`                            | 200 com `Tenant-Id` correto          | `400 errorCode "018" "Invalid Tenant."` mesmo com dados idênticos aos de `balances/campaign` (que aceita) |

Todos os cenários acima estão fixados em `14_wallet_credit.feature`,
`15_wallet_authorization.feature`, `16_wallet_statement.feature` e
`17_wallet_tenant_credit.feature` (tags `@wallet-write`/`@requer-massa`
conforme o caso), documentando o comportamento real observado em 2026-08-12.
Os dois últimos achados da tabela (limite de 90 dias e rejeição de tenant em
`campaign-to-expire`) foram confirmados ao vivo em 2026-09-19, após os
achados anteriores já estarem fixados - ver seções específicas acima para
os detalhes e o estado atual dos cenários afetados.
