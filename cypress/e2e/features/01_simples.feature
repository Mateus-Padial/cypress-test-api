# language: pt
@simples
Funcionalidade: Validacao de arquivo - Layout Simples (login;nome;descricao;valor)
  Como usuario do Admin
  Quero validar arquivos .csv de importacao de creditos no layout simples
  Para garantir que apenas arquivos corretos sejam aceitos

  Esquema do Cenario: [Simples][Positivo] <arquivo> e aceito
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "01_simples/positivos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                              | loginTypeId |
      | S-P01_um_registro_cpf.csv            | 1           |
      | S-P02_varios_registros_cpf.csv       | 1           |
      | S-P03_somente_cnpj.csv               | 2           |
      | S-P04_somente_cnpj_alfanumerico.csv  | 2           |
      | S-P05_valores_altos.csv              | 1           |
      | S-P06_nome_descricao_grandes.csv     | 1           |
      | S-P07_acentos_nome_descricao.csv     | 1           |
      | S-P08_carga_1000_registros.csv       | 1           |

  Cenario: [Simples] Arquivo vazio e rejeitado sem processamento
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "01_simples/negativos/S-N01_arquivo_vazio.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E o campo success deve ser "false"

  Cenario: [Simples] Arquivo apenas com cabecalho e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "01_simples/negativos/S-N02_apenas_cabecalho.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha

  Esquema do Cenario: [Simples][Negativo] <arquivo> e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "01_simples/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha
    E a resposta deve conter detalhes de erro

    Exemplos:
      | arquivo                                | loginTypeId |
      | S-N04_coluna_faltando.csv              | 1           |
      | S-N05_coluna_extra.csv                 | 1           |
      | S-N06_ordem_colunas_alterada.csv       | 1           |
      | S-N07_delimitador_virgula.csv          | 1           |
      | S-N08_login_vazio.csv                  | 1           |
      | S-N16_valor_zero.csv                   | 1           |
      | S-N18_valor_decimal.csv                | 1           |
      | S-N19_valor_texto.csv                  | 1           |
      | S-N20_valor_caracteres_especiais.csv   | 1           |
      | S-N21_valor_vazio.csv                  | 1           |
      | S-N22_valor_muito_grande.csv           | 1           |
      | S-N24_descricao_vazia.csv              | 1           |
      | S-N27_aspas_nos_campos.csv             | 1           |
      | S-N28_delimitador_tab.csv              | 1           |
      | S-N29_delimitador_pipe.csv             | 1           |
      | S-N35_qtd_campos_inconsistente.csv     | 1           |
      | S-N37_valor_com_separador_milhar.csv   | 1           |
      | S-N41_arquivo_corrompido.csv           | 1           |
      | S-N42_cabecalho_nomes_errados.csv      | 1           |
      | S-N43_sem_cabecalho.csv                | 1           |
      | S-N44_delimitadores_duplos.csv         | 1           |
      | S-N45_newline_dentro_campo.csv         | 1           |

  Esquema do Cenario: [Simples][Negativo] <arquivo> voltou a ser rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "01_simples/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha

    Exemplos:
      | arquivo                              | loginTypeId |
      | S-N12_cnpj_alfanumerico_invalido.csv | 2           |
      | S-N13_mistura_cpf_cnpj.csv           | 2           |
      | S-N14_mistura_cpf_cnpj_alfa.csv      | 2           |
      | S-N31_login_com_mascara.csv          | 1           |
      | S-N10_cpf_qtd_digitos_errada.csv     | 1           |
      | S-N32_cpf_com_letras.csv             | 1           |

  Cenario: [Simples] Arquivo com emoji e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "01_simples/negativos/S-N25_emoji_nome_descricao.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400 ou 403
