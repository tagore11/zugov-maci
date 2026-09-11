# ZuGov

[![CI][cli-actions-badge]][cli-actions-link]
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/privacy-scaling-explorations/maci/blob/main/LICENSE)

ZuGov is a fork of [MACI](https://maci.pse.dev/) that separates two things most voting software fuses into one: **what a member actually thinks** about a decision, and **the rule used to count it**. A preference is recorded once — direction, confidence, salience, and a hard veto — before any counting rule touches it. The same record can then be run through several counting rules, and if the rules disagree on a winner, that disagreement is surfaced rather than hidden. An optional local, open-weight language model can help a member draft that record from discussion; it never votes, and a tested code-level invariant makes it structurally impossible for its draft to enter a tally unconfirmed.

**Live demo:** [zugov-mvp.vercel.app](https://zugov-mvp.vercel.app) · **Backend:** [zugov-backend.vercel.app](https://zugov-backend.vercel.app) · **MVP source and full write-up:** [`apps/zugov-mvp`](./apps/zugov-mvp) ([README](./apps/zugov-mvp/README.md), Turkish)

## What's in this fork

Everything under `apps/zugov-mvp` is new; the rest of this repository is [PSE's MACI](https://github.com/privacy-scaling-explorations/maci) monorepo, unmodified except where noted, and documented below under "Upstream."

### Three ideas, in one sentence each

1. **Preference recording is independent of the counting rule.** Every option gets a four-field vector — `support` (−1..+1), `confidence` (0..1, never affects weight), `salience` (0..1), `redLine` (boolean) — written once, before any rule is chosen. Five counting rules (Approval, Ranked/IRV, Weighted/quadratic, Consent, Proportional/quadratic-funding) each implement the same interface (`project`, `explain`, `tally`) over that record, so adding a sixth rule never invalidates a vote already cast.
2. **The rule itself is audited, not assumed neutral.** `analyseSensitivity()` runs the same recorded preferences through all five rules. If all five agree, the room decided. If changing the rule changes the winner — which Arrow's impossibility theorem guarantees will happen for some profile, for any two distinct rules — that gets surfaced before the outcome is treated as final, instead of being quietly absorbed into whichever single rule the software happened to ship with.
3. **The Grounding Engine never votes.** The local model can draft a preference vector from what someone wrote, and can generate a neutral epistemic questioning report (assumptions, base rates, counter-argument, reversibility, affected parties, precedent) that never proposes an option. Every model-drafted vector is written with `confirmed: false`; `decide()` throws on any unconfirmed vector; the tally path never reads the questioning report at all. This is enforced in code and covered by tests, not asserted in prose:

   ```ts
   for (const vector of vectors) {
     if (!vector.confirmed) throw new UnconfirmedPreferenceError(vector.subjectId);
   }
   ```

### Status, honestly

| Claim                                                                                                    | Status                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preference recorded independent of rule; 5 rules computed and compared                                   | Live, `apps/zugov-mvp`                                                                                                                               |
| Ranked-choice (IRV) voting, end-to-end through MACI                                                      | Live and tested, deployed to two pilot communities                                                                                                   |
| Grounding Engine invariant (`confirmed: false`, `decide()` rejection, tally path never reads the report) | Implemented and covered by tests. The public demo currently runs a deterministic fallback — the local model itself is not invoked in that deployment |
| Weighted (quadratic) voting                                                                              | Not real yet — UI exists, production vote weight is hardcoded to 1. Extension seam: `IInitialVoiceCreditProxy`                                       |
| On-chain anchoring of a decision's outcome hash                                                          | Code complete, blocked on funding one signer key on Scroll Sepolia                                                                                   |

Runs fully locally: the model, the state, and the vote all stay on the participant's machine unless a community explicitly opts into the on-chain anchor. No API key required — if `zugov-grounding` (Ollama, ~1.9GB) isn't installed, the app falls back to a rule-based path and says so in the interface; nothing stops working.

---

## Upstream: Minimal Anti-Collusion Infrastructure (MACI)

Minimal Anti-Collusion Infrastructure (MACI) is an on-chain voting protocol which protects privacy and minimizes the risk of collusion and bribery.

**MACI blog, resources, and documentation for developers and integrators can be found here:
https://maci.pse.dev/**

We welcome contributions to this project. Please join our
[Discord server](https://discord.com/invite/sF5CT5rzrR) (in the `#🗳️-maci` channel) to discuss.

## Packages

Below you can find a list of the packages included in this repository.

| package                                 | npm                                                           | tests                                                                  |
| --------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [maci-circuits][circuits-package]       | [![NPM Package][circuits-npm-badge]][circuits-npm-link]       | [![Actions Status][circuits-actions-badge]][circuits-actions-link]     |
| [maci-cli][cli-package]                 | [![NPM Package][cli-npm-badge]][cli-npm-link]                 | [![Actions Status][cli-actions-badge]][cli-actions-link]               |
| [maci-contracts][contracts-package]     | [![NPM Package][contracts-npm-badge]][contracts-npm-link]     | [![Actions Status][contracts-actions-badge]][contracts-actions-link]   |
| [maci-core][core-package]               | [![NPM Package][core-npm-badge]][core-npm-link]               | [![Actions Status][core-actions-badge]][core-actions-link]             |
| [maci-crypto][crypto-package]           | [![NPM Package][crypto-npm-badge]][crypto-npm-link]           | [![Actions Status][crypto-actions-badge]][crypto-actions-link]         |
| [maci-domainobjs][domainobjs-package]   | [![NPM Package][domainobjs-npm-badge]][domainobjs-npm-link]   | [![Actions Status][domainobjs-actions-badge]][domainobjs-actions-link] |
| [maci-testing][testing-package]         | [![NPM Package][testing-npm-badge]][testing-npm-link]         | [![Actions Status][testing-actions-badge]][testing-actions-link]       |
| [maci-subgraph][subgraph-package]       | [![NPM Package][subgraph-npm-badge]][subgraph-npm-link]       | [![Actions Status][subgraph-actions-badge]][subgraph-actions-link]     |
| [maci-sdk][sdk-package]                 | [![NPM Package][sdk-npm-badge]][sdk-npm-link]                 | [![Actions Status][sdk-actions-badge]][sdk-actions-link]               |
| [maci-coordinator][coordinator-package] | [![NPM Package][coordinator-npm-badge]][coordinator-npm-link] |                                                                        |
| [maci-relayer][relayer-package]         | [![NPM Package][relayer-npm-badge]][relayer-npm-link]         | [![Actions Status][relayer-actions-badge]][relayer-actions-link]       |

## Development and testing

### Branches

The base branch of the project is `main`, which is used for ongoing development.

This project uses tags for releases. [View all MACI releases](https://github.com/privacy-scaling-explorations/maci/releases).

To contribute to MACI, create feature/fix branches, then open PRs into `main`. [Learn more about contributing](https://maci.pse.dev/docs/guides/compile-circuits#installation).

### Local development

For installation and local development instructions, please see our [installation docs](https://maci.pse.dev/docs/quick-start#installation).

This repository is organized as pnpm workspace. Each package contains its
own unit tests.

- `crypto`: low-level cryptographic operations.
- `circuits`: zk-SNARK circuits.
- `contracts`: Solidity contracts and deployment code.
- `domainobjs`: Classes which represent high-level [domain
  objects](https://wiki.c2.com/?DomainObject) particular to this project.
- `core`: Business logic functions for message processing, vote tallying,
  and circuit input generation through `MaciState`, a state machine
  abstraction.
- `cli`: A command-line interface with which one can deploy and interact with
  an instance of MACI.
- `testing`: Tests for the MACI protocol.
- `subgraph`: The subgraph for the MACI contracts.
- `website`: The documentation website.
- `sdk`: The SDK to interact with the MACI protocol.
- `coordinator`: The coordinator service for the MACI protocol.
- `relayer`: The relayer service for the MACI protocol.

### Testing

Please refer to the [testing documentation](https://maci.pse.dev/docs/guides/testing/testing-introduction) for more information.

### CI pipeline

CI pipeline ensures that we have automated tests that constantly validate. For more information about pipeline workflows, [read our CI documentation](https://maci.pse.dev/docs/processes/ci-pipeline).

[telegram-badge]: https://badges.aleen42.com/src/telegram.svg
[telegram-link]: https://t.me/joinchat/LUgOpE7J2gstRcZqdERyvw
[circuits-package]: ./packages/circuits
[circuits-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/circuits.svg
[circuits-npm-link]: https://www.npmjs.com/package/@maci-protocol/circuits
[circuits-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/circuit-build.yml/badge.svg
[circuits-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3ACircuit
[cli-package]: ./packages/cli
[cli-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/cli.svg
[cli-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/e2e.yml/badge.svg
[cli-npm-link]: https://www.npmjs.com/package/@maci-protocol/cli
[cli-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3ACI
[contracts-package]: ./packages/contracts
[contracts-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/contracts.svg
[contracts-npm-link]: https://www.npmjs.com/package/@maci-protocol/contracts
[contracts-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/contracts-build.yml/badge.svg
[contracts-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Acontracts
[core-package]: ./packages/core
[core-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/core.svg
[core-npm-link]: https://www.npmjs.com/package/@maci-protocol/core
[core-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/core-build.yml/badge.svg
[core-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Acore
[crypto-package]: ./packages/crypto
[crypto-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/crypto.svg
[crypto-npm-link]: https://www.npmjs.com/package/@maci-protocol/crypto
[crypto-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/crypto-build.yml/badge.svg
[crypto-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Acrypto
[domainobjs-package]: ./packages/domainobjs
[domainobjs-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/domainobjs.svg
[domainobjs-npm-link]: https://www.npmjs.com/package/@maci-protocol/domainobjs
[domainobjs-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/domainobjs-build.yml/badge.svg
[domainobjs-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Adomainobjs
[testing-package]: ./packages/testing
[testing-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/testing.svg
[testing-npm-link]: https://www.npmjs.com/package/@maci-protocol/testing
[testing-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/e2e.yml/badge.svg
[testing-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3ACI
[subgraph-package]: ./apps/subgraph
[subgraph-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/subgraph.svg
[subgraph-npm-link]: https://www.npmjs.com/package/@maci-protocol/subgraph
[subgraph-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/subgraph-build.yml/badge.svg
[subgraph-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Asubgraph
[sdk-package]: ./packages/sdk
[sdk-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/sdk.svg
[sdk-npm-link]: https://www.npmjs.com/package/@maci-protocol/sdk
[sdk-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/e2e.yml/badge.svg
[sdk-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Asdk
[coordinator-package]: ./apps/coordinator
[coordinator-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/coordinator.svg
[coordinator-npm-link]: https://www.npmjs.com/package/@maci-protocol/coordinator
[relayer-package]: ./apps/relayer
[relayer-npm-badge]: https://img.shields.io/npm/v/@maci-protocol/relayer.svg
[relayer-npm-link]: https://www.npmjs.com/package/@maci-protocol/relayer
[relayer-actions-badge]: https://github.com/privacy-scaling-explorations/maci/actions/workflows/relayer-build.yml/badge.svg
[relayer-actions-link]: https://github.com/privacy-scaling-explorations/maci/actions?query=workflow%3Arelayer
