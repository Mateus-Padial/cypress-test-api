# language: pt
@wallet @wallet-authorization
Funcionalidade: Wallet - Authorization / Capture / Cancellation / Reversal
  Como consumidor da Wallet Transactional API (Accounting Ledger)
  Quero criar autorizacoes de pagamento e capturar, cancelar ou revertê-las
  Para validar o contrato do fluxo de autorizacao da Wallet

  Contexto:
    Dado que possuo um token de autenticacao valido para a Wallet API

  @wallet-write @requer-massa
  Cenario: [Authorization] Criar autorizacao valida
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio uma autorizacao na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de autorizacao

  Cenario: [Authorization] Sem token de autenticacao
    Quando eu crio uma autorizacao na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  Cenario: [Authorization] Sem o header Idempotency-Key
    Quando eu crio uma autorizacao na Wallet API sem o header Idempotency-Key
    Entao o status da resposta da Wallet API deve ser 400 ou 422

  @wallet-write @requer-massa
  Cenario: [Capture] Capturar autorizacao recem-criada
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio uma autorizacao na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu capturo a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de captura

  Cenario: [Capture] Sem token de autenticacao
    Quando eu capturo a autorizacao recem-criada na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @wallet-write @requer-massa
  Cenario: [Cancellation] Cancelar autorizacao recem-criada
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio uma autorizacao na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu cancelo a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 201
    E a resposta da Wallet API deve seguir o schema de cancelamento

  @wallet-write @requer-massa
  Cenario: [Reversal] Reverter autorizacao recem-criada
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio uma autorizacao na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu capturo a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu reverto a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 201
    E a resposta da Wallet API deve seguir o schema de reversao de autorizacao

  Cenario: [Reversal] Sem token de autenticacao
    Quando eu reverto a autorizacao recem-criada na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @wallet-write @requer-massa
  Cenario: [Reversal parcial] Reverter parcialmente autorizacao recem-criada
    Quando eu consulto a campanha de depositos a expirar na Wallet API
    Quando eu crio uma autorizacao na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu capturo a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    Quando eu reverto parcialmente a autorizacao recem-criada na Wallet API
    Entao o status da resposta da Wallet API deve ser 201
    E a resposta da Wallet API deve seguir o schema de reversao de autorizacao
