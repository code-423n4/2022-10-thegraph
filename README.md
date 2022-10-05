# The Graph contest details

- $47,500 USDC main award pot
- $2,500 USDC gas optimization award pot
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2022-10-the-graph-l2-bridge-contest/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts October 7, 2022 20:00 UTC
- Ends October 12, 2022 20:00 UTC

**IMPORTANT NOTE**: Prior to receiving payment from this contest you MUST become a Certified Warden (successfully complete KYC and pass screening for OFAC sanctions). You do not have to complete this process before competing or submitting bugs.

## Overview

[The Graph](https://thegraph.com) is a decentralized protocol for indexing and querying data from blockchains, starting with Ethereum. It makes it possible to query data that is difficult to query directly.

The Graph Network consists of Indexers, Curators and Delegators that provide services to the network, and serve data to Web3 applications. Consumers use the applications and consume the data.

To ensure economic security of The Graph Network and the integrity of data being queried, participants stake and use Graph Tokens (GRT). GRT is a work token that is an ERC-20 on the Ethereum blockchain, used to allocate resources in the network. Active Indexers, Curators and Delegators can provide services and earn income from the network, proportional to the amount of work they perform and their GRT stake.

To reduce gas costs and sustainably scale The Graph Network, there are active proposals to move the contracts to the Arbitrum Layer 2 blockchain. To mitigate risk, the proposed approach is to initially run the protocol in L1 in parallel with the protocol in L2. During a first stage, the L2 protocol would not distribute any Indexer rewards, and therefore not have any token issuance in L2.

The scope for this contest is the first step of this migration, that consists in a custom token bridge to send GRT between Ethereum and Arbitrum.

## Scope and areas of focus

The changes that make up the scope for this contest are described in the following proposal: [GIP-0031](https://hackmd.io/@N6uqeJqKRhS_geEwjyATnQ/rJoKEmvrq) (also in this [Forum discussion](https://forum.thegraph.com/t/gip-0031-arbitrum-grt-bridge/3305)). We recommend that Wardens read this spec to understand the scope and the rationale for the design of these contracts. This corresponds to [PR #699 in the graphprotocol/contracts repo](https://github.com/graphprotocol/contracts/pull/699).

The contracts that are in scope for this audit were added with this spec in mind, and any deviation between the implementation and this spec can be considered a valid submission.

We’re mostly looking to validate the security of the token bridge: that tokens in the BridgeEscrow are safe, that transferring between L1 and L2 is safe (and works as expected), and that an attacker cannot steal funds from the bridge or mint tokens at will.

We’re assuming that the Arbitrum rollup and bridge contracts behave as expected, though we do want to minimize the impact of any breach to Arbitrum admin keys. Therefore, any submissions that can show the bridge opening up an *unnecessary* attack surface in a scenario where Arbitrum is compromised can be considered valid as well. The same applies to the Arbitrum GatewayRouter: we assume it behaves correctly, but any submissions showing our integration with it is incorrect or opening up an unnecessary attack surface will be valid as well.

The current bridge design assumes no tokens are minted in L2 (other than through the bridge), so any submissions showing how an attacker can mint tokens in L2 (without compromising the governor account) would be particularly valuable.

The bridge includes the ability to trigger callbacks in L2 when sending tokens from a whitelisted set of addresses. This will be useful for later stages of the migration plan. We encourage submissions that show ways to bypass the whitelist or otherwise exploit this feature, but considering that governance would only add a trusted L1 contract (e.g. GNS, Curation or Staking) to this whitelist. We still want to make this robust against a whitelisted sender being compromised, so submissions showing how a compromised/malicious whitelisted sender or receiver causes damage to the bridge or other protocol contracts would be valid as well.

## Previous audit report

A previous version of this code was audited (together with 3 other PRs) by OpenZeppelin on July 2022. A report for this audit, which also includes the 3 other PRs that are out of scope, is available [here](https://github.com/code-423n4/2022-10-thegraph/blob/main/audits/OpenZeppelin/2022-07-graph-arbitrum-bridge-audit.pdf); the list of issues from that report that are relevant to this scope is available in [this document](https://github.com/code-423n4/2022-10-thegraph/blob/main/audits/OpenZeppelin/2022-07-pr552-summary.pdf). Any reports that are duplicates of issues mentioned there will be considered invalid, unless:

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

Note that this requires having `curl` installed as we use it to check if the local EVM node is ready.

This command also accepts specific test files, e.g.

```
yarn test:gas test/gateway/l1GraphTokenGateway.test.ts
```

## All-in-one command

This will clone, install, and build the project, then run tests with gas reporting and output to `reports/gas-report.log`:

```
rm -Rf 2022-10-thegraph || true && git clone https://github.com/code-423n4/2022-10-thegraph.git && cd 2022-10-thegraph && nvm install 16.0 && yarn && yarn build && yarn test:gas
```

## Scope

The contracts in scope that will be deployed are the following:

- [BridgeEscrow](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/BridgeEscrow.sol)
- [L1GraphTokenGateway](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/L1GraphTokenGateway.sol)
- [L2GraphToken](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/L2GraphToken.sol)
- [L2GraphTokenGateway](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/gateway/L2GraphTokenGateway.sol)

Each of these will be deployed behind a proxy, so we're including the proxy and upgrade logic in the scope, as well as the dependencies for the contracts in scope that relate to governance and the pausing mechanism.

The files in `contracts/arbitrum/**.sol`  are copied from the Arbitrum repo so not in scope; the only change from the original was the solidity version.

All other files in the repo are not in scope.

### Files in scope

|File|[SLOC](#nowhere "(nSLOC, SLOC, Lines)")|[Coverage](#nowhere "(Lines hit / Total)")|
|:-|:-:|:-:|
|_Contracts (12)_|
|[contracts/gateway/BridgeEscrow.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/BridgeEscrow.sol)|[16](#nowhere "(nSLOC:16, SLOC:16, Lines:40)")|[100.00%](#nowhere "(Hit:4 / Total:4)")|
|[contracts/upgrades/GraphUpgradeable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/GraphUpgradeable.sol) [🖥](#nowhere "Uses Assembly")|[29](#nowhere "(nSLOC:26, SLOC:29, Lines:65)")|[100.00%](#nowhere "(Hit:8 / Total:8)")|
|[contracts/governance/Governed.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/Governed.sol)|[32](#nowhere "(nSLOC:32, SLOC:32, Lines:68)")|[100.00%](#nowhere "(Hit:14 / Total:14)")|
|[contracts/governance/Pausable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/Pausable.sol)|[36](#nowhere "(nSLOC:36, SLOC:36, Lines:60)")|[86.67%](#nowhere "(Hit:13 / Total:15)")|
|[contracts/l2/token/L2GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/L2GraphToken.sol)|[39](#nowhere "(nSLOC:39, SLOC:39, Lines:94)")|[100.00%](#nowhere "(Hit:14 / Total:14)")|
|[contracts/upgrades/GraphProxyAdmin.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/GraphProxyAdmin.sol)|[40](#nowhere "(nSLOC:36, SLOC:40, Lines:103)")|[100.00%](#nowhere "(Hit:14 / Total:14)")|
|[contracts/upgrades/GraphProxyStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/GraphProxyStorage.sol) [🖥](#nowhere "Uses Assembly")|[63](#nowhere "(nSLOC:63, SLOC:63, Lines:140)")|[89.47%](#nowhere "(Hit:17 / Total:19)")|
|[contracts/upgrades/GraphProxy.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/GraphProxy.sol) [🖥](#nowhere "Uses Assembly") [💰](#nowhere "Payable Functions") [👥](#nowhere "DelegateCall") [🧮](#nowhere "Uses Hash-Functions")|[89](#nowhere "(nSLOC:89, SLOC:89, Lines:202)")|[96.67%](#nowhere "(Hit:29 / Total:30)")|
|[contracts/governance/Managed.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/Managed.sol) [🧮](#nowhere "Uses Hash-Functions")|[97](#nowhere "(nSLOC:97, SLOC:97, Lines:196)")|[94.87%](#nowhere "(Hit:37 / Total:39)")|
|[contracts/l2/token/GraphTokenUpgradeable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/GraphTokenUpgradeable.sol) [🖥](#nowhere "Uses Assembly") [🧮](#nowhere "Uses Hash-Functions")|[103](#nowhere "(nSLOC:95, SLOC:103, Lines:203)")|[100.00%](#nowhere "(Hit:28 / Total:28)")|
|[contracts/l2/gateway/L2GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/gateway/L2GraphTokenGateway.sol) [💰](#nowhere "Payable Functions")|[156](#nowhere "(nSLOC:132, SLOC:156, Lines:297)")|[100.00%](#nowhere "(Hit:47 / Total:47)")|
|[contracts/gateway/L1GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/L1GraphTokenGateway.sol) [💰](#nowhere "Payable Functions")|[193](#nowhere "(nSLOC:166, SLOC:193, Lines:359)")|[100.00%](#nowhere "(Hit:75 / Total:75)")|
|_Abstracts (1)_|
|[contracts/gateway/GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/GraphTokenGateway.sol)|[27](#nowhere "(nSLOC:27, SLOC:27, Lines:57)")|[100.00%](#nowhere "(Hit:7 / Total:7)")|
|_Interfaces (10)_|
|[contracts/curation/IGraphCurationToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/IGraphCurationToken.sol)|[7](#nowhere "(nSLOC:7, SLOC:7, Lines:13)")|-|
|[contracts/gateway/ICallhookReceiver.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/ICallhookReceiver.sol)|[8](#nowhere "(nSLOC:4, SLOC:8, Lines:23)")|-|
|[contracts/upgrades/IGraphProxy.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/IGraphProxy.sol)|[10](#nowhere "(nSLOC:10, SLOC:10, Lines:19)")|-|
|[contracts/epochs/IEpochManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/epochs/IEpochManager.sol)|[13](#nowhere "(nSLOC:13, SLOC:13, Lines:31)")|-|
|[contracts/governance/IController.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/IController.sol)|[13](#nowhere "(nSLOC:13, SLOC:13, Lines:29)")|-|
|[contracts/token/IGraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/IGraphToken.sol)|[22](#nowhere "(nSLOC:14, SLOC:22, Lines:43)")|-|
|[contracts/rewards/IRewardsManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/rewards/IRewardsManager.sol)|[31](#nowhere "(nSLOC:24, SLOC:31, Lines:62)")|-|
|[contracts/staking/IStakingData.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/IStakingData.sol)|[31](#nowhere "(nSLOC:31, SLOC:31, Lines:54)")|-|
|[contracts/curation/ICuration.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/ICuration.sol)|[35](#nowhere "(nSLOC:18, SLOC:35, Lines:58)")|-|
|[contracts/staking/IStaking.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/IStaking.sol)|[91](#nowhere "(nSLOC:54, SLOC:91, Lines:160)")|-|
|Total (over 23 files):| [1181](#nowhere "(nSLOC:1042, SLOC:1181, Lines:2376)")| [97.77%](#nowhere "Hit:307 / Total:314")|


### All other source contracts (not in scope)

|File|[SLOC](#nowhere "(nSLOC, SLOC, Lines)")|[Coverage](#nowhere "(Lines hit / Total)")|
|:-|:-:|:-:|
|_Contracts (23)_|
|[contracts/discovery/ServiceRegistryStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/ServiceRegistryStorage.sol)|[6](#nowhere "(nSLOC:6, SLOC:6, Lines:13)")|-|
|[contracts/epochs/EpochManagerStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/epochs/EpochManagerStorage.sol)|[8](#nowhere "(nSLOC:8, SLOC:8, Lines:19)")|-|
|[contracts/governance/GraphGovernanceStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/GraphGovernanceStorage.sol)|[11](#nowhere "(nSLOC:11, SLOC:11, Lines:21)")|-|
|[contracts/disputes/DisputeManagerStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/disputes/DisputeManagerStorage.sol)|[12](#nowhere "(nSLOC:12, SLOC:12, Lines:34)")|-|
|[contracts/curation/GraphCurationToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/GraphCurationToken.sol)|[15](#nowhere "(nSLOC:15, SLOC:15, Lines:48)")|[100.00%](#nowhere "(Hit:4 / Total:4)")|
|[contracts/rewards/RewardsManagerStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/rewards/RewardsManagerStorage.sol)|[17](#nowhere "(nSLOC:17, SLOC:17, Lines:33)")|-|
|[contracts/discovery/SubgraphNFTDescriptor.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/SubgraphNFTDescriptor.sol)|[19](#nowhere "(nSLOC:14, SLOC:19, Lines:25)")|[100.00%](#nowhere "(Hit:4 / Total:4)")|
|[contracts/staking/StakingStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/StakingStorage.sol)|[30](#nowhere "(nSLOC:30, SLOC:30, Lines:89)")|-|
|[contracts/statechannels/GRTWithdrawHelper.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/GRTWithdrawHelper.sol) [📤](#nowhere "Initiates ETH Value Transfer") [🧮](#nowhere "Uses Hash-Functions")|[43](#nowhere "(nSLOC:43, SLOC:43, Lines:95)")|[86.67%](#nowhere "(Hit:13 / Total:15)")|
|[contracts/discovery/ServiceRegistry.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/ServiceRegistry.sol)|[51](#nowhere "(nSLOC:43, SLOC:51, Lines:113)")|[100.00%](#nowhere "(Hit:15 / Total:15)")|
|[contracts/governance/Controller.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/Controller.sol)|[59](#nowhere "(nSLOC:55, SLOC:59, Lines:132)")|[100.00%](#nowhere "(Hit:19 / Total:19)")|
|[contracts/governance/GraphGovernance.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/GraphGovernance.sol)|[59](#nowhere "(nSLOC:49, SLOC:59, Lines:110)")|[100.00%](#nowhere "(Hit:16 / Total:16)")|
|[contracts/epochs/EpochManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/epochs/EpochManager.sol)|[62](#nowhere "(nSLOC:62, SLOC:62, Lines:145)")|[85.19%](#nowhere "(Hit:23 / Total:27)")|
|[contracts/statechannels/AllocationExchange.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/AllocationExchange.sol) [📤](#nowhere "Initiates ETH Value Transfer") [🧮](#nowhere "Uses Hash-Functions")|[75](#nowhere "(nSLOC:75, SLOC:75, Lines:170)")|[92.59%](#nowhere "(Hit:25 / Total:27)")|
|[contracts/discovery/SubgraphNFT.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/SubgraphNFT.sol)|[85](#nowhere "(nSLOC:76, SLOC:85, Lines:167)")|[100.00%](#nowhere "(Hit:27 / Total:27)")|
|[contracts/token/GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/GraphToken.sol) [🖥](#nowhere "Uses Assembly") [🧮](#nowhere "Uses Hash-Functions")|[99](#nowhere "(nSLOC:91, SLOC:99, Lines:193)")|[100.00%](#nowhere "(Hit:24 / Total:24)")|
|[contracts/curation/Curation.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/Curation.sol)|[249](#nowhere "(nSLOC:201, SLOC:249, Lines:472)")|[100.00%](#nowhere "(Hit:86 / Total:86)")|
|[contracts/rewards/RewardsManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/rewards/RewardsManager.sol) [🖥](#nowhere "Uses Assembly")|[272](#nowhere "(nSLOC:234, SLOC:272, Lines:504)")|[100.00%](#nowhere "(Hit:80 / Total:80)")|
|[contracts/discovery/erc1056/EthereumDIDRegistry.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/erc1056/EthereumDIDRegistry.sol) [🧮](#nowhere "Uses Hash-Functions") [🔖](#nowhere "Handles Signatures: ecrecover")|[284](#nowhere "(nSLOC:194, SLOC:284, Lines:325)")|[0.00%](#nowhere "(Hit:0 / Total:40)")|
|[contracts/disputes/DisputeManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/disputes/DisputeManager.sol) [🖥](#nowhere "Uses Assembly") [🧮](#nowhere "Uses Hash-Functions")|[415](#nowhere "(nSLOC:364, SLOC:415, Lines:816)")|[99.16%](#nowhere "(Hit:118 / Total:119)")|
|[contracts/discovery/GNS.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/GNS.sol) [📤](#nowhere "Initiates ETH Value Transfer") [🧮](#nowhere "Uses Hash-Functions")|[429](#nowhere "(nSLOC:350, SLOC:429, Lines:862)")|[88.67%](#nowhere "(Hit:133 / Total:150)")|
|[contracts/bancor/BancorFormula.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/bancor/BancorFormula.sol)|[517](#nowhere "(nSLOC:480, SLOC:517, Lines:775)")|-|
|[contracts/staking/Staking.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/Staking.sol) [🧮](#nowhere "Uses Hash-Functions")|[846](#nowhere "(nSLOC:700, SLOC:846, Lines:1652)")|[96.98%](#nowhere "(Hit:321 / Total:331)")|
|_Abstracts (5)_|
|[contracts/curation/CurationStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/CurationStorage.sol)|[15](#nowhere "(nSLOC:15, SLOC:15, Lines:40)")|-|
|[contracts/arbitrum/L2ArbitrumMessenger.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/L2ArbitrumMessenger.sol)|[16](#nowhere "(nSLOC:11, SLOC:16, Lines:47)")|-|
|[contracts/base/Multicall.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/base/Multicall.sol) [🖥](#nowhere "Uses Assembly") [👥](#nowhere "DelegateCall")|[19](#nowhere "(nSLOC:19, SLOC:19, Lines:34)")|[100.00%](#nowhere "(Hit:8 / Total:8)")|
|[contracts/discovery/GNSStorage.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/GNSStorage.sol)|[19](#nowhere "(nSLOC:19, SLOC:19, Lines:51)")|-|
|[contracts/arbitrum/L1ArbitrumMessenger.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/L1ArbitrumMessenger.sol)|[66](#nowhere "(nSLOC:48, SLOC:66, Lines:103)")|-|
|_Libraries (9)_|
|[contracts/arbitrum/AddressAliasHelper.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/AddressAliasHelper.sol)|[10](#nowhere "(nSLOC:10, SLOC:10, Lines:46)")|-|
|[contracts/staking/libs/MathUtils.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/MathUtils.sol)|[19](#nowhere "(nSLOC:14, SLOC:19, Lines:45)")|[100.00%](#nowhere "(Hit:3 / Total:3)")|
|[contracts/libraries/HexStrings.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/libraries/HexStrings.sol)|[27](#nowhere "(nSLOC:27, SLOC:27, Lines:36)")|[93.75%](#nowhere "(Hit:15 / Total:16)")|
|[contracts/utils/TokenUtils.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/utils/TokenUtils.sol) [📤](#nowhere "Initiates ETH Value Transfer")|[27](#nowhere "(nSLOC:19, SLOC:27, Lines:50)")|[100.00%](#nowhere "(Hit:6 / Total:6)")|
|[contracts/staking/libs/Cobbs.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/Cobbs.sol)|[34](#nowhere "(nSLOC:26, SLOC:34, Lines:92)")|[100.00%](#nowhere "(Hit:8 / Total:8)")|
|[contracts/libraries/Base58Encoder.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/libraries/Base58Encoder.sol)|[46](#nowhere "(nSLOC:46, SLOC:46, Lines:58)")|[100.00%](#nowhere "(Hit:27 / Total:27)")|
|[contracts/staking/libs/Rebates.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/Rebates.sol)|[66](#nowhere "(nSLOC:54, SLOC:66, Lines:114)")|[100.00%](#nowhere "(Hit:16 / Total:16)")|
|[contracts/staking/libs/Stakes.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/Stakes.sol)|[84](#nowhere "(nSLOC:76, SLOC:84, Lines:196)")|[100.00%](#nowhere "(Hit:28 / Total:28)")|
|[contracts/staking/libs/LibFixedMath.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/LibFixedMath.sol)|[298](#nowhere "(nSLOC:294, SLOC:298, Lines:408)")|[71.69%](#nowhere "(Hit:119 / Total:166)")|
|_Interfaces (17)_|
|[contracts/governance/IManaged.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/IManaged.sol)|[4](#nowhere "(nSLOC:4, SLOC:4, Lines:7)")|-|
|[contracts/arbitrum/IMessageProvider.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/IMessageProvider.sol)|[5](#nowhere "(nSLOC:5, SLOC:5, Lines:32)")|-|
|[contracts/base/IMulticall.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/base/IMulticall.sol)|[5](#nowhere "(nSLOC:5, SLOC:5, Lines:17)")|-|
|[contracts/arbitrum/IArbToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/IArbToken.sol)|[6](#nowhere "(nSLOC:6, SLOC:6, Lines:47)")|-|
|[contracts/statechannels/WithdrawHelper.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/WithdrawHelper.sol)|[6](#nowhere "(nSLOC:6, SLOC:6, Lines:10)")|-|
|[contracts/discovery/ISubgraphNFTDescriptor.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/ISubgraphNFTDescriptor.sol)|[9](#nowhere "(nSLOC:4, SLOC:9, Lines:20)")|-|
|[contracts/discovery/erc1056/IEthereumDIDRegistry.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/erc1056/IEthereumDIDRegistry.sol)|[10](#nowhere "(nSLOC:5, SLOC:10, Lines:14)")|-|
|[contracts/discovery/ISubgraphNFT.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/ISubgraphNFT.sol)|[11](#nowhere "(nSLOC:11, SLOC:11, Lines:25)")|-|
|[contracts/discovery/IServiceRegistry.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/IServiceRegistry.sol)|[16](#nowhere "(nSLOC:12, SLOC:16, Lines:24)")|-|
|[contracts/arbitrum/ITokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/ITokenGateway.sol) [💰](#nowhere "Payable Functions")|[19](#nowhere "(nSLOC:6, SLOC:19, Lines:74)")|-|
|[contracts/statechannels/ICMCWithdraw.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/ICMCWithdraw.sol)|[19](#nowhere "(nSLOC:15, SLOC:19, Lines:24)")|-|
|[contracts/governance/IGraphGovernance.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/governance/IGraphGovernance.sol)|[21](#nowhere "(nSLOC:11, SLOC:21, Lines:53)")|-|
|[contracts/arbitrum/IOutbox.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/IOutbox.sol)|[24](#nowhere "(nSLOC:23, SLOC:24, Lines:58)")|-|
|[contracts/arbitrum/IBridge.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/IBridge.sol) [💰](#nowhere "Payable Functions")|[36](#nowhere "(nSLOC:28, SLOC:36, Lines:77)")|-|
|[contracts/arbitrum/IInbox.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/IInbox.sol) [💰](#nowhere "Payable Functions")|[50](#nowhere "(nSLOC:17, SLOC:50, Lines:88)")|-|
|[contracts/disputes/IDisputeManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/disputes/IDisputeManager.sol)|[53](#nowhere "(nSLOC:43, SLOC:53, Lines:86)")|-|
|[contracts/discovery/IGNS.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/IGNS.sol)|[80](#nowhere "(nSLOC:36, SLOC:80, Lines:114)")|-|
|Total (over 54 files):| [4783](#nowhere "(nSLOC:4045, SLOC:4783, Lines:8903)")| [90.17%](#nowhere "Hit:1138 / Total:1262")|

## External imports
* **@openzeppelin/contracts-upgradeable/token/ERC20/ERC20BurnableUpgradeable.sol**
  * [contracts/l2/token/GraphTokenUpgradeable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/GraphTokenUpgradeable.sol)
* **@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol**
  * ~~[contracts/curation/GraphCurationToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/GraphCurationToken.sol)~~
* **@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol**
  * [contracts/curation/IGraphCurationToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/IGraphCurationToken.sol)
* **@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol**
  * [contracts/l2/gateway/L2GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/gateway/L2GraphTokenGateway.sol)
* **@openzeppelin/contracts/cryptography/ECDSA.sol**
  * ~~[contracts/disputes/DisputeManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/disputes/DisputeManager.sol)~~
  * [contracts/l2/token/GraphTokenUpgradeable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/GraphTokenUpgradeable.sol)
  * ~~[contracts/staking/Staking.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/Staking.sol)~~
  * ~~[contracts/statechannels/AllocationExchange.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/AllocationExchange.sol)~~
  * ~~[contracts/token/GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/GraphToken.sol)~~
* **@openzeppelin/contracts/math/SafeMath.sol**
  * ~~[contracts/bancor/BancorFormula.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/bancor/BancorFormula.sol)~~
  * ~~[contracts/curation/Curation.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/Curation.sol)~~
  * ~~[contracts/discovery/GNS.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/GNS.sol)~~
  * ~~[contracts/disputes/DisputeManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/disputes/DisputeManager.sol)~~
  * ~~[contracts/epochs/EpochManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/epochs/EpochManager.sol)~~
  * [contracts/gateway/L1GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/L1GraphTokenGateway.sol)
  * [contracts/l2/gateway/L2GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/gateway/L2GraphTokenGateway.sol)
  * [contracts/l2/token/GraphTokenUpgradeable.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/GraphTokenUpgradeable.sol)
  * [contracts/l2/token/L2GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/l2/token/L2GraphToken.sol)
  * ~~[contracts/rewards/RewardsManager.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/rewards/RewardsManager.sol)~~
  * ~~[contracts/staking/libs/MathUtils.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/MathUtils.sol)~~
  * ~~[contracts/staking/libs/Rebates.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/Rebates.sol)~~
  * ~~[contracts/staking/libs/Stakes.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/staking/libs/Stakes.sol)~~
  * ~~[contracts/token/GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/GraphToken.sol)~~
* **@openzeppelin/contracts/proxy/Clones.sol**
  * ~~[contracts/curation/Curation.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/Curation.sol)~~
* **@openzeppelin/contracts/token/ERC20/ERC20.sol**
  * ~~[contracts/token/GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/GraphToken.sol)~~
* **@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol**
  * ~~[contracts/token/GraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/GraphToken.sol)~~
* **@openzeppelin/contracts/token/ERC20/IERC20.sol**
  * [contracts/token/IGraphToken.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/token/IGraphToken.sol)
* **@openzeppelin/contracts/token/ERC721/ERC721.sol**
  * ~~[contracts/discovery/SubgraphNFT.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/SubgraphNFT.sol)~~
* **@openzeppelin/contracts/token/ERC721/IERC721.sol**
  * ~~[contracts/discovery/ISubgraphNFT.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/ISubgraphNFT.sol)~~
* **@openzeppelin/contracts/utils/Address.sol**
  * ~~[contracts/curation/Curation.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/curation/Curation.sol)~~
  * ~~[contracts/discovery/GNS.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/GNS.sol)~~
  * ~~[contracts/discovery/SubgraphNFT.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/discovery/SubgraphNFT.sol)~~
  * [contracts/gateway/L1GraphTokenGateway.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/gateway/L1GraphTokenGateway.sol)
  * ~~[contracts/statechannels/AllocationExchange.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/statechannels/AllocationExchange.sol)~~
  * [contracts/upgrades/GraphProxy.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/upgrades/GraphProxy.sol)
* **arbos-precompiles/arbos/builtin/ArbSys.sol**
  * ~~[contracts/arbitrum/L2ArbitrumMessenger.sol](https://github.com/code-423n4/2022-10-thegraph/blob/main/contracts/arbitrum/L2ArbitrumMessenger.sol)~~

## Documentation

- The original repo's README can be found [here](https://github.com/code-423n4/2022-10-thegraph/blob/main/original_README.md)
- A post describing the way the protocol is designed is available in The Graph blog: [Part 1](https://thegraph.com/blog/the-graph-network-in-depth-part-1/) and [Part 2](https://thegraph.com/blog/the-graph-network-in-depth-part-2/)
- As mentioned above, the spec for the changes in scope for this audit is available in [The Graph Forum](https://forum.thegraph.com/t/gip-0031-arbitrum-grt-bridge/3305) or [HackMD](https://hackmd.io/@N6uqeJqKRhS_geEwjyATnQ/rJoKEmvrq)

## Other notes and details about the scope

- How many (non-library) contracts are in the scope?
  * 4 new contracts (with their proxies) that will be deployed, but a total of 23 files (including internal dependencies and interfaces)
- Total sLoC in these contracts?
  * 1181 SLOC including internal dependencies
- How many library dependencies?
  * 19 internal dependency files (in scope), 7 OpenZeppelin library dependencies, plus 9 Arbitrum dependencies that have been copied to change the solidity version
- How many separate interfaces and struct definitions are there for the contracts within scope?
  * 10 interfaces, 6 structs
- Does most of your code generally use composition or inheritance?
  * Mostly inheritance
- How many external calls?
  * 5 outgoing calls to Arbitrum interfaces
- Is there a need to understand a separate part of the codebase / get context in order to audit this part of the protocol?
  * Yes
- Please describe required context:
   It should be sufficient with reading the associated proposal [GIP-0031](https://forum.thegraph.com/t/gip-0031-arbitrum-grt-bridge/3305)
- Does it use an oracle?
  * No
- Does the token conform to the ERC20 standard?
  * Yes
- Are there any novel or unique curve logic or mathematical models?
  * Not in the scope for this audit - other contracts in the repo do use bonding curves and other math models
- Does it use a timelock function?
  * No
- Is it an NFT?
  * Not in the scope for this audit - the GNS contract does use an NFT for subgraph ownership
- Does it have an AMM?
  * No
- Is it a fork of a popular project?
  * No (though there are influences from other projects in a few places, and this scope is inspired by the default Arbitrum bridge and Livepeer's custom bridge)
- Does it use rollups?
  * Yes! This is key to the audit scope
- Is it multi-chain?
  * No
- Does it use a side-chain?
  * No
- Do you have a preferred timezone for communication?
  * GMT-5 / GMT-3
