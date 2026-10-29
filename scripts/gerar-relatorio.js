const fs = require("fs");
const path = require("path");
const report = require("multiple-cucumber-html-reporter");

const reportsDir = path.resolve(__dirname, "..", "cypress", "reports");
const jsonFile = path.join(reportsDir, "cucumber-report.json");

if (!fs.existsSync(jsonFile)) {
  console.error(
    `\n[relatorio] Nao encontrei ${jsonFile}.\n` +
      `Rode os testes primeiro: npm test\n`,
  );
  process.exit(1);
}

let features;
try {
  features = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
} catch (e) {
  console.error(
    `\n[relatorio] ${jsonFile} existe mas esta malformado/incompleto ` +
      `(provavelmente o Cypress nao terminou de escreve-lo).\n` +
      `Detalhe: ${e.message}\n`,
  );
  process.exit(1);
}

const jsonDir = path.join(reportsDir, "cucumber-json");
fs.mkdirSync(jsonDir, { recursive: true });
features.forEach((feature, i) => {
  if (!feature.uri) {
    const base = (feature.name || `feature-${i + 1}`)
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    feature.uri = `${base || `feature-${i + 1}`}.feature`;
  }
});
fs.writeFileSync(
  path.join(jsonDir, "cucumber-report.json"),
  JSON.stringify(features),
  "utf-8",
);

const outDir = path.join(reportsDir, "html");

report.generate({
  jsonDir,
  reportPath: outDir,
  displayDuration: true,
  pageTitle: "Evidencias - ",
  reportName: "Importacao de Creditos - Validacao de Arquivos",
  metadata: {
    device: "Local",
    platform: { name: "API", version: "" },
  },
  customData: {
    title: "Execucao",
    data: [
      { label: "Endpoint", value: "POST " },
      { label: "Ambiente", value: "dev" },
    ],
  },
});

console.log(`\n[relatorio] Gerado em: ${path.join(outDir, "index.html")}\n`);
