# Suíte de Testes — Importação de Créditos (Admin Vertem)

Gerado a partir dos 3 arquivos de referência (`Simples.csv`, `Simples com identificador.csv`, `Simples com Identificador e Data de Expiração.csv`).

Delimitador: `;` | Formato de data: `dd/MM/yyyy` | Origem válida: `1234569100`

## Estrutura

- `01_simples/` — layout `login;nome;descricao;valor`
- `02_com_id/` — layout `id;login;nome;descricao;valor`
- `03_completo/` — layout `id;login;nome;descricao;valor;expiracao;origem`

Cada pasta tem `positivos/` e `negativos/`.

## Achados de QA (divergência regra x massa real de referência)

1. **Mistura de tipos de login na massa oficial** — `Simples.csv` de referência contém CPF + CNPJ + CNPJ alfanumérico no mesmo arquivo, o que viola a regra "um tipo por arquivo". Ou a regra não está sendo aplicada, ou a massa está errada. Cobrir com S-N13/N14/N15.
2. **ID acima de 5 dígitos na massa oficial** — `Simples com identificador (2).csv` usa IDs de 6 dígitos (ex.: `845173`) e o layout completo usa 16 dígitos (`7119310030001234`). Ambos violam "id até 5 dígitos". Cobrir com ID-N05/N18 e C-N19.
3. **Espaços em campos** — `Simples com identificador (1).csv` tem ` teste hml` e ` 15` com espaço à esquerda. Validar trim de backend (S-N26).

## Login — CPFs/CNPJs de referência

CPFs válidos usados: 40173849865, 55987280010, 22025482035, 82851314084, 65677880035, 02679863003, 04658220024, 11113229020, 39852591002, 34720392059.
CNPJ tradicional: 07413992000128, 41549308000178, 46987165000108, 86497425000173, 91976650000122, 60512290000184.
CNPJ alfanumérico: 4ANGNJ1D000156, IILACV2V000159.
Nos arquivos de carga os CPFs são gerados com dígitos verificadores válidos.
