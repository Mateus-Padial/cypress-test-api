# language: pt
@audit
Funcionalidade: Auditoria - GET  (Validation API)
  Como consumidor do servico de validacao
  Quero consultar os logs de auditoria das operacoes de regras
  Para verificar o historico de acoes sobre BillPayment/PixOut

  Contexto:
    Dado que possuo um token de autenticacao valido para o Audit da Validation API

  @requer-massa
  Cenario: [Audit] Consulta de logs com filtros retorna 200 paginado
    Dado filtros de auditoria com CampaignId e CatalogId validos
    Quando consulto os logs de auditoria
    Entao o status da resposta de audit deve ser 200
    E a resposta de audit deve indicar sucesso paginado
    E os logs de audit devem respeitar o contrato

  @caracterizacao
  Cenario: [Audit] Consulta de logs sem filtros retorna 200 com lista vazia
    Quando consulto os logs de auditoria sem filtros
    Entao o status da resposta de audit deve ser 200
    E a resposta de audit deve indicar sucesso paginado

  Esquema do Cenario: [Audit] Filtro <filtro>="<valor>" - <descricao>
    Dado o filtro de auditoria "<filtro>" com o valor "<valor>"
    Quando consulto os logs de auditoria
    Entao o status da resposta de audit deve ser 400 ou 200

    Exemplos:
      | filtro        | valor  | descricao                       |
      | EntityType    | XXXX   | EntityType fora do enum          |
      | OperationType| ZZZZ    | OperationType fora do enum       |
      | Success       | talvez | Success nao-booleano            |

  Cenario: [Audit] Paginacao invalida (PageNumber negativo)
    Dado o filtro de auditoria "PageNumber" com o valor "-1"
    Quando consulto os logs de auditoria
    Entao o status da resposta de audit deve ser 400 ou 200
