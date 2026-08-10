#!/usr/bin/env node
// Deploys an isolated subgraph instance for one community's MACI contract.
//
// `graph deploy` compiles the mapping AssemblyScript from source on every
// invocation (it doesn't accept a pre-built manifest) — so this reuses the
// same mustache templating already used for the single-tenant subgraph.yaml
// (templates/subgraph.template.yaml), just with a per-community, transient
// config instead of a checked-in one.
//
// Usage:
//   node scripts/deploy-community.mjs --address 0x... --start-block 123 \
//     --network scroll-sepolia --name community-0x...
//     [--admin-url http://localhost:8020] [--ipfs-url http://localhost:5001]

import { execFileSync } from "node:child_process";
import { copyFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SUBGRAPH_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const TEMPLATE_PATH = join(SUBGRAPH_DIR, "templates", "subgraph.template.yaml");
const SCHEMA_VERSION = process.env.VERSION ?? "v1";
const SCHEMA_SOURCE_PATH = join(SUBGRAPH_DIR, "schemas", `schema.${SCHEMA_VERSION}.graphql`);
const SCHEMA_DEST_PATH = join(SUBGRAPH_DIR, "schema.graphql");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, "")] = argv[i + 1];
  }
  return args;
}

function requireArg(args, name) {
  const value = args[name];
  if (!value) throw new Error(`Missing required --${name} argument`);
  return value;
}

function run(command, commandArgs) {
  execFileSync(command, commandArgs, { cwd: SUBGRAPH_DIR, stdio: "inherit" });
}

function createSubgraph(adminUrl, name) {
  try {
    execFileSync("pnpm", ["exec", "graph", "create", "--node", adminUrl, name], {
      cwd: SUBGRAPH_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    if (!output.includes("already exists")) {
      process.stderr.write(output);
      throw err;
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const address = requireArg(args, "address");
  const network = requireArg(args, "network");
  const name = requireArg(args, "name");
  const startBlock = Number(requireArg(args, "start-block"));
  const adminUrl = args["admin-url"] ?? "http://localhost:8020";
  const ipfsUrl = args["ipfs-url"] ?? "http://localhost:5001";

  if (!Number.isInteger(startBlock) || startBlock < 0) {
    throw new Error(`--start-block must be a non-negative integer, got: ${args["start-block"]}`);
  }

  // Written into the subgraph package root (not a tempdir) so the manifest's
  // relative mapping/ABI paths (e.g. ./src/maci.ts) resolve correctly.
  const configPath = join(SUBGRAPH_DIR, `.deploy-config.${name}.json`);
  const manifestPath = join(SUBGRAPH_DIR, `subgraph.${name}.yaml`);
  const buildDir = join(SUBGRAPH_DIR, "build", name);

  writeFileSync(
    configPath,
    JSON.stringify({
      network,
      maciContractAddress: address,
      maciContractStartBlock: startBlock,
    }),
  );

  try {
    // graph codegen/deploy read ./schema.graphql relative to the manifest;
    // this is normally produced by the `generate:schema` npm script (run via
    // a `precodegen` hook), which doesn't fire when invoking `graph codegen`
    // directly like this does, so it's regenerated here instead.
    copyFileSync(SCHEMA_SOURCE_PATH, SCHEMA_DEST_PATH);

    run("pnpm", ["exec", "mustache", configPath, TEMPLATE_PATH, manifestPath]);
    run("pnpm", ["exec", "graph", "codegen", manifestPath]);

    createSubgraph(adminUrl, name);

    run("pnpm", [
      "exec",
      "graph",
      "deploy",
      "--node",
      adminUrl,
      "--ipfs",
      ipfsUrl,
      "--version-label",
      `v${Date.now()}`,
      "--output-dir",
      buildDir,
      name,
      manifestPath,
    ]);
  } finally {
    rmSync(configPath, { force: true });
    rmSync(manifestPath, { force: true });
    rmSync(buildDir, { recursive: true, force: true });
  }
}

main();
