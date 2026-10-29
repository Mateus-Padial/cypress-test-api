# Achados de QA — Audit (Validation API)

**Status: pendente de revalidação contra ambiente real.**

`07_audit.feature` tem 2 asserções tolerantes (`status X ou Y`) sem achado
documentado explicando o motivo da tolerância. Este arquivo existe como
placeholder para quando essas asserções forem investigadas ao vivo e
confirmadas/documentadas como achado real (ou removidas, se a API já
responde de forma determinística e a tolerância deixou de ser necessária).

## Asserções tolerantes pendentes de investigação

| Linha | Cenário                                                                                                                                         | Step                                                      | Status aceitos |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------- |
| 39    | `[Audit] Filtro <filtro>="<valor>" - <descricao>` (Esquema do Cenário, 3 exemplos: EntityType/OperationType fora do enum, Success não-booleano) | `Entao o status da resposta de audit deve ser 400 ou 200` | 400 ou 200     |
| 50    | `[Audit] Paginacao invalida (PageNumber negativo)`                                                                                              | `Entao o status da resposta de audit deve ser 400 ou 200` | 400 ou 200     |

Próximo passo: rodar esses casos ao vivo contra o ambiente real, registrar
qual status a API de fato retorna hoje para filtro fora do enum e para
paginação negativa, e se for sempre o mesmo, apertar a asserção para o valor
único (removendo a tolerância).
