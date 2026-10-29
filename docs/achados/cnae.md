# Achados de QA — CNAE (Validation API)

**Status: pendente de revalidação contra ambiente real.**

`06_cnae.feature` tem 3 asserções tolerantes (`status X ou Y`) sem achado
documentado explicando o motivo da tolerância. Este arquivo existe como
placeholder para quando essas asserções forem investigadas ao vivo e
confirmadas/documentadas como achado real (ou removidas, se a API já
responde de forma determinística e a tolerância deixou de ser necessária).

## Asserções tolerantes pendentes de investigação

| Linha | Cenário                                                                      | Step                                                     | Status aceitos |
| ----- | ---------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| 30    | `[CNAE] Requisicao sem o campo document`                                     | `Entao o status da resposta de CNAE deve ser 200 ou 400` | 200 ou 400     |
| 34    | `[CNAE] Requisicao com corpo vazio`                                          | `Entao o status da resposta de CNAE deve ser 200 ou 400` | 200 ou 400     |
| 39    | `[CNAE] Documento malformado - <descricao>` (Esquema do Cenário, 4 exemplos) | `Entao o status da resposta de CNAE deve ser 200 ou 400` | 200 ou 400     |

Próximo passo: rodar esses 3 casos ao vivo contra o ambiente real, registrar
qual status a API de fato retorna hoje e, se for sempre o mesmo, apertar a
asserção para o valor único (removendo a tolerância). Se o comportamento for
genuinamente não-determinístico, documentar aqui a causa (nos moldes do
achado de CIP em `billpayment.md`) antes de manter a tolerância.
