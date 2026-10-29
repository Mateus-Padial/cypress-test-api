const OBRIGATORIAS = [
  "CYPRESS_authToken",
  "CYPRESS_servicoFinanceiroToken",
  "CYPRESS_tokenClientId",
  "CYPRESS_tokenClientSecret",
];

const semValor = (v) => !v || !v.trim() || /^\$\([^)]*\)$/.test(v.trim());

const faltando = OBRIGATORIAS.filter((nome) => semValor(process.env[nome]));

if (faltando.length) {
  console.error(
    "Segredos obrigatorios ausentes ou vazios no pipeline:\n  - " +
      faltando.join("\n  - ") +
      "\nDefina-os no Variable Group/Library (como secret) e vincule ao pipeline.",
  );
  process.exit(1);
}
console.log("Segredos obrigatorios presentes.");
