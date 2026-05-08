import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";

const CONTRACTS_BUILD = resolve(__dirname, "node_modules/@maci-protocol/contracts/build");

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // Ensure workspace packages can resolve the polyfills shim even though
      // they don't depend on vite-plugin-node-polyfills directly.
      "vite-plugin-node-polyfills/shims/buffer": resolve(
        __dirname,
        "node_modules/vite-plugin-node-polyfills/shims/buffer",
      ),
      // @maci-protocol/contracts pulls in hardhat + native .node binaries.
      // Redirect to a browser-safe shim that only exports ABI factories + enums.
      "@maci-protocol/contracts/typechain-types": `${CONTRACTS_BUILD}/typechain-types/index.js`,
      "@maci-protocol/contracts": resolve(__dirname, "src/maci-contracts-browser-shim.js"),
      // Dynamic require("hardhat") inside @maci-protocol/contracts/ts/utils.js
      // would crash the browser. Redirect to an empty stub.
      hardhat: resolve(__dirname, "src/hardhat-stub.js"),
    },
  },
  optimizeDeps: {
    include: ["@maci-protocol/domainobjs", "@maci-protocol/sdk/browser"],
    exclude: ["hardhat", "@nomicfoundation/solidity-analyzer"],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages\/domainobjs/, /packages\/sdk/, /packages\/contracts/],
    },
    rollupOptions: {
      external: ["hardhat", "@nomicfoundation/solidity-analyzer"],
    },
  },
});
