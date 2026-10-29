# Achados de QA — Endpoint ``

Levantados ao rodar a suíte de testes contra o ambiente **dev**
(``) sobre os arquivos de
`cenarios_importacao_creditos/`.

A tabela abaixo lista os casos ainda observados como aceitos (HTTP 200,
`success: true`) e fixados como caracterização em
`cypress/e2e/features/04_achados_qa.feature` (`@achado-qa`). Alguns casos
foram retestados em 2026-10-21 e passaram a ser rejeitados; esses foram removidos
da tabela e adicionados à regressão em `01_simples.feature`.

## Parâmetros do endpoint (descobertos)

- Campo do arquivo no multipart: **`File`**
- Taxa de conversão: **`PointsConversionRate`** (não `ConversionRate`; enviar
  errado causa `400 "Attempted to divide by zero."`)
- **`LoginTypeId`**: `1` = CPF, `2` = CNPJ (tradicional e alfanumérico).
  Enviar o tipo errado faz o login válido ser recusado.

## Contrato de resposta

- **Sucesso:** `200` + `success:true` + `data.summary` + `data.validationDetails.isValid:true`.
- **Erro de validação:** `400` + `success:false` + `data.validationDetails`
  com `errorCount` e `errorsByLine` (cada erro tem `line`, `message`, `code`,
  ex.: `INVALID_HEADER`).
- **Erro de request** (arquivo vazio): `400` + `success:false` **sem** `data`
  (`"Nenhum arquivo foi enviado."`).

## Achados — Layout Simples

| Arquivo                          | Regra esperada                           | Comportamento |
| -------------------------------- | ---------------------------------------- | ------------- |
| S-N03_linha_em_branco_no_meio    | linha em branco deveria falhar           | aceito        |
| S-N09_cpf_invalido_dv            | CPF com DV inválido deveria falhar       | aceito        |
| S-N36_cpf_digitos_repetidos      | CPF com dígitos repetidos deveria falhar | aceito        |
| S-N11_cnpj_invalido              | CNPJ com DV inválido deveria falhar      | aceito        |
| S-N17_valor_negativo             | valor negativo deveria falhar            | aceito        |
| S-N23_nome_vazio                 | nome vazio deveria falhar                | aceito        |
| S-N26_espacos_antes_depois       | espaços deveriam ser tratados/rejeitados | aceito        |
| S-N30_login_duplicado            | login duplicado deveria falhar           | aceito        |
| S-N33_quebra_linha_inconsistente | quebra de linha inconsistente            | aceito        |
| S-N34_sem_quebra_linha_final     | sem quebra de linha final                | aceito        |
| S-N38_com_bom_utf8               | BOM UTF-8                                | aceito        |
| S-N39_encoding_iso8859_1         | encoding ISO-8859-1                      | aceito        |
| S-N40_encoding_utf16le           | encoding UTF-16LE                        | aceito        |
| S-N46_limite_excedido_50000      | limite de 50000 linhas deveria falhar    | aceito        |

**Reteste em 2026-10-21:** a API passou a rejeitar novamente CNPJ alfanumérico
inválido (S-N12), misturas CPF/CNPJ (S-N13/S-N14), login com máscara (S-N31),
CPF com quantidade incorreta de dígitos (S-N10) e CPF com letras (S-N32). Esses
casos foram movidos para a regressão de `01_simples.feature`. Os demais casos
acima também retornaram 200 nesta rodada.

## Achados — Layout Com ID

A API não valida as regras de conteúdo da coluna `id` listadas abaixo. ID-N13
(mistura de login) voltou a ser rejeitado no reteste de 2026-10-21 e foi movido
para a regressão de `02_com_id.feature`.

| Arquivo                        | Regra esperada                             |
| ------------------------------ | ------------------------------------------ |
| ID-N01_id_vazio                | id vazio deveria falhar                    |
| ID-N02_id_com_letras           | id com letras deveria falhar               |
| ID-N03_id_caracteres_especiais | id com caracteres especiais deveria falhar |
| ID-N04_id_duplicado            | id duplicado deveria falhar                |
| ID-N05_id_maior_5_digitos      | id > 5 dígitos deveria falhar              |
| ID-N06_id_negativo             | id negativo deveria falhar                 |
| ID-N07_id_decimal              | id decimal deveria falhar                  |
| ID-N08_id_zero                 | id zero deveria falhar                     |
| ID-N09_id_zeros_esquerda       | id com zeros à esquerda                    |
| ID-N10_coluna_id_faltando      | coluna id faltando deveria falhar          |
| ID-N18_id_6_digitos_massa_real | id de 6 dígitos (massa real de referência) |

> Atualização: os arquivos **apenas com cabeçalho** (S-N02 no layout simples e
> ID-N16 no layout com id) passaram a ser rejeitados com `400` e saíram dos
> achados — agora são verificados em cenários próprios nas suas features
> (`01_simples.feature` e `02_com_id.feature`), sem exigir o contrato de erro
> estruturado (o `400` pode vir como erro de request, sem `validationDetails`).

## Achados — Layout Completo

Apenas a **expiração vazia** ainda é aceita indevidamente:

| Arquivo               | Regra esperada                 |
| --------------------- | ------------------------------ |
| C-N08_expiracao_vazia | expiração vazia deveria falhar |

> Atualização: os casos de **origem** (C-N01/02/03/21/22) e o id de 16 dígitos
> (C-N19) passaram a ser rejeitados corretamente e migraram para os negativos de
> `03_completo.feature` (esperam `400`). Só a expiração **vazia** (C-N08)
> continua passando. As demais variações de expiração (data passada, 31/02,
> 29/02 em ano não bissexto, formato ISO/MM-DD, com hora, ano de 2 dígitos) já
> eram corretamente rejeitadas.
