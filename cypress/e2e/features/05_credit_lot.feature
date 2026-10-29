# language: pt
@credit-lot
Funcionalidade: Criacao de lote de credito - POST 
  Como usuario do Admin
  Quero criar uma solicitacao de credito a partir de um arquivo .csv valido
  Para obter o id da solicitacao e acompanhar o status do processamento

  Cenario: [CreditLot] Criar solicitacao com arquivo valido e consultar status
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando consulto o status da solicitacao
    Entao o status do lote deve estar presente

  Esquema do Cenario: [CreditLot] Criacao recusada - <arquivo>
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/negativos/<arquivo>"
    Entao a criacao do lote deve ser recusada

    Exemplos:
      | arquivo                          |
      | S-N01_arquivo_vazio.csv          |
      | S-N04_coluna_faltando.csv        |
      | S-N05_coluna_extra.csv           |
      | S-N06_ordem_colunas_alterada.csv |

  @skip @credit-lot-actions
  Cenario: [CreditLot] Aprovar um lote com o mesmo usuario solicitante e negado
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando aguardo o lote ficar pronto para acao
    E eu aprovo o lote
    Entao a acao deve ser recusada com a mensagem "Aprovação negada"

    @skip @credit-lot-actions
  Cenario: [CreditLot] Reprovar um lote com o mesmo usuario solicitante e negado
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando aguardo o lote ficar pronto para acao
    E eu reprovo o lote
    Entao a acao deve ser recusada com a mensagem "Cancelamento negado"

  @credit-lot-actions
  Cenario: [CreditLot] Cancelar um lote com o mesmo usuario solicitante e aceito
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando aguardo o lote ficar pronto para acao
    E eu cancelo o lote
    Entao a acao deve ser aceita

  @credit-lot-actions @requer-condicao-ambiente
  Cenario: [CreditLot] Aprovar e depois reprovar o mesmo lote (requer outro executor)
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando aguardo o lote ficar pronto para acao
    E eu aprovo o lote
    Entao a acao deve ser aceita
    Quando eu reprovo o lote
    Entao a acao deve ser aceita

  @credit-lot-actions @requer-condicao-ambiente
  Cenario: [CreditLot] Terceira acao encadeada (aprovar+reprovar+cancelar) e recusada
    Dado que possuo um token de autenticacao valido
    Quando eu crio uma solicitacao de credito com o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Entao a solicitacao deve ser criada com sucesso
    E devo obter o id da solicitacao
    Quando aguardo o lote ficar pronto para acao
    E eu aprovo o lote
    Entao a acao deve ser aceita
    Quando eu reprovo o lote
    Entao a acao deve ser aceita
    Quando eu cancelo o lote
    Entao a acao deve ser recusada
