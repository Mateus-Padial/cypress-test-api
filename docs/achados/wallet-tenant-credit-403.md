# Achado de QA — Wallet TenantCredit: 403 é bloqueio de rota no gateway, não erro de auth

**Status: causa raiz confirmada em 2026-08-26 (substitui a hipótese anterior
de "subscription key sem acesso ao produto" registrada em
`wallet-credit-auth.md`).**

## Sintoma

Todo o grupo TenantCredit (`17_wallet_tenant_credit.feature`) retorna `403
{"message": "Forbidden"}` em **qualquer** cenário — inclusive os que deveriam
ser o caminho feliz (`[Tenant deposits] Consulta com tenant e conta
validos`, `[Tenant deposit consumptions] Consulta valida`), com massa válida
e sem nenhum dado errado de propósito. Isso faz esses 2 cenários passarem
"verdes" sem validar nenhuma regra de negócio real — só confirmam que o
bloqueio continua lá.

## Investigação ao vivo (2026-08-26)

Testes diretos contra `` (fora do Cypress, via
Node/fetch), variando cada hipótese isoladamente:

1. **Token com os scopes completos que a plataforma esperava**
   (`digital.account/read`, `digital.account/write`, `scopes.read`,
   `scopes.write`, `tenant/{tenantId}`, `wallet.administractive`,
   `wallet.all`, `wallet.transactional`) pedidos explicitamente no
   `client_credentials` contra o identity-hml. Resultado: o identity **não
   concede** `wallet.administractive` nem `wallet.all` — o token emitido
   continua só com `wallet.transactional` (e os demais scopes básicos),
   mesmo pedindo os extras. O client cadastrado hoje não está autorizado
   para esses dois scopes.
2. **Comparação de headers de resposta entre um endpoint que funciona
   (Balance) e o TenantCredit**, com o mesmo token:
   - Balance: `x-envoy-upstream-service-time` presente, `server:
cloudflare` — passa pelo Envoy da aplicação .NET, chega a validar
     regra de negócio (400 real de "accountingLedgerId invalido").
   - TenantCredit: `x-amzn-apigw-id`, `x-amzn-errortype:
ForbiddenException`, `x-amzn-requestid` — assinatura própria do
     **AWS API Gateway**, sem nenhum header do Envoy. A requisição nunca
     chega na aplicação.
3. **Variação de headers de auth** enviados ao TenantCredit: só
   `Ocp-Apim-Subscription-Key`, só `x-api-key`, os dois juntos, e nenhum
   header de auth. **Resultado idêntico nos 4 casos**: `403
ForbiddenException`. Ou seja, nenhuma combinação de token/subscription
   key muda o resultado.
4. **Path arbitrário no mesmo prefixo**: um path inexistente
   (``) e a raiz do host
   (`/`) — **ambos também retornam 403 ForbiddenException**, sem token
   nenhum. Em contraste, um path sob `/transactional-api/v1/*` (ex.: o
   swagger, `/transactional-api/v1/swagger/docs/...`) responde `200`
   normalmente sem qualquer header de auth.

## Causa raiz

O bloqueio não é de autenticação/autorização de aplicação — é um **bloqueio
de rota inteira no AWS API Gateway**, aplicado antes de qualquer token ou
subscription key ser avaliado. Todo o prefixo `*`
nesse host devolve `403 ForbiddenException` **independente de credenciais**,
enquanto `/transactional-api/v1/*` (Balance, Credit, Authorization,
Statement) passa normalmente pelo Envoy da aplicação.

Hipótese de trabalho (a confirmar com o time de plataforma/infra): a rota
está protegida por uma resource policy do API Gateway baseada em
allowlist de IP de origem — o padrão comum para bloquear tráfego não
esperado nesse tipo de rota. As máquinas que rodam a suíte (estações locais,
possivelmente runners de CI) **não têm IP fixo**, então mesmo que a origem
correta fosse liberada uma vez, ela não se mantém liberada de forma
confiável execução a execução. Se essa hipótese se confirmar, a liberação
correta não é "adicionar meu IP na allowlist", e sim habilitar acesso via
identidade de serviço (SI) ou outro mecanismo de autenticação de rede que
não dependa de IP fixo — a decidir com o time de plataforma.

## O que isso não é

- **Não é** o achado anterior de "subscription key sem acesso ao produto no
  APIM" (registrado em `wallet-credit-auth.md`) — essa hipótese pressupunha
  que a rejeição vinha de um gateway Azure API Management avaliando a
  `Ocp-Apim-Subscription-Key`. A assinatura real (`x-amzn-*`) mostra que o
  gateway na frente dessa rota é **AWS API Gateway**, não Azure APIM, e o
  bloqueio ocorre mesmo sem enviar nenhuma chave.
- **Não é** problema de scope do token — ainda que o token tivesse todos os
  scopes solicitados, a rejeição acontece antes da aplicação (e do próprio
  identity/token) serem relevantes para a decisão.
- **Não é** comportamento de negócio (tenant inválido, crédito inexistente)
  — os 4 cenários "negativos" do arquivo batem 403 pela mesma causa dos 2
  "positivos", não porque a regra de negócio foi validada.

## Pergunta objetiva para o time de plataforma/infra

O prefixo de rota `no API Gateway de` está com acesso liberado para a origem de
onde os testes rodam? Como as máquinas de execução não têm IP fixo, a
liberação provavelmente precisa ser por identidade de serviço (SI) ou outro
mecanismo que não dependa de allowlist de IP — a confirmar qual é o
mecanismo correto disponível nesse API Gateway.

## Endpoints afetados

- `GET `
- `GET `

Host: `` (raiz do host, **fora** de
`/transactional-api/v1` — path base diferente dos demais grupos da Wallet).

## Próximo passo

Assim que o time de plataforma confirmar a liberação (ou o mecanismo
correto), reexecutar `17_wallet_tenant_credit.feature` ao vivo — os 2
cenários "positivos" devem passar a receber `200`/`404` de negócio real em
vez de `403` de gateway, e as assertions de status devem ser ajustadas de
volta para o valor esperado de negócio (hoje "esperam" `403` só porque é o
que a API sempre devolve, não porque é o comportamento correto).
