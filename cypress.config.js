const path = require("path");
const dotenv = require("dotenv");
const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

function loadDotenvIntoConfig(config) {
  config.env = config.env || {};

  const processEnv = Object.entries(process.env)
    .filter(
      ([rawKey, value]) =>
        rawKey.startsWith("CYPRESS_") && value && value.trim() !== "",
    )
    .map(([rawKey, value]) => [rawKey.replace(/^CYPRESS_/, ""), value]);

  const apply = (file, { override }) => {
    const parsed = dotenv.config({
      path: path.resolve(__dirname, file),
      quiet: true,
    }).parsed;
    if (!parsed) return;
    for (const [rawKey, value] of Object.entries(parsed)) {
      const key = rawKey.replace(/^CYPRESS_/, "");
      if (override || config.env[key] === undefined) {
        config.env[key] = value;
      }
    }
  };

  apply(".env.ci", { override: false });
  if (process.env.CI !== "true") {
    apply(".env", { override: true });
  }

  for (const [key, value] of processEnv) {
    config.env[key] = value;
  }
  return config;
}

module.exports = defineConfig({
  retries: { runMode: 0, openMode: 0 },
  e2e: {
    experimentalInteractiveRunEvents: true,
    baseUrl: "",
    specPattern: "cypress/e2e/features/**/*.feature",
    excludeSpecPattern: [
      "cypress/e2e/features/18_order_resend_reprocessamento.feature",
    ],
    supportFile: "cypress/support/e2e.js",
    numTestsKeptInMemory: 50,
    experimentalRunAllSpecs: true,
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/reports/screenshots",
    videosFolder: "cypress/reports/videos",
    viewportWidth: 1280,
    viewportHeight: 900,
    async setupNodeEvents(on, config) {
      loadDotenvIntoConfig(config);

      const fsp = require("fs");
      const pathp = require("path");
      const reportsDir = pathp.join(__dirname, "cypress", "reports");
      fsp.rmSync(reportsDir, { recursive: true, force: true });

      await addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      const fs = require("fs");
      on("task", {
        async uploadCsv({
          url,
          filePath,
          token,
          fields,
          fileFieldName,
          headers,
          timeout,
        }) {
          const buffer = fs.readFileSync(filePath);
          const fileName = filePath.split(/[\\/]/).pop();

          const form = new FormData();
          form.append(
            fileFieldName || "File",
            new Blob([buffer], { type: "text/csv" }),
            fileName,
          );
          for (const [key, value] of Object.entries(fields)) {
            form.append(key, String(value));
          }

          const finalHeaders = headers
            ? { Accept: "application/json", ...headers }
            : {
                Accept: "application/json",
                "authorization-vertem-servico-financeiro": token,
              };

          const res = await fetch(url, {
            method: "POST",
            headers: finalHeaders,
            body: form,
            signal: AbortSignal.timeout(timeout || 60000),
          });

          const text = await res.text();
          let body;
          try {
            body = JSON.parse(text);
          } catch {
            body = text;
          }
          return { status: res.status, body };
        },
      });

      return config;
    },
  },
  env: {
    validateEndpoint: "",
    conversionRate: "1",
    loginTypeId: "1",
    cenariosDir: "cenarios_importacao_creditos",
    authToken: "",
  },
});
