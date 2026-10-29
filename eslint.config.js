const js = require("@eslint/js");
const cypressPlugin = require("eslint-plugin-cypress");
const globals = require("globals");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "cypress/reports/**",
      "cypress/screenshots/**",
      "cypress/videos/**",
      "cypress/downloads/**",
    ],
  },

  js.configs.recommended,

  {
    files: ["eslint.config.js", "cypress.config.js", "scripts/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
  },

  {
    files: ["cypress/e2e/step_definitions/**/*.js", "cypress/support/**/*.js"],
    plugins: { cypress: cypressPlugin },
    languageOptions: {
      sourceType: "module",
      globals: {
        ...cypressPlugin.configs.recommended.languageOptions.globals,
      },
    },
    rules: {
      ...cypressPlugin.configs.recommended.rules,
    },
  },

  eslintConfigPrettier,
];
