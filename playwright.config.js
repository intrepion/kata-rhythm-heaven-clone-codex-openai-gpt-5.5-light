const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  use: {
    browserName: "chromium"
  }
});
