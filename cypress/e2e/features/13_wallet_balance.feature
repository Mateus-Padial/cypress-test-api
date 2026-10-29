# language: pt
@wallet
Funcionalidade: Saldo da carteira - GET 
  Como consumidor da Wallet Transactional API (Accounting Ledger)
  Quero consultar o saldo de uma conta digital
  Para validar o contrato do endpoint de Balance

  Contexto:
    Dado que possuo um token de autenticacao valido para a Wallet API

  @requer-massa
  Cenario: [Balance] Consulta de saldo com ids validos
    Quando consulto o saldo da carteira na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo

  Cenario: [Balance] Sem token de autenticacao
    Quando consulto o saldo da carteira na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @achado-qa @requer-massa
  Cenario: [Balance] Subscription key com valor invalido NAO retorna erro (achado de QA)
    Quando consulto o saldo da carteira na Wallet API com a subscription key invalida
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo

  @achado-qa @requer-massa
  Cenario: [Balance] creditStampedId inexistente NAO filtra nem retorna erro (achado de QA)
    Quando consulto o saldo da carteira na Wallet API com creditStampedId inexistente
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo

  @requer-massa
  Cenario: [Balance on hold] Consulta de saldo bloqueado com ids validos
    Quando consulto o saldo bloqueado (on hold) da carteira na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo bloqueado

  Cenario: [Balance on hold] Sem token de autenticacao
    Quando consulto o saldo bloqueado (on hold) da carteira na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  @achado-qa
  Cenario: [Balance on hold] Accounting ledger inexistente retorna 404
    Quando consulto o saldo bloqueado (on hold) de um accounting ledger inexistente na Wallet API
    Entao o status da resposta da Wallet API deve ser 404

  @achado-qa
  Cenario: [Balance on hold] Digital account inexistente retorna 404
    Quando consulto o saldo bloqueado (on hold) de uma digital account inexistente na Wallet API
    Entao o status da resposta da Wallet API deve ser 404

  @achado-qa @requer-massa
  Cenario: [Balance on hold] creditStampedId inexistente NAO filtra nem retorna erro (achado de QA)
    Quando consulto o saldo bloqueado (on hold) da carteira na Wallet API com creditStampedId inexistente
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo bloqueado

  @requer-massa
  Cenario: [Balance campanha] Consulta com ids validos
    Quando consulto o saldo da campanha na Wallet API
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha

  Cenario: [Balance campanha] Sem token de autenticacao
    Quando consulto o saldo da campanha na Wallet API sem token de autenticacao
    Entao o status da resposta da Wallet API deve ser 401

  Cenario: [Balance campanha] Sem o header campaignId (obrigatorio)
    Quando consulto o saldo da campanha na Wallet API sem o header campaignId
    Entao o status da resposta da Wallet API deve ser 400

  Cenario: [Balance campanha] Accounting ledger inexistente retorna 404
    Quando consulto o saldo da campanha de um accounting ledger inexistente na Wallet API
    Entao o status da resposta da Wallet API deve ser 404

  @achado-qa @requer-massa
  Cenario: [Balance campanha] Paginacao com pageNumber >= 2 perde totalItems (achado de QA)
    Quando consulto o saldo da campanha na Wallet API com pageNumber 2 e pageSize 3
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha sem totalItems

  @achado-qa @requer-massa
  Cenario: [Balance campanha] campaignId inexistente NAO retorna erro (achado de QA)
    Quando consulto o saldo da campanha na Wallet API com campaignId 999999999
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha

  @achado-qa @requer-massa
  Cenario: [Balance campanha] Subscription key ausente NAO retorna erro (achado de QA)
    Quando consulto o saldo da campanha na Wallet API sem a subscription key
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha

  @achado-qa @requer-massa
  Cenario: [Balance campanha] pageSize zero ou negativo nao e rejeitado (achado de QA)
    Quando consulto o saldo da campanha na Wallet API com pageSize 0
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha

  @achado-qa @requer-massa
  Cenario: [Balance campanha] pageNumber negativo nao e rejeitado (achado de QA)
    Quando consulto o saldo da campanha na Wallet API com pageNumber -1
    Entao o status da resposta da Wallet API deve ser 200
    E a resposta da Wallet API deve seguir o schema de saldo de campanha

  @requer-massa
  Cenario: [Balance campanha] pageSize acima do limite maximo e rejeitado
    Quando consulto o saldo da campanha na Wallet API com pageSize 99999
    Entao o status da resposta da Wallet API deve ser 400
