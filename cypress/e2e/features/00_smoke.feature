# language: pt
Funcionalidade: Smoke - contrato de resposta de sucesso do 
  Valida o contrato de retorno esperado para um arquivo simples valido de 1 registro

  Cenario: Arquivo simples de 1 registro retorna resumo esperado
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "01_simples/positivos/S-P01_um_registro_cpf.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 200
    E o campo success deve ser "true"
    E a validacao deve indicar sucesso
    E o resumo deve refletir os totais:
      | totalLines       | 1 |
      | totalValidLines  | 1 |
      | totalErrorLines  | 0 |

  Cenario: Cabecalho invalido retorna contrato de erro (INVALID_HEADER)
    Dado os parametros ConversionRate "1" e LoginTypeId "1"
    E o arquivo "01_simples/negativos/S-N42_cabecalho_nomes_errados.csv"
    Quando eu envio o arquivo para validacao
    Entao o status da resposta deve ser 400
    E o campo success deve ser "false"
    E a resposta deve conter detalhes de erro
    E deve conter um erro com codigo "INVALID_HEADER"
    E o resumo deve conter totalErrorLines maior que 0

  Cenario: Liveness do servico responde saudavel
    Quando consulto o liveness do servico
    Entao o servico deve responder saudavel

  Cenario: Readiness do servico responde saudavel
    Quando consulto o readiness do servico
    Entao o servico deve responder saudavel
