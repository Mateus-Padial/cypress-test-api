# language: pt
@order
Funcionalidade: Order API - Faturamento, Boleto, Pix, Supplier e Transacoes
  Como consumidor do servico de ordens
  Quero consultar faturamentos, boletos, pix, suppliers e transacoes
  Para garantir o contrato dos demais endpoints da Order API

  Contexto:
    Dado que possuo um token de autenticacao valido para a Order API

  @caracterizacao
  Cenario: Consultar faturamentos de grupo sem faturamento retorna 400
    Quando consulto os faturamentos de um grupo de lotes da Order API
    Entao o status da resposta da Order API deve ser 400

  Cenario: Criar faturamentos com corpo vazio retorna 400
    Quando crio faturamentos de um grupo na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Atualizar faturamentos com corpo vazio retorna 400
    Quando atualizo faturamentos de um grupo na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  Cenario: Remover faturamento inexistente retorna 400
    Quando removo um faturamento inexistente da Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @boleto-pre-auth
  Cenario: Criar boleto com corpo vazio retorna erros de validacao
    Quando crio um boleto na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400
    E a resposta da Order API deve indicar erro de validacao pre-auth

  @requer-massa
  Cenario: Listar boletos de um lote
    Quando consulto os boletos de um lote da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter uma colecao

  @requer-massa
  Cenario: Consultar boleto de um pedido
    Quando consulto o boleto de um pedido da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Consultar boleto de pedido inexistente retorna 400
    Quando consulto o boleto de um pedido inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @caracterizacao
  Cenario: Consultar comprovante de boleto indisponivel retorna 400
    Quando consulto o comprovante do boleto de um pedido da Order API
    Entao o status da resposta da Order API deve ser 400

  Cenario: Solicitar pix com corpo vazio retorna 400
    Quando solicito um pix na Order API com corpo vazio
    Entao o status da resposta da Order API deve ser 400

  @caracterizacao
  Cenario: Listar pix de lote que nao e de pix retorna 400
    Quando consulto os pix de um lote da Order API
    Entao o status da resposta da Order API deve ser 400

  @requer-massa
  Cenario: Consultar pix de um pedido
    Quando consulto o pix de um pedido da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Consultar pix de pedido inexistente retorna 400
    Quando consulto o pix de um pedido inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @caracterizacao
  Cenario: Consultar comprovante de pix indisponivel retorna 400
    Quando consulto o comprovante de um pix da Order API
    Entao o status da resposta da Order API deve ser 400

  Cenario: Listar suppliers respeita o contrato paginado
    Quando consulto a lista de suppliers da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  Cenario: Filtrar transacoes respeita o contrato paginado
    Quando consulto o filtro de transacoes da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve respeitar o contrato paginado

  @requer-massa
  Cenario: Detalhes pix de uma transacao
    Quando consulto os detalhes pix de uma transacao da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Detalhes pix de transacao inexistente retornam 400
    Quando consulto os detalhes pix de uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Detalhes de bill payment de uma transacao
    Quando consulto os detalhes de bill payment de uma transacao da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter um objeto

  Cenario: Detalhes de bill payment de transacao inexistente retornam 400
    Quando consulto os detalhes de bill payment de uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @requer-massa
  Cenario: Historico de uma transacao
    Quando consulto o historico de uma transacao da Order API
    Entao o status da resposta da Order API deve ser 200
    E a resposta da Order API deve conter uma colecao

  Cenario: Historico de transacao inexistente retorna 400
    Quando consulto o historico de uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Cancelar transacao inexistente retorna 400
    Quando cancelo uma transacao inexistente da Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Cancelar transacao por pedido inexistente retorna 400
    Quando cancelo uma transacao por um pedido inexistente da Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  Cenario: Confirmar cancelamento por pedido inexistente retorna 400
    Quando confirmo o cancelamento de uma transacao por um pedido inexistente da Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @resend @requer-condicao-ambiente
  Cenario: Reenviar transacao Boleto com falha de pagamento
    Quando descubro uma transacao Boleto com status "PaymentFailed" na Order API
    E reenvio a transacao descoberta na Order API
    Entao o reenvio da transacao deve ser aceito
    E a transacao reenviada deve constar como "AwaitingProcessing"

  @skip @resend @requer-condicao-ambiente
  Cenario: Reenviar transacao Pix com falha de pagamento
    Quando descubro uma transacao Pix com status "PaymentFailed" na Order API
    E reenvio a transacao descoberta na Order API
    Entao o reenvio da transacao deve ser aceito
    E a transacao reenviada deve constar como "AwaitingProcessing"

  @resend 
  Cenario: Reenviar transacao inexistente retorna 400
    Quando reenvio uma transacao inexistente na Order API
    Entao a resposta da Order API deve indicar recurso nao encontrado

  @resend @requer-condicao-ambiente
  Cenario: Reenviar transacao que nao esta com falha de pagamento e recusado
    Quando descubro uma transacao Boleto com status "Paid" na Order API
    E reenvio a transacao descoberta na Order API
    Entao o reenvio da transacao com status divergente deve ser recusado
