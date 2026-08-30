import next from "eslint-config-next";

/**
 * This app installs standalone, outside the pnpm workspace, so it needs its own
 * flat config. Without one, ESLint walks up and finds the monorepo's, which
 * points typed linting at the root tsconfig that does not include these files.
 */
export default [
  { ignores: [".next/**", "node_modules/**", ".data/**"] },
  ...next(),
];
