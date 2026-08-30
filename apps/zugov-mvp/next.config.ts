import type { NextConfig } from "next";

const config: NextConfig = {
  // The app is meant to be run locally next to a local model; no external
  // image hosts, no telemetry-bearing integrations.
  reactStrictMode: true,
};

export default config;
