# language: pt
@billpayment
Funcionalidade: BillPayment - Validation API (SF.FinancialServices.Validation BFF)
  Como consumidor do servico de validacao
  Quero validar boletos e gerenciar regras de pagamento de contas
  Para garantir que apenas boletos compativeis com a campanha/catalogo sejam aceitos

  Contexto:
    Dado que possuo um token de autenticacao valido para o BillPayment

  @requer-massa
  Cenario: Validacao de boleto valido retorna sucesso (ou 400 por instabilidade da CIP)
    Quando envio um boleto para validacao no BillPayment
    Entao o status da resposta de BillPayment deve ser 200 ou 400
    E se falhar, a validacao de boleto deve indicar erro do Rule Engine

  @requer-massa
  Cenario: Consulta de regras de boleto configuradas
    Quando consulto as regras de BillPayment
    Entao o status da resposta de BillPayment deve ser 200
    E as regras de boleto devem respeitar o contrato

  @requer-massa
  Cenario: CRUD de regras de boleto (criar, atualizar, deletar)
    Quando crio regras de BillPayment para uma campanha e catalogo validos
    Entao o status da resposta de BillPayment deve ser 200
    E a operacao de regras deve indicar sucesso
    Quando atualizo as regras de BillPayment
    Entao o status da resposta de BillPayment deve ser 200
    E a operacao de regras deve indicar sucesso
    Quando deleto as regras de BillPayment
    Entao o status da resposta de BillPayment deve ser 200
    E a operacao de regras deve indicar sucesso

  @requer-massa
  Cenario: Criar regras duplicadas retorna 400 do Rule Engine
    Quando crio regras de BillPayment para uma campanha e catalogo existente
    Entao o status da resposta de BillPayment deve ser 400
    E a validacao deve indicar erro do Rule Engine

  @requer-massa
  Cenario: Atualizar regras inexistentes retorna 400
    Quando atualizo as regras de BillPayment para uma campanha e catalogo inexistente
    Entao o status da resposta de BillPayment deve ser 400

  @caracterizacao
  Cenario: Validacao com paymentAmount elevado pode estourar limite (400) ou passar (200)
    Quando envio um boleto para validacao no BillPayment com paymentAmount 
    Entao o status da resposta de BillPayment deve ser 400 ou 200
    E se falhar, a validacao de boleto deve indicar erro do Rule Engine

  @caracterizacao
  Cenario: Consulta de regras inexistentes retorna 400 do Rule Engine
    Quando consulto as regras de BillPayment inexistentes
    Entao o status da resposta de BillPayment deve ser 400
    E a validacao deve indicar erro do Rule Engine

  @caracterizacao
  Cenario: Lista de campanhas com regras retorna 200 paginado
    Quando consulto as campanhas de BillPayment
    Entao o status da resposta de BillPayment deve ser 200
    E as campanhas devem respeitar o contrato paginado

  Cenario: Validacao sem o campo barCode
    Quando envio um boleto para validacao sem o campo barCode
    Entao o status da resposta de BillPayment deve ser 400 ou 200

  Cenario: Validacao sem campaignId
    Quando envio um boleto para validacao sem o campo campaignId
    Entao o status da resposta de BillPayment deve ser 400 ou 200

  Cenario: Validacao com corpo vazio
    Quando envio um boleto para validacao com corpo vazio
    Entao o status da resposta de BillPayment deve ser 400 ou 200

  Cenario: Criar regras sem userEmail
    Quando crio regras de BillPayment sem o campo userEmail
    Entao o status da resposta de BillPayment deve ser 400 ou 200

  Cenario: Deletar regras sem campaignId no corpo
    Quando deleto as regras de BillPayment sem o campo campaignId
    Entao o status da resposta de BillPayment deve ser 400 ou 200
