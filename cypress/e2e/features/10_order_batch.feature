# language: pt
@order
Funcionalidade: Order API - Lotes e Grupos de Lotes (SF.FinancialService.Order)
  Como consumidor do servico de ordens
  Quero gerenciar lotes e grupos de lotes
  Para garantir o contrato dos endpoints de Batch e BatchGroup

  Contexto:
    Dado que possuo um token de autenticacao valido para a Order API

  Cenario: Listar lotes respeita o contrato paginado
    Quando consulto a lista de lotes da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  @achado-qa
  Esquema do Cenario: [ACHADO] Listar lotes com <parametro> negativo retorna 500 em vez de 400
    Quando consulto a lista de lotes da Order API com "<parametro>" igual a <valor>
    Entao a resposta da Order API deve indicar o vazamento do RuleEngine (achado de QA)

    Exemplos:
      | parametro | valor |
      | Limit     | -5    |
      | Offset    | -1    |

  @requer-massa
  Cenario: Detalhes de um lote por id
    Quando consulto os detalhes de um lote da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Detalhes de lote inexistente retornam 400
    Quando consulto os detalhes de um lote inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Detalhes agrupados de um lote
    Quando consulto os detalhes agrupados de um lote da Order API
    Entao o status da resposta da Order API deve ser 200

  Cenario: Detalhes agrupados de lote inexistente retornam 400
    Quando consulto os detalhes agrupados de um lote inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Transacoes de um lote respeitam o contrato paginado
    Quando consulto as transacoes de um lote da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  @requer-massa
  Cenario: Lotes disponiveis para uma transacao
    Quando consulto os lotes disponiveis para uma transacao da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  Cenario: Lotes disponiveis para transacao inexistente retornam 400
    Quando consulto os lotes disponiveis para uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Criar lote com corpo vazio retorna 400
    Quando crio um lote na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Aprovar lote com corpo vazio retorna 400
    Quando aprovo um lote na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Reprovar lote com corpo vazio retorna 400
    Quando reprovo um lote na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Adicionar transacao a lote inexistente retorna 400
    Quando adiciono uma transacao a um lote inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @resend @requer-condicao-ambiente
  Cenario: Reenviar lote com transacao com falha de pagamento
    Quando descubro uma transacao Boleto com status "PaymentFailed" na Order API
    E reenvio o lote da transacao descoberta na Order API
    Entao o reenvio do lote deve ser aceito
    E os ids reenviados pelo lote devem incluir a transacao descoberta

  @resend 
  Cenario: Reenviar lote inexistente retorna 400
    Quando reenvio o lote de uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Listar grupos de lotes respeita o contrato paginado
    Quando consulto a lista de grupos de lotes da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  Cenario: Listar grupos pendentes de associacao
    Quando consulto os grupos pendentes de associacao da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  @requer-massa
  Cenario: Detalhes de um grupo de lotes
    Quando consulto os detalhes de um grupo de lotes da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Detalhes de grupo inexistente retornam 400
    Quando consulto os detalhes de um grupo de lotes inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Lotes de um grupo respeitam o contrato paginado
    Quando consulto os lotes de um grupo da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  Cenario: Lotes de grupo inexistente retornam 400
    Quando consulto os lotes de um grupo inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Relatorio de um grupo de lotes
    Quando consulto o relatorio de um grupo de lotes da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter uma colecao

  Cenario: Relatorio de grupo inexistente retorna 400
    Quando consulto o relatorio de um grupo de lotes inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Criar grupo de lotes com corpo vazio retorna 400
    Quando crio um grupo de lotes na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Excluir grupo de lotes com corpo vazio retorna 400
    Quando excluo um grupo de lotes na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Aprovar grupo (negocio) com corpo vazio retorna 400
    Quando aprovo um grupo de lotes no nivel negocio na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Aprovar grupo (fatura) com corpo vazio retorna 400
    Quando aprovo um grupo de lotes no nivel fatura na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Remover lote do grupo com corpo vazio retorna 400
    Quando removo um lote do grupo na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Associar lotes ao grupo com corpo vazio retorna 400
    Quando associo lotes a um grupo na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Confirmar pagamento do grupo com corpo vazio retorna 400
    Quando confirmo o pagamento de um grupo na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400
