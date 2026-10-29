# Achados de QA — BillPayment (Validation API)

**Status: pendente de revalidação contra ambiente real.**

`08_billpayment.feature` tem 5 asserções tolerantes (`status X ou Y`) no
bloco NEGATIVOS DE CONTRATO, sem achado documentado explicando o motivo da
tolerância — mesmo padrão estrutural já coberto para PixOut (ver
`docs/achados/pixout.md`), que tem a mesma tolerância nos mesmos tipos de
cenário. Este arquivo existe como placeholder para quando essas asserções
forem investigadas ao vivo e confirmadas/documentadas como achado real (ou
removidas, se a API já responde de forma determinística e a tolerância
deixou de ser necessária).

## Asserções tolerantes pendentes de investigação

| Linha | Cenário                                  | Step                                                            | Status aceitos |
| ----- | ---------------------------------------- | --------------------------------------------------------------- | -------------- |
| 90    | `Validacao sem o campo barCode`          | `Entao o status da resposta de BillPayment deve ser 400 ou 200` | 400 ou 200     |
| 94    | `Validacao sem campaignId`               | `Entao o status da resposta de BillPayment deve ser 400 ou 200` | 400 ou 200     |
| 98    | `Validacao com corpo vazio`              | `Entao o status da resposta de BillPayment deve ser 400 ou 200` | 400 ou 200     |
| 102   | `Criar regras sem userEmail`             | `Entao o status da resposta de BillPayment deve ser 400 ou 200` | 400 ou 200     |
| 106   | `Deletar regras sem campaignId no corpo` | `Entao o status da resposta de BillPayment deve ser 400 ou 200` | 400 ou 200     |

Próximo passo: rodar esses 5 casos ao vivo contra o ambiente real, registrar
qual status a API de fato retorna hoje para cada um e, se for sempre o
mesmo, apertar a asserção para o valor único (removendo a tolerância).
