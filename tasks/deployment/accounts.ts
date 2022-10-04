import { task } from 'hardhat/config'

import { cliOpts } from '../../cli/defaults'
import { updateItemValue, writeConfig } from '../../cli/config'
import { BigNumber, ContractTransaction } from 'ethers'

task('migrate:accounts', 'Creates protocol accounts and saves them in graph config')
  .addOptionalParam('graphConfig', cliOpts.graphConfig.description)
  .setAction(async (taskArgs, hre) => {
    const { graphConfig, getDeployer } = hre.graph(taskArgs)

    console.log('> Generating addresses')

    const deployer = await getDeployer()
    const [
      ,
      arbitrator,
      governor,
      authority,
      availabilityOracle,
      pauseGuardian,
      allocationExchangeOwner,
    ] = await hre.ethers.getSigners()

    console.log(`- Deployer: ${deployer.address}`)
    console.log(`- Arbitrator: ${arbitrator.address}`)
    console.log(`- Governor: ${governor.address}`)
    console.log(`- Authority: ${authority.address}`)
    console.log(`- Availability Oracle: ${availabilityOracle.address}`)
    console.log(`- Pause Guardian: ${pauseGuardian.address}`)
    console.log(`- Allocation Exchange Owner: ${allocationExchangeOwner.address}`)

    updateItemValue(graphConfig, 'general/arbitrator', arbitrator.address)
    updateItemValue(graphConfig, 'general/governor', governor.address)
    updateItemValue(graphConfig, 'general/authority', authority.address)
    updateItemValue(graphConfig, 'general/availabilityOracle', availabilityOracle.address)
    updateItemValue(graphConfig, 'general/pauseGuardian', pauseGuardian.address)
    updateItemValue(graphConfig, 'general/allocationExchangeOwner', allocationExchangeOwner.address)

    writeConfig(taskArgs.graphConfig, graphConfig.toString())
  })

task('migrate:accounts:nitro', 'Funds protocol accounts on Arbitrum Nitro testnodes')
  .addOptionalParam('graphConfig', cliOpts.graphConfig.description)
  .addOptionalParam('privateKey', 'The private key for Arbitrum testnode genesis account')
  .addOptionalParam('amount', 'The amount to fund each account with')
  .setAction(async (taskArgs, hre) => {
    // Arbitrum Nitro testnodes have a pre-funded genesis account whose private key is hardcoded here:
    // - L1 > https://github.com/OffchainLabs/nitro/blob/01c558c06ad9cbaa083bebe3e51960e195c3fd6b/test-node.bash#L136
    // - L2 > https://github.com/OffchainLabs/nitro/blob/01c558c06ad9cbaa083bebe3e51960e195c3fd6b/testnode-scripts/config.ts#L22
    const genesisAccountPrivateKey =
      taskArgs.privateKey ?? 'e887f7d17d07cc7b8004053fb8826f6657084e88904bb61590e498ca04704cf2'
    const genesisAccount = new hre.ethers.Wallet(genesisAccountPrivateKey)

    // Get protocol accounts
    const { getDeployer, getNamedAccounts, getTestAccounts, provider } = hre.graph(taskArgs)
    const deployer = await getDeployer()
    const testAccounts = await getTestAccounts()
    const namedAccounts = await getNamedAccounts()
    const accounts = [
      deployer,
      ...testAccounts,
      ...Object.keys(namedAccounts).map((k) => namedAccounts[k]),
    ]

    // Amount to fund
    // - If amount is specified, use that
    // - Otherwise, use 95% of genesis account balance with a maximum of 100 Eth
    let amount: BigNumber
    const maxAmount = hre.ethers.utils.parseEther('100')
    const genesisAccountBalance = await provider.getBalance(genesisAccount.address)

    if (taskArgs.amount) {
      amount = hre.ethers.BigNumber.from(taskArgs.amount)
    } else {
      const splitGenesisBalance = genesisAccountBalance.mul(95).div(100).div(accounts.length)
      if (splitGenesisBalance.gt(maxAmount)) {
        amount = maxAmount
      } else {
        amount = splitGenesisBalance
      }
    }

    // Check genesis account balance
    const requiredFunds = amount.mul(accounts.length)
    if (genesisAccountBalance.lt(requiredFunds)) {
      throw new Error('Insufficient funds in genesis account')
    }

    // Fund accounts
    console.log('> Funding protocol addresses')
    console.log(`Genesis account: ${genesisAccount.address}`)
    console.log(`Total accounts: ${accounts.length}`)
    console.log(`Amount per account: ${hre.ethers.utils.formatEther(amount)}`)
    console.log(`Required funds: ${hre.ethers.utils.formatEther(requiredFunds)}`)

    const txs: ContractTransaction[] = []
    for (const account of accounts) {
      const tx = await genesisAccount.connect(provider).sendTransaction({
        value: amount,
        to: account.address,
      })
      txs.push(tx)
    }
    await Promise.all(txs.map((tx) => tx.wait()))
    console.log('Done!')
  })
