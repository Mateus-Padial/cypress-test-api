# language: pt
@cnae
Funcionalidade: Validacao de CNAE - POST 
  Como consumidor do servico financeiro de CNAE
  Quero validar um documento (CNPJ) contra o catalogo de CNAEs
  Para garantir que apenas documentos elegiveis sejam aceitos

  Contexto:
    Dado que possuo um token de autenticacao valido para o CNAE

  @requer-massa
  Cenario: [CNAE] Documento valido e aceito pelo catalogo
    Dado um documento valido do catalogo
    Quando eu envio o documento para validacao de CNAE
    Entao o status da resposta de CNAE deve ser 200
    E a resposta de CNAE deve indicar sucesso
    E o CNAE deve ser considerado valido
    E a resposta deve ecoar o documento enviado

  Cenario: [CNAE] Requisicao sem o campo document
    Quando eu envio uma requisicao de CNAE sem o documento
    Entao o status da resposta de CNAE deve ser 200 ou 400

  Cenario: [CNAE] Requisicao com corpo vazio
    Quando eu envio uma requisicao de CNAE com corpo vazio
    Entao o status da resposta de CNAE deve ser 200 ou 400

  Esquema do Cenario: [CNAE] Documento malformado - <descricao>
    Dado o documento "<documento>"
    Quando eu envio o documento para validacao de CNAE
    Entao o status da resposta de CNAE deve ser 200 ou 400

    Exemplos:
      | documento          | descricao                        |
      | 123                | curto demais para ser CNPJ       |
      | abcdefghijklmn     | nao numerico                     |
      | 00000000000000     | zeros (DV invalido)              |
      | 11.111.111/1111-11 | com mascara e DV invalido        |
