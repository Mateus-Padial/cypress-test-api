# language: pt
@com-id
Funcionalidade: Validacao de arquivo - Layout Com ID (id;login;nome;descricao;valor)
  Como usuario do Admin
  Quero validar arquivos .csv de importacao de creditos no layout com identificador
  Para garantir que apenas arquivos corretos sejam aceitos

  Esquema do Cenario: [ComId][Positivo] <arquivo> e aceito
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "02_com_id/positivos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                                 | loginTypeId |
      | ID-P01_um_registro.csv                  | 1           |
      | ID-P02_varios_registros_ids_validos.csv | 1           |
      | ID-P03_somente_cnpj.csv                 | 2           |
      | ID-P04_somente_cnpj_alfanumerico.csv    | 2           |
      | ID-P05_id_limite_valores_altos.csv      | 1           |
      | ID-P06_carga_1000_registros.csv         | 1           |

  Esquema do Cenario: [ComId][Negativo] <arquivo> e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "02_com_id/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha
    E a resposta deve conter detalhes de erro

    Exemplos:
      | arquivo                          | loginTypeId |
      | ID-N11_coluna_extra.csv          | 1           |
      | ID-N12_ordem_colunas_alterada.csv | 1          |
      | ID-N14_login_vazio.csv           | 1           |
      | ID-N15_valor_invalido.csv        | 1           |
      | ID-N17_delimitador_virgula.csv   | 1           |
      | ID-N13_mistura_login.csv         | 1           |

  Cenario: [ComId] Arquivo apenas com cabecalho e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "02_com_id/negativos/ID-N16_apenas_cabecalho.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha
