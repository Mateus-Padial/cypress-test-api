# language: pt
@wallet @wallet-credit
Funcionalidade: Wallet - Credit / Deposit / Reversal / Import
  Como consumidor da Wallet Transactional API (Accounting Ledger)
  Quero criar e consultar depositos, revertê-los e importar transacoes em lote
  Para validar o contrato dos endpoints de credito da Wallet

  Contexto:
    Dado que possuo um token de autenticacao valido para a Wallet API

  @skip @wallet-write @requer-massa
  Cenario: [Deposit] Criar deposito com dados validos
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio um deposito na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de deposito

  Cenario: [Deposit] Sem token de autenticacao
    Quando eu crio um deposito na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  Cenario: [Deposit] Sem o campo amount
    Quando eu crio um deposito na Wallet API sem o campo amount
    Entao o status da resposta da Wallet API deve ser 400 ou 422

  Cenario: [Deposit] Sem o campo description
    Quando eu crio um deposito na Wallet API sem o campo description
    Entao o status da resposta da Wallet API deve ser 400 ou 422

  Cenario: [Deposit] Sem o header Idempotency-Key
    Quando eu crio um deposito na Wallet API sem o header Idempotency-Key
    Entao o status da resposta da Wallet API deve ser 400 ou 422

  @requer-massa
  Cenario: [Deposits to expire] Consulta com ids validos
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu consulto os depositos a expirar na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de depositos a expirar

  Cenario: [Deposits to expire] Sem token de autenticacao
    Quando eu consulto os depositos a expirar na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @requer-massa
  Cenario: [Deposits to consume] Consulta com ids validos
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu consulto os depositos a consumir na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de depositos a consumir

  @skip @requer-massa
  Cenario: [Deposits by external code] Consulta com codigo existente
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu consulto um deposito pelo codigo externo na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de deposito por codigo externo

  Cenario: [Deposits by external code] Sem token de autenticacao
    Quando eu consulto um deposito pelo codigo externo na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @skip @requer-massa
  Cenario: [Campaign to expire] Consulta com ids validos
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de campanha de depositos a expirar

  Cenario: [Campaign to expire] Sem o header campaignId (obrigatorio)
    Quando eu consulto a campanha de depositos a expirar na Wallet API sem o header campaignId
    Entao o status da resposta da Wallet API deve ser 400

  Cenario: [Campaign to expire] Accounting ledger inexistente
    Quando eu consulto a campanha de depositos a expirar de um accounting ledger inexistente na Wallet API
    Entao o status da resposta da Wallet API deve ser 404

  @wallet-write @requer-massa
  Cenario: [Deposit reversal] Reverter deposito recem-criado
    Quando eu crio um deposito na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu reverto o deposito recem-criado na Wallet API
    Entao o status da resposta da Wallet API deve ser 201
    E a resposta da Wallet API deve seguir o schema de reversao de credito

  Cenario: [Deposit reversal] Sem token de autenticacao
    Quando eu reverto o deposito recem-criado na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @wallet-write @requer-massa
  Cenario: [Deposit reversal parcial] Reverter parcialmente deposito recem-criado
    Quando eu crio um deposito na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu reverto parcialmente o deposito recem-criado na Wallet API
    Entao o status da resposta da Wallet API deve ser 201
    E a resposta da Wallet API deve seguir o schema de reversao de credito

  @wallet-write @requer-massa
  Cenario: [Transactions import] Importar lote valido
    Quando eu importo transacoes em lote na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de importacao de transacoes

  Cenario: [Transactions import] Corpo vazio
    Quando eu importo transacoes em lote na Wallet API com corpo vazio
    Entao o status da resposta da Wallet API deve ser 400 ou 409 ou 422
