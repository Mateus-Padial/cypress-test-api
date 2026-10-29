# language: pt
@order-pix-criacao
Funcionalidade: Criacao de transacao Pix na Order API
  Como consumidor da Order API
  Quero criar uma transacao Pix
  Para validar o fluxo positivo de Pix
@skip
  Cenario: Criar transacao Pix retorna 200
    Dado que possuo um token de autenticacao valido para a Order API
    Quando crio um pix na Order API
    Entao o status da resposta da Order API deve ser 200
