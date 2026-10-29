const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function cliNumberFlag(flag, defaultValue) {
  const i = process.argv.indexOf(flag);
  if (i === -1 || !process.argv[i + 1]) return defaultValue;
  const parsed = parseInt(process.argv[i + 1], 10);
  if (!Number.isFinite(parsed)) {
    console.warn(
      `[exportar] valor invalido para ${flag} ("${process.argv[i + 1]}"); ` +
        `usando default ${defaultValue}.`,
    );
    return defaultValue;
  }
  return parsed;
}

const MAX_DIM = cliNumberFlag("--max-dim", 1280);
const COLORS = cliNumberFlag("--colors", 128);

async function comprimirScreenshotBase64(
  b64,
  maxDim = MAX_DIM,
  colors = COLORS,
) {
  if (!b64) return null;
  try {
    const entrada = Buffer.from(b64, "base64");
    const saida = await sharp(entrada)
      .rotate()
      .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, colors })
      .toBuffer();
    return (saida.length < entrada.length ? saida : entrada).toString("base64");
  } catch (e) {
    console.warn(
      `[exportar] falha ao comprimir um print (${e.message}); mantendo original.`,
    );
    return b64;
  }
}

const reportsDir = path.resolve(__dirname, "..", "cypress", "reports");
const jsonFile = path.join(reportsDir, "cucumber-report.json");

const outArgIdx = process.argv.indexOf("--out");
const outFile =
  outArgIdx !== -1 && process.argv[outArgIdx + 1]
    ? path.resolve(process.argv[outArgIdx + 1])
    : path.join(reportsDir, "checklist-import.json");

if (!fs.existsSync(jsonFile)) {
  console.error(
    `\n[exportar] Nao encontrei ${jsonFile}.\nRode os testes primeiro: npm test\n`,
  );
  process.exit(1);
}

let features;
try {
  features = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
} catch (e) {
  console.error(
    `\n[exportar] ${jsonFile} existe mas esta malformado/incompleto ` +
      `(provavelmente o Cypress nao terminou de escreve-lo).\n` +
      `Detalhe: ${e.message}\n`,
  );
  process.exit(1);
}

function mapResultado(steps) {
  const statuses = steps
    .filter((s) => !s.hidden)
    .map((s) => (s.result && s.result.status) || "undefined");

  if (statuses.some((st) => st === "failed")) return "NOK";
  if (statuses.length > 0 && statuses.every((st) => st === "passed"))
    return "OK";
  return "Pendente";
}

function montarCriterios(steps) {
  return steps
    .filter((s) => !s.hidden && s.name)
    .map((s) => `${(s.keyword || "").trim()} ${s.name}`.trim())
    .join("\n");
}

function primeiraMensagemErro(steps) {
  for (const s of steps) {
    if (s.result && s.result.status === "failed" && s.result.error_message) {
      return s.result.error_message.split("\n")[0].trim();
    }
  }
  return "";
}

function regraEsperada(steps) {
  const passoArquivo = steps.find(
    (s) => s.name && s.name.includes("o arquivo"),
  );
  if (!passoArquivo) return "";
  const m = passoArquivo.name.match(/([^/"]+)\.csv/);
  if (!m) return "";
  return m[1]
    .replace(/^[A-Z]+-[NP]?\d+_/i, "")
    .replace(/_/g, " ")
    .trim();
}

function primeiroScreenshotBase64(steps) {
  for (const s of steps) {
    if (Array.isArray(s.embeddings)) {
      const img = s.embeddings.find(
        (e) =>
          e && e.data && (e.mime_type || e.media_type || "").includes("image"),
      );
      if (img) return img.data;
    }
  }
  return null;
}

async function main() {
  const saida = [];
  let bytesOriginais = 0;
  let bytesComprimidos = 0;

  for (let grupoIdx = 0; grupoIdx < features.length; grupoIdx++) {
    const feature = features[grupoIdx];
    const grupo = feature.name || `Grupo ${grupoIdx + 1}`;
    const cenarios = (feature.elements || []).filter(
      (el) => el.type === "scenario",
    );

    for (let seq = 0; seq < cenarios.length; seq++) {
      const cenario = cenarios[seq];
      const steps = cenario.steps || [];
      const tags = (cenario.tags || []).map((t) => t.name);
      const isAchado = tags.includes("@achado-qa");

      const resultado = mapResultado(steps);
      let observacoes = resultado === "NOK" ? primeiraMensagemErro(steps) : "";

      if (isAchado) {
        const regra = regraEsperada(steps);
        observacoes =
          "Cenario negativo que passou e esta mapeado: a API aceita este arquivo." +
          (regra ? ` Regra relacionada: ${regra}.` : "");
      }

      const original = primeiroScreenshotBase64(steps);
      const comprimido = await comprimirScreenshotBase64(original);
      if (original) bytesOriginais += original.length;
      if (comprimido) bytesComprimidos += comprimido.length;

      saida.push({
        Id: (grupoIdx + 1) * 1000 + (seq + 1),
        Grupo: grupo,
        Titulo: cenario.name || `Cenario ${seq + 1}`,
        Resultado: resultado,
        CriteriosAceite: montarCriterios(steps),
        Observações: observacoes,
        Link_evidencia: "",
        Evidencias: {
          arquivo_1_base64: comprimido,
          arquivo_2_base64: null,
          arquivo_3_base64: null,
        },
      });
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(saida, null, 2), "utf-8");

  const comEvidencia = saida.filter(
    (c) => c.Evidencias.arquivo_1_base64,
  ).length;
  const tamanhoFinalMB = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2);
  const mb = (n) => (n / 1024 / 1024).toFixed(2);
  console.log(
    `\n[exportar] ${saida.length} casos exportados (${comEvidencia} com evidencia).\n` +
      `[exportar] Base64: ${mb(bytesOriginais)} MB -> ${mb(bytesComprimidos)} MB apos compressao.\n` +
      `[exportar] Arquivo final: ${tamanhoFinalMB} MB (${outFile})\n`,
  );
}

main().catch((err) => {
  console.error("[exportar] erro:", err);
  process.exit(1);
});
