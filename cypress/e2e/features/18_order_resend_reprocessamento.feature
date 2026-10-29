# language: pt
@order @resend-cronjob
Funcionalidade: Order API - Reenvio e reprocessamento pelo cronjob (lento)
  Como consumidor do servico de ordens
  Quero reenviar uma transacao com falha de pagamento e confirmar que o
  cronjob a reprocessa dentro da janela esperada
  Para validar o fluxo completo de recuperacao de pagamento (resend -> approve -> cronjob)

  Contexto:
    Dado que possuo um token de autenticacao valido para a Order API

  @requer-condicao-ambiente
  Cenario: Reenviar transacao Boleto via lote, reaprovar e aguardar o cronjob
    Quando descubro uma transacao Boleto com status "PaymentFailed" na Order API
    E reenvio o lote da transacao descoberta na Order API
    Entao o reenvio do lote deve ser aceito
    Quando reaprovo o lote reenviado na Order API
    Entao a reaprovacao do lote reenviado deve ser aceita
    Quando aguardo o reprocessamento da transacao pelo cronjob da Order API
    Entao registro o status final da transacao apos o reprocessamento

  @requer-condicao-ambiente
  Cenario: Reenviar transacao Boleto individualmente, reaprovar o lote e aguardar o cronjob
    Quando descubro uma transacao Boleto com status "PaymentFailed" na Order API
    E reenvio a transacao descoberta na Order API
    Entao o reenvio da transacao deve ser aceito
    Quando reaprovo o lote reenviado na Order API
    Entao a reaprovacao do lote reenviado deve ser aceita
    Quando aguardo o reprocessamento da transacao pelo cronjob da Order API
    Entao registro o status final da transacao apos o reprocessamento

  @requer-condicao-ambiente
  Cenario: Reenviar transacao Pix via lote, reaprovar e aguardar o cronjob
    Quando descubro uma transacao Pix com status "PaymentFailed" na Order API
    E reenvio o lote da transacao descoberta na Order API
    Entao o reenvio do lote deve ser aceito
    Quando reaprovo o lote reenviado na Order API
    Entao a reaprovacao do lote reenviado deve ser aceita
    Quando aguardo o reprocessamento da transacao pelo cronjob da Order API
    Entao registro o status final da transacao apos o reprocessamento
