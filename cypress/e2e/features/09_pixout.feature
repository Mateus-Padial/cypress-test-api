# language: pt
@pixout
Funcionalidade: PixOut - Validation API (SF.FinancialServices.Validation BFF)
  Como consumidor do servico de validacao
  Quero validar PixOut e gerenciar regras de PIX
  Para garantir que apenas operacoes compativeis com a campanha/catalogo sejam aceitas

  Contexto:
    Dado que possuo um token de autenticacao valido para o PixOut

  @requer-massa
  Cenario: Validacao de PixOut valida retorna sucesso
    Quando envio um PixOut para validacao
    Entao o status da resposta de PixOut deve ser 200
    E a validacao de PixOut deve indicar sucesso

  @caracterizacao
  Cenario: Consulta de regras PIX (sem regra cadastrada) retorna 400 do Rule Engine
    Quando consulto as regras de PixOut
    Entao o status da resposta de PixOut deve ser 400
    E a validacao de PixOut deve indicar erro do Rule Engine de regras

  @requer-massa
  Cenario: Consulta de parcelamento PIX configurado
    Quando consulto o parcelamento de PixOut
    Entao o status da resposta de PixOut deve ser 200
    E o parcelamento de PixOut deve respeitar o contrato

  @requer-massa
  Cenario: CRUD de regras PIX (criar, atualizar, deletar)
    Quando crio regras de PixOut para uma campanha e catalogo validos
    Entao o status da resposta de PixOut deve ser 200
    E a operacao de regras de PixOut deve indicar sucesso
    Quando atualizo as regras de PixOut
    Entao o status da resposta de PixOut deve ser 200
    E a operacao de regras de PixOut deve indicar sucesso
    Quando deleto as regras de PixOut
    Entao o status da resposta de PixOut deve ser 200
    E a operacao de regras de PixOut deve indicar sucesso

  @requer-massa
  Cenario: Criar regras PIX duplicadas retorna 409
    Quando crio regras de PixOut para uma campanha e catalogo existente
    Entao o status da resposta de PixOut deve ser 409

  @requer-massa
  Cenario: Atualizar regras PIX inexistentes retorna 404
    Quando atualizo as regras de PixOut para uma campanha e catalogo inexistente
    Entao o status da resposta de PixOut deve ser 404

  @caracterizacao
  Cenario: Validacao de PixOut sem massa (400 do Rule Engine ou 200)
    Quando envio um PixOut para validacao
    Entao o status da resposta de PixOut deve ser 400 ou 200
    E a validacao de PixOut deve indicar erro do Rule Engine ou contrato

  @caracterizacao
  Cenario: Consulta de regras PIX inexistentes retorna 400 do Rule Engine
    Quando consulto as regras de PixOut inexistentes
    Entao o status da resposta de PixOut deve ser 400
    E a validacao de PixOut deve indicar erro do Rule Engine de regras

  @caracterizacao
  Cenario: Consulta de parcelamento de campanha inexistente retorna 400 do Rule Engine
    Quando consulto o parcelamento de PixOut inexistente
    Entao o status da resposta de PixOut deve ser 400
    E a validacao de PixOut deve indicar erro do Rule Engine

  @caracterizacao
  Cenario: Lista de campanhas PIX retorna 200 paginado
    Quando consulto as campanhas de PixOut
    Entao o status da resposta de PixOut deve ser 200
    E as campanhas de PixOut devem respeitar o contrato paginado

  Cenario: Validacao de PixOut sem pixKey
    Quando envio um PixOut para validacao sem o campo pixKey
    Entao o status da resposta de PixOut deve ser 400 ou 200

  Cenario: Validacao de PixOut com keyType invalido
    Quando envio um PixOut para validacao com keyType invalido
    Entao o status da resposta de PixOut deve ser 400 ou 200

  Cenario: Validacao de PixOut com projectId nao-UUID
    Quando envio um PixOut para validacao com projectId nao-UUID
    Entao o status da resposta de PixOut deve ser 400 ou 200

  Cenario: Criar regras PIX sem userEmail
    Quando crio regras de PixOut sem o campo userEmail
    Entao o status da resposta de PixOut deve ser 400 ou 200

  Cenario: Deletar regras PIX sem campaignId no corpo
    Quando deleto as regras de PixOut sem o campo campaignId
    Entao o status da resposta de PixOut deve ser 400 ou 200
