# Achados de QA — Wallet Transactional API (Accounting Ledger, Balance)

Levantados em **2026-08-06** contra **HML** (``),
testando os 3 endpoints da tag `Balance` do swagger
(`transactional-api-v1.json`) por fora do Cypress (curl real) antes de fixar
os cenários em `13_wallet_balance.feature` (tag `@achado-qa`).

## 🔴 Achado crítico — `Ocp-Apim-Subscription-Key` não é validada

Testado nos 3 endpoints (`balances`, `balances/onhold`, `balances/campaign`):
header **ausente**, **vazio** (`""`) e com **valor incorreto** — sempre
`200`, resposta idêntica à da chamada com a key correta.

A nota original do projeto (ver `CLAUDE.md`) assumia que essa key era
"exigida pelo API Management" — isso descreve que o header é **esperado**
na chamada real (foi assim que ela foi descoberta, via curl), mas não que o
**valor** dela é de fato checado. Se a intenção é usar essa key como camada
de controle de acesso/rate limit do gateway, ela não está cumprindo esse
papel hoje.

**Repassar ao time de backend/plataforma:** confirmar se a validação da
subscription key deveria estar ativa no API Management na frente dessa API,
ou se ela é só informativa/de telemetria.

## 🟡 Achado — `campaignId` (header, endpoint `balances/campaign`) não filtra

**CONFIRMADO pelo dev (2026-08-06): o filtro por campanha não existe na
Wallet.** `campaignId` inexistente (`999999999`) retorna `200` com os
**mesmos** `totalItems`/`totalBalance`/`items` do `campaignId=1` (massa
válida usada nos testes) porque o endpoint sempre retorna o agregado do
ledger inteiro — o parâmetro é validado como presente (ausente → `400`) e
numérico (`abc` → `400`), mas nunca é usado para filtrar. Apesar do nome do
endpoint ("saldo por campanha") e do parâmetro ser obrigatório, na prática ele
é decorativo hoje.

## 🟡 Achado — `Tenant-Id` (header, endpoint `balances/campaign`) não é validado

Mesma chamada com `Tenant-Id` **ausente** ou com um valor arbitrário
(diferente do `tenant_id` do JWT usado) — sempre `200`, mesmo resultado.

## 🟡 Achado — `creditStampedId` (query, endpoints `balances` e `balances/onhold`) é ignorado

Testado com uma conta com saldo real (`balance: 240`, `creditStampedId` real
= `2079218715`): passar esse stamp, um stamp inexistente
(`999999999999`) ou omitir o parâmetro — sempre a mesma resposta completa,
sem filtrar por stamp.

## 🟡 Achado — Paginação de `balances/campaign` não valida limites

- `pageSize=0` ou `pageSize` negativo → aceito, a API usa `pageSize=1`
  silenciosamente (esperado: `400` de validação, já que o swagger declara
  `minimum: 1`).
- `pageNumber` negativo → aceito, volta para a página `1` silenciosamente
  (swagger declara `minimum: 0`).
- `pageSize=99999` → aceito **sem limite máximo**, retorna a lista inteira
  (586 itens no momento do teste) numa página só. Risco de payload grande
  sem paginação real se a base de contas crescer.
- `pageNumber` além do total de páginas → **este caso funciona**: `404`
  `"No Transactions found"`.

## Resumo para o time de backend

| Parâmetro                     | Endpoint                      | Esperado                    | Comportamento real         |
| ----------------------------- | ----------------------------- | --------------------------- | -------------------------- |
| `Ocp-Apim-Subscription-Key`   | os 3                          | 401/403 se ausente/inválida | sempre 200, valor ignorado |
| `campaignId` inexistente      | `balances/campaign`           | filtrar / 404               | 200, sem filtro            |
| `Tenant-Id` incorreto         | `balances/campaign`           | validar tenant              | 200, ignorado              |
| `creditStampedId` inexistente | `balances`, `balances/onhold` | filtrar                     | 200, sem filtro            |
| `pageSize` ≤ 0                | `balances/campaign`           | 400                         | 200, usa 1                 |
| `pageNumber` < 0              | `balances/campaign`           | 400                         | 200, usa página 1          |
| `pageSize` muito grande       | `balances/campaign`           | limitar/paginar             | 200, sem limite            |

Todos os 12 cenários acima estão fixados como testes de caracterização em
`13_wallet_balance.feature` (tag `@achado-qa @requer-massa`): passam hoje
documentando o comportamento real e vão falhar automaticamente se/quando a
validação for implementada, sinalizando a correção.

### Atualização (2026-08-12) — `pageSize` de `balances/campaign` agora tem limite

Reteste ao vivo: `pageSize=99999` **não é mais aceito**. A API retorna `400`
`"'PageSize' must not exceed 1000."`. O teto de proteção citado como ausente
no achado original passou a existir (ou o achado original estava incorreto).
O cenário `[Balance campanha] pageSize sem limite maximo` foi substituído por
`[Balance campanha] pageSize acima do limite maximo e rejeitado`, removido da
tag `@achado-qa` (deixou de ser uma divergência — o comportamento agora é o
esperado) e passou a exigir `400`.

## 🟡 Achado — `balances/campaign` com `pageNumber >= 2` perde `totalItems`/`totalBalance`

**Confirmado ao vivo em 2026-08-13**, reproduzido isoladamente 2 vezes (fora
de qualquer influência de outros serviços): `GET
` com header `pageNumber=2` (e
`pageSize=3`) retorna `200`, porém o corpo perde os campos `totalItems` e
`totalBalance` do schema `WalletBalanceCampaignResponse` — só vêm
`pageNumber`, `pageSize` e `items[]`. O swagger e a nota original do
`CLAUDE.md`/achado de 2026-08-06 descrevem os 5 campos como sempre presentes
em qualquer resposta de sucesso.

O comportamento é específico de `pageNumber >= 2`: os demais cenários que
exercitam esse endpoint (página default, `pageSize<=0`, `pageNumber<0` — que
internamente cai para página 1) continuam trazendo `totalItems` e
`totalBalance` normalmente. Ou seja, o agregado (`totalItems`/`totalBalance`)
só é omitido quando a resposta corresponde a uma página diferente da
primeira, sugerindo que esses dois campos só são calculados/anexados no
branch de "primeira página" do backend.

**Repassar ao time de backend:** confirmar se `totalItems`/`totalBalance`
deveriam vir em toda página (aparentam ser agregados do total da consulta,
não da página atual, então não há motivo óbvio para omiti-los a partir da
2ª página).

O cenário foi renomeado para `[Balance campanha] Paginacao com pageNumber >= 2
perde totalItems (achado de QA)`, movido para a tag `@achado-qa` e passou a
validar o schema reduzido observado (`hasCampaignBalanceSchemaWithoutTotalItems`)
em vez do schema completo — vai falhar automaticamente quando o backend
corrigir, sinalizando a correção.
