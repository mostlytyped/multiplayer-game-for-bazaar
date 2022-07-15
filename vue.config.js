const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "To The Moon! A browser game powered by RethinkID";
      return args;
    });
  },
  configureWebpack: { plugins: [new NodePolyfillPlugin()] },
});
