const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const reportsDir = path.resolve(__dirname, "..", "cypress", "reports");

const alvos = {
  html: path.join(reportsDir, "html", "index.html"),
  checklist: path.join(reportsDir, "checklist-import.json"),
  pasta: reportsDir,
};

const chave = process.argv[2] || "html";
const alvo = alvos[chave];

if (!alvo) {
  console.error(
    `[abrir] Opcao invalida: "${chave}". Use: html | checklist | pasta`,
  );
  process.exit(1);
}

if (!fs.existsSync(alvo)) {
  console.error(
    `[abrir] Nao encontrei ${alvo}.\nRode os testes primeiro: npm test\n`,
  );
  process.exit(1);
}

const plataforma = process.platform;
let cmd;
let args;
if (plataforma === "win32") {
  cmd = "cmd";
  args = ["/c", "start", "", alvo];
} else if (plataforma === "darwin") {
  cmd = "open";
  args = [alvo];
} else {
  cmd = "xdg-open";
  args = [alvo];
}

const child = spawn(cmd, args, { stdio: "ignore", detached: true });
child.on("error", (err) => {
  console.error(`[abrir] Falha ao abrir: ${err.message}`);
  console.error(`[abrir] Abra manualmente: ${alvo}`);
  process.exit(1);
});
child.unref();
console.log(`[abrir] Abrindo: ${alvo}`);
