# language: pt
@wallet @wallet-tenant
Funcionalidade: Wallet - TenantCredit (depositos por tenant)
  Como consumidor da Wallet Transactional API (Accounting Ledger)
  Quero consultar depositos de uma conta digital em todos os ledgers de um tenant
  Para validar o contrato dos endpoints de credito por tenant da Wallet

  Contexto:
    Dado que possuo um token de autenticacao valido para a Wallet API

  @requer-massa
  Cenario: [Tenant deposits] Consulta com tenant e conta validos
    Quando eu consulto os depositos do tenant na Wallet API
    Entao o status da resposta da Wallet API deve ser 403

  Cenario: [Tenant deposits] Tenant divergente do token autenticado
    Quando eu consulto os depositos do tenant na Wallet API com um tenant divergente
    Entao o status da resposta da Wallet API deve ser 403

  @requer-massa
  Cenario: [Tenant deposits] Paginacao customizada
    Quando eu consulto os depositos do tenant na Wallet API com pageNumber 2 e pageSize 5
    Entao o status da resposta da Wallet API deve ser 403

  @requer-massa
  Cenario: [Tenant deposit consumptions] Consulta valida
    Quando eu consulto os consumos do credito do tenant na Wallet API
    Entao o status da resposta da Wallet API deve ser 403

  Cenario: [Tenant deposit consumptions] Credito inexistente
    Quando eu consulto os consumos de um credito inexistente do tenant na Wallet API
    Entao o status da resposta da Wallet API deve ser 403

  Cenario: [Tenant deposit consumptions] Tenant divergente do token autenticado
    Quando eu consulto os consumos do credito do tenant na Wallet API com um tenant divergente
    Entao o status da resposta da Wallet API deve ser 403
