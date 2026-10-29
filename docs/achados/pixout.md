# Achados de QA — PixOut (Validation API)

**Status: pendente de revalidação contra ambiente real.**

`09_pixout.feature` tem 6 asserções tolerantes (`status X ou Y`) sem achado
documentado explicando o motivo da tolerância. Este arquivo existe como
placeholder para quando essas asserções forem investigadas ao vivo e
confirmadas/documentadas como achado real (ou removidas, se a API já
responde de forma determinística e a tolerância deixou de ser necessária).

## Asserções tolerantes pendentes de investigação

| Linha | Cenário                                                     | Step                                                       | Status aceitos |
| ----- | ----------------------------------------------------------- | ---------------------------------------------------------- | -------------- |
| 70    | `Validacao de PixOut sem massa (400 do Rule Engine ou 200)` | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |
| 95    | `Validacao de PixOut sem pixKey`                            | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |
| 99    | `Validacao de PixOut com keyType invalido`                  | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |
| 103   | `Validacao de PixOut com projectId nao-UUID`                | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |
| 107   | `Criar regras PIX sem userEmail`                            | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |
| 111   | `Deletar regras PIX sem campaignId no corpo`                | `Entao o status da resposta de PixOut deve ser 400 ou 200` | 400 ou 200     |

Próximo passo: rodar esses 6 casos ao vivo contra o ambiente real, registrar
qual status a API de fato retorna hoje para cada um e, se for sempre o
mesmo, apertar a asserção para o valor único (removendo a tolerância).
