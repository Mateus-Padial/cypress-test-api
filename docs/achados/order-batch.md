# Achados de QA — Order API (Batch)

Levantado em **2026-08-20** contra **dev**
(``), testando `GET `
por fora do Cypress (chamadas reais com token do CNAE, que a Order reusa)
antes de fixar o cenário em `10_order_batch.feature` (tag `@achado-qa`).

## 🔴 Achado — `Offset`/`Limit` negativos causam 500 (deveria ser 400) e vazam nome de serviço interno

O swagger declara `Offset` e `Limit` (query, `GET `) como
`integer int32` simples, sem `minimum` — mas nada nos parâmetros sugere que
valores negativos sejam um input válido para paginação.

Testado ao vivo:

```
GET    -> 500
{"status":500,"errors":[{"code":"SF.FinancialService.Order.RuleEngine.Api",
  "description":"Erro ao obter informações: ","type":"Unexpected","numericType":1}]}

GET   -> 500  (mesmo shape de erro)
```

Comparar com o comportamento correto do mesmo endpoint para outros
parâmetros fora do domínio esperado — `Status`/`Type` com valor fora do enum
retornam `400` de validação do model binder, antes de chegar em qualquer
lógica de negócio:

```
GET   -> 400
{"errors":{"Status":["The value 'NaoExiste' is not valid for Status."]}}

GET        -> 400
{"errors":{"Type":["The value 'Cartao' is not valid for Type."]}}
```

Ou seja, `Offset`/`Limit` não passam por nenhuma validação de faixa antes de
serem repassados para a camada de consulta (RuleEngine), que estoura e
devolve `500` com o **nome do serviço interno** (`SF.FinancialService.Order.RuleEngine.Api`)
na descrição do erro — vazamento de detalhe de implementação, além do
código de status errado (deveria ser `400`, erro de validação de input do
cliente, não `500`, erro do servidor).

**Repassar ao time de backend:** adicionar validação de `Offset >= 0` e
`Limit > 0` (ou `>= 0`, a definir a regra) no model binding de `GET
`, no mesmo padrão já aplicado a `Status`/`Type`, para que valores
negativos retornem `400` sem chegar no RuleEngine. Mesma pergunta vale para
os demais endpoints paginados da Order que reusam o mesmo padrão de
`Offset`/`Limit` (`batch-group`, `transactions`, `supplier`, etc.) —
`Limit`/`Offset` negativos não foram testados nesses outros endpoints ainda.

## Contexto adicional — massa de `Status` em dev

Ao investigar este achado, confirmou-se que o ambiente **dev** só tem lotes
`Boleto` com `status: "Aprovado"` (10 de 10, `GET
` → todos `Aprovado`). Não há massa
`Reprovado` nem `AguardandoAprovacao` disponível em dev hoje
(`GET ` → `total: 0`). Qualquer cenário que
dependa de descobrir um lote `Reprovado` via `GET ` precisa ou de
massa nova no ambiente, ou rodar contra outro ambiente (HML, ainda sem
credenciais próprias da Order configuradas — ver `CLAUDE.md`).

## Resumo para o time de backend

| Parâmetro         | Endpoint | Esperado | Comportamento real                                   |
| ----------------- | -------- | -------- | ---------------------------------------------------- |
| `Limit` negativo  | `GET `   | 400      | 500, vaza `SF.FinancialService.Order.RuleEngine.Api` |
| `Offset` negativo | `GET `   | 400      | 500, mesmo vazamento                                 |

O cenário está fixado como teste de caracterização em `10_order_batch.feature`
(tag `@achado-qa`): passa hoje documentando o comportamento real (`500`) e
vai falhar automaticamente quando o backend corrigir a validação,
sinalizando a correção (nesse momento, trocar a asserção para `400` e
remover a tag `@achado-qa`).
