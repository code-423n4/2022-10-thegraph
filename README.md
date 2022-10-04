# The Graph contest details

- $47,500 USDC main award pot
- $2,500 USDC gas optimization award pot
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2022-10-thegraph-contest/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts October 7, 2022 20:00 UTC
- Ends October 12, 2022 20:00 UTC

**IMPORTANT NOTE**: Prior to receiving payment from this contest you MUST become a Certified Warden (successfully complete KYC and pass screening for OFAC sanctions). You do not have to complete this process before competing or submitting bugs.

## Overview

The Graph is a decentralized protocol for indexing and querying data from blockchains, starting with Ethereum. It makes it possible to query data that is difficult to query directly.

The Graph Network consists of Indexers, Curators and Delegators that provide services to the network, and serve data to Web3 applications. Consumers use the applications and consume the data.

To ensure economic security of The Graph Network and the integrity of data being queried, participants stake and use Graph Tokens (GRT). GRT is a work token that is an ERC-20 on the Ethereum blockchain, used to allocate resources in the network. Active Indexers, Curators and Delegators can provide services and earn income from the network, proportional to the amount of work they perform and their GRT stake.

To reduce gas costs and sustainably scale The Graph Network, there are active proposals to move the contracts to the Arbitrum Layer 2 blockchain. To mitigate risk, the proposed approach is to initially run the protocol in L1 in parallel with the protocol in L2. During a first stage, the L2 protocol would not distribute any Indexer rewards, and therefore not have any token issuance in L2.

The scope for this contest is the first step of this migration, that consists in a custom token bridge to send GRT between Ethereum and Arbitrum.

## Scope and areas of focus

The changes that make up the scope for this contest are described in the following proposal: [GIP-0031](https://hackmd.io/@N6uqeJqKRhS_geEwjyATnQ/rJoKEmvrq) (also in this [Forum discussion](https://forum.thegraph.com/t/gip-0031-arbitrum-grt-bridge/3305)). We recommend that Wardens read this spec to understand the scope and the rationale for the design of these contracts.

The contracts that are in scope for this audit were added with this spec in mind, and any deviation between the implementation and this spec can be considered a valid submission.

We’re mostly looking to validate the security of the token bridge: that tokens in the BridgeEscrow are safe, that transferring between L1 and L2 is safe (and works as expected), and that an attacker cannot steal funds from the bridge or mint tokens at will.

We’re assuming that the Arbitrum rollup and bridge contracts behave as expected, though we do want to minimize the impact of any breach to Arbitrum admin keys. Therefore, any submissions that can show the bridge opening up an *unnecessary* attack surface in a scenario where Arbitrum is compromised can be considered valid as well. The same applies to the Arbitrum GatewayRouter: we assume it behaves correctly, but any submissions showing our integration with it is incorrect or opening up an unnecessary attack surface will be valid as well.

The current bridge design assumes no tokens are minted in L2 (other than through the bridge), so any submissions showing how an attacker can mint tokens in L2 (without compromising the governor account) would be particularly valuable.

The bridge includes the ability to trigger callbacks in L2 when sending tokens from a whitelisted set of addresses. This will be useful for later stages of the migration plan. We encourage submissions that show ways to bypass the whitelist or otherwise exploit this feature, but considering that governance would only add a trusted L1 contract (e.g. GNS, Curation or Staking) to this whitelist. We still want to make this robust against a whitelisted sender being compromised, so submissions showing how a compromised/malicious whitelisted sender or receiver causes damage to the bridge or other protocol contracts would be valid as well.

## Previous audit report

A previous version of this code was audited (together with 3 other PRs) by OpenZeppelin on July 2022. A report for this audit, which also includes the 3 other PRs that are out of scope, is available [here](./audits/OpenZeppelin/2022-07-graph-arbitrum-bridge-audit.pdf); the list of issues from that report that are relevant to this scope is available in [this document](./audits/OpenZeppelin/2022-07-pr552-summary.pdf). Any reports that are duplicates of issues mentioned there will be considered invalid, unless:

- The issue was marked as fixed but it has since been reintroduced
- The issue was marked as fixed but the fix doesn’t actually solve the issue

## Setup and test instructions

```bash
# Install dependencies
yarn
# Compile the contracts
yarn build
# Run unit tests
yarn test
```

Additional end to end tests can be run as described in TESTING.md.

Tests can be run for specific files as well, in particular, this will run the tests that are relevant for the contracts in scope:

```
yarn test test/gateway/bridgeEscrow.test.ts
yarn test test/gateway/l1GraphTokenGateway.test.ts
yarn test test/l2/l2GraphToken.test.ts
yarn test test/l2/l2GraphTokenGateway.test.ts
```

To get a gas report, you can run:

```
yarn test:gas
```

This will produce a report in `reports/gas-report.log`.
Note this also accepts specific test files, e.g.

```
yarn test:gas test/gateway/l1GraphTokenGateway.test.ts
```

## Contracts in scope

The contracts in scope that will be deployed are the following:

- [BridgeEscrow](./contracts/gateway/BridgeEscrow.sol)
- [L1GraphTokenGateway](./contracts/gateway/L1GraphTokenGateway.sol)
- [L2GraphToken](./contracts/l2/token/L2GraphToken.sol)
- [L2GraphTokenGateway](./contracts/l2/gateway/L2GraphTokenGateway.sol)

Each of these will be deployed behind a proxy, so we're including the proxy and upgrade logic in the scope, as well as the dependencies for the contracts in scope that relate to governance and the pausing mechanism.

This means that the following files are in scope:

```
+------------------------------------------------------+------------+
| filename                                             | LOC        |
+------------------------------------------------------+------------+
| contracts/curation/ICuration.sol                     |         35 |
| contracts/curation/IGraphCurationToken.sol           |          7 |
| contracts/epochs/IEpochManager.sol                   |         13 |
| contracts/gateway/BridgeEscrow.sol                   |         16 |
| contracts/gateway/GraphTokenGateway.sol              |         27 |
| contracts/gateway/ICallhookReceiver.sol              |          8 |
| contracts/gateway/L1GraphTokenGateway.sol            |        193 |
| contracts/governance/Governed.sol                    |         32 |
| contracts/governance/IController.sol                 |         13 |
| contracts/governance/Managed.sol                     |         97 |
| contracts/governance/Pausable.sol                    |         36 |
| contracts/l2/gateway/L2GraphTokenGateway.sol         |        156 |
| contracts/l2/token/GraphTokenUpgradeable.sol         |        103 |
| contracts/l2/token/L2GraphToken.sol                  |         39 |
| contracts/rewards/IRewardsManager.sol                |         31 |
| contracts/staking/IStaking.sol                       |         91 |
| contracts/staking/IStakingData.sol                   |         31 |
| contracts/token/IGraphToken.sol                      |         22 |
| contracts/upgrades/GraphProxy.sol                    |         89 |
| contracts/upgrades/GraphProxyAdmin.sol               |         40 |
| contracts/upgrades/GraphProxyStorage.sol             |         63 |
| contracts/upgrades/GraphUpgradeable.sol              |         29 |
| contracts/upgrades/IGraphProxy.sol                   |         10 |
| Total                                                |      1,181 |
+------------------------------------------------------+------------+
```

The files in `contracts/arbitrum/**.sol`  are copied from the Arbitrum repo so not in scope, but submissions showing a bug in these that affects our contracts will be considered valid.

All other files in the repo are not in scope, unless a Warden can show that the introduction of the gateways introduces a vulnerability in them; this would be considered a valid submission as well.
