# language: pt
@wallet @wallet-statement
Funcionalidade: Wallet - Statement (extrato da conta digital)
  Como consumidor da Wallet Transactional API (Accounting Ledger)
  Quero consultar o extrato de uma conta digital (por periodo, consolidado ou paginado)
  Para validar o contrato dos endpoints de extrato da Wallet

  Contexto:
    Dado que possuo um token de autenticacao valido para a Wallet API

  @wallet-write @requer-massa
  Cenario: [Statement] Consulta de extrato por periodo
    Quando eu importo transacoes em lote na Wallet API
    Quando eu consulto o extrato da carteira na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de extrato

  Cenario: [Statement] Sem token de autenticacao
    Quando eu consulto o extrato da carteira na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @wallet-write @requer-massa
  Cenario: [Statement consolidated] Consulta consolidada
    Quando eu importo transacoes em lote na Wallet API
    Quando eu consulto o extrato consolidado da carteira na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de extrato consolidado

  Cenario: [Statement consolidated] Sem token de autenticacao
    Quando eu consulto o extrato consolidado da carteira na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @wallet-write @requer-massa
  Cenario: [Statement paginated] Consulta paginada com ids validos
    Quando eu importo transacoes em lote na Wallet API
    Quando eu consulto o extrato paginado da carteira na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de extrato paginado

  @wallet-write @requer-massa
  Cenario: [Statement paginated] pageNumber e pageSize customizados
    Quando eu importo transacoes em lote na Wallet API
    Quando eu consulto o extrato paginado da carteira na Wallet API com pageNumber 1 e pageSize 5
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de extrato paginado

  Cenario: [Statement paginated] Accounting ledger inexistente
    Quando eu consulto o extrato paginado de um accounting ledger inexistente na Wallet API
    Entao o status da resposta da Wallet API deve ser 404

  Cenario: [Statement paginated] Sem token de autenticacao
    Quando eu consulto o extrato paginado da carteira na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401
