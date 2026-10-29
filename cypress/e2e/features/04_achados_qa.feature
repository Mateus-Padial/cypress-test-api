# language: pt
@achado-qa
Funcionalidade: Achados de QA - entradas negativas aceitas indevidamente pela API
  Mantem como caracterizacao somente os casos ainda aceitos (200, success:true).
  Os casos que voltaram a ser rejeitados foram movidos para as features de regressao.
  Detalhes em ACHADOS.md. Regressao sem estes: --env tags='not @achado-qa'

  Esquema do Cenario: [ACHADO][Simples] <arquivo> ainda e aceito - <regra_esperada>
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "01_simples/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                              | loginTypeId | regra_esperada                          |
      | S-N03_linha_em_branco_no_meio.csv    | 1           | linha em branco deveria falhar          |
      | S-N11_cnpj_invalido.csv              | 2           | CNPJ com DV invalido deveria falhar     |
      | S-N15_mistura_cnpj_cnpj_alfa.csv     | 2           | mistura de tipos deveria falhar         |
      | S-N17_valor_negativo.csv             | 1           | valor negativo deveria falhar           |
      | S-N23_nome_vazio.csv                 | 1           | nome vazio deveria falhar               |
      | S-N26_espacos_antes_depois.csv       | 1           | espacos nos campos deveriam ser tratados |
      | S-N30_login_duplicado.csv            | 1           | login duplicado deveria falhar          |
      | S-N33_quebra_linha_inconsistente.csv | 1           | quebra de linha inconsistente           |
      | S-N34_sem_quebra_linha_final.csv     | 1           | sem quebra de linha final               |
      | S-N38_com_bom_utf8.csv               | 1           | BOM UTF-8 no arquivo                     |
      | S-N39_encoding_iso8859_1.csv         | 1           | encoding ISO-8859-1                      |
      | S-N40_encoding_utf16le.csv           | 1           | encoding UTF-16LE                        |
      | S-N46_limite_excedido_50000.csv      | 1           | limite de 50000 linhas deveria falhar   |
      | S-N09_cpf_invalido_dv.csv            | 1           | CPF com DV invalido deveria falhar      |
      | S-N36_cpf_digitos_repetidos.csv      | 1           | CPF com digitos repetidos deveria falhar |

  Esquema do Cenario: [ACHADO][ComId] <arquivo> - <regra_esperada>
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "02_com_id/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                            | loginTypeId | regra_esperada                    |
      | ID-N01_id_vazio.csv                | 1           | id vazio deveria falhar           |
      | ID-N02_id_com_letras.csv           | 1           | id com letras deveria falhar      |
      | ID-N03_id_caracteres_especiais.csv | 1           | id com caracteres especiais       |
      | ID-N04_id_duplicado.csv            | 1           | id duplicado deveria falhar       |
      | ID-N05_id_maior_5_digitos.csv      | 1           | id > 5 digitos deveria falhar     |
      | ID-N06_id_negativo.csv             | 1           | id negativo deveria falhar        |
      | ID-N07_id_decimal.csv              | 1           | id decimal deveria falhar         |
      | ID-N08_id_zero.csv                 | 1           | id zero deveria falhar            |
      | ID-N09_id_zeros_esquerda.csv       | 1           | id com zeros a esquerda           |
      | ID-N10_coluna_id_faltando.csv      | 1           | coluna id faltando deveria falhar |
      | ID-N18_id_6_digitos_massa_real.csv | 1           | id de 6 digitos (massa real)      |

  Esquema do Cenario: [ACHADO][Completo] <arquivo> - <regra_esperada>
    Dado os parametros ConversionRate "1" e LoginTypeId "<loginTypeId>"
    E o arquivo "03_completo/negativos/<arquivo>"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E a validacao deve indicar sucesso

    Exemplos:
      | arquivo                          | loginTypeId | regra_esperada                       |
      | C-N08_expiracao_vazia.csv        | 1           | expiracao vazia deveria falhar       |
