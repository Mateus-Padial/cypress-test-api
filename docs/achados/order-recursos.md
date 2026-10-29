# Achados de QA — Order API (Faturamento, Boleto, Pix, Supplier, Transacoes)

Levantado em **2026-08-25** contra **dev**
(``), ao endurecer as
asserções de `11_order_recursos.feature` (checar o shape do corpo, não só o
status HTTP) usando o swagger real (`GET {orderBaseUrl}/swagger/v1/swagger.json`)
como referência.

## 🟡 Achado — `GET ` retorna objeto, não a string documentada no swagger

O swagger declara o `200` deste endpoint como:

```json
{ "type": "string" }
```

("Dados do Pix retornado com sucesso"). Testado ao vivo (via
`Cenario: Consultar pix de um pedido`, massa real `orderOrderId` do
`.env.ci`), a resposta real é um **objeto** (mesmo shape de outros DTOs de
Pix da Order — `id`, `batchId`, ... — não uma string solta):

```
GET   -> 200
{ "id": "...", "batchId": "...", ... }
```

Ou seja, o contrato documentado no swagger está desatualizado/incorreto para
este endpoint — não é o cliente que está errado. O cenário foi fixado
esperando o comportamento **real** (objeto, via asserção `detailOk`), não o
documentado. Se o time de backend corrigir o swagger, não é necessário
mudar o teste (o teste já reflete o real); se um dia a API mudar para
devolver de fato uma string (alinhando ao swagger), este teste vai falhar e
sinalizar a mudança de contrato.

**Repassar ao time de backend:** o swagger deste endpoint (`GetBatchPix`/Pix
by order) precisa ser corrigido para refletir o schema real (objeto, não
`string`).
