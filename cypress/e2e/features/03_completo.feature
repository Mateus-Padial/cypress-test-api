# language: pt
@completo
Funcionalidade: Validacao de arquivo - Layout Completo (id;login;nome;descricao;valor;expiracao;origem)
  Como usuario do Admin
  Quero validar arquivos .csv de importacao de creditos no layout completo
  Para garantir que apenas arquivos corretos sejam aceitos

  Esquema do Cenario: [Completo][Positivo] <arquivo> e aceito
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "03_completo/positivos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                              | loginTypeId |
      | C-P01_um_registro.csv                | 1           |
      | C-P02_varios_registros_cpf.csv       | 1           |
      | C-P03_somente_cnpj.csv               | 2           |
      | C-P04_somente_cnpj_alfanumerico.csv  | 2           |
      | C-P05_ano_bissexto_valido.csv        | 1           |
      | C-P06_ultimo_dia_mes.csv             | 1           |
      | C-P07_carga_1000_registros.csv       | 1           |

  Esquema do Cenario: [Completo][Negativo] <arquivo> e rejeitado
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "03_completo/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E a validacao deve indicar falha
    E a resposta deve conter detalhes de erro

    Exemplos:
      | arquivo                                | loginTypeId |
      | C-N04_expiracao_passada.csv            | 1           |
      | C-N05_expiracao_formato_iso.csv        | 1           |
      | C-N06_expiracao_31_02.csv              | 1           |
      | C-N07_expiracao_29_02_nao_bissexto.csv | 1           |
      | C-N09_expiracao_texto.csv              | 1           |
      | C-N10_expiracao_mm_dd_yyyy.csv         | 1           |
      | C-N11_expiracao_com_hora.csv           | 1           |
      | C-N12_expiracao_dia_mes_zero.csv       | 1           |
      | C-N13_expiracao_ano_2_digitos.csv      | 1           |
      | C-N14_coluna_origem_faltando.csv       | 1           |
      | C-N15_coluna_expiracao_faltando.csv    | 1           |
      | C-N16_coluna_extra.csv                 | 1           |
      | C-N17_ordem_colunas_alterada.csv       | 1           |
      | C-N18_mistura_login.csv                | 1           |
      | C-N20_multiplos_erros_combinados.csv   | 1           |
      | C-N01_origem_invalida.csv              | 1           |
      | C-N02_origem_vazia.csv                 | 1           |
      | C-N03_origem_com_letras.csv            | 1           |
      | C-N19_id_16_digitos_massa_real.csv     | 1           |
      | C-N21_origem_com_espacos.csv           | 1           |
      | C-N22_origem_com_menos_digitos.csv     | 1           |
