// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

const plugins = {};
(Array.isArray(expoConfig) ? expoConfig : [expoConfig]).forEach((c) => {
  if (c.plugins) {
    Object.assign(plugins, c.plugins);
  }
});

module.exports = defineConfig([
  expoConfig,
  {
    plugins,
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    ignores: ["dist/*", "android/*", "ios/*", ".expo/*", "lint_results.json"],
  },
]);
