const Block = require('./block')
const Transaction = require('../wallet/transaction')
const { cryptoHash } = require('../util')
const { REWARD_INPUT, MINING_REWARD } = require('../config')
const Wallet = require('../wallet')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({data}) {
    const lastBlock = this.chain[this.chain.length - 1]
    const minedBlock = Block.mineBlock({ lastBlock, data})
    this.chain.push(minedBlock)
  }

  static isValidChain(chain) { 
    if (JSON.stringify(chain[0]) != JSON.stringify(Block.genesis())) {
      return false
    }

    for(let i=1; i < chain.length; i++) {
      const block = chain[i]
      const lastBlock = chain[i-1]
      const { timestamp, lastHash, hash, data, nonce, difficulty } = block
      
      if (Math.abs(block.difficulty - lastBlock.difficulty) > 1) {
        return false
      }

      if (block.lastHash !== lastBlock.hash) {
        return false
      }

      if (hash !== cryptoHash(timestamp, lastHash, data, nonce, difficulty)) {
        return false
      }
    }
    return true
  }

  replaceChain(chain , validTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer')
      return
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid')
      return
    }
    
    if (validTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid data')
      return;
    }

    if (onSuccess) onSuccess();
    console.log('replace chain with', chain)
    this.chain = chain
  }

  validTransactionData({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i]
      const transactionSet = new Set()
      let rewardTransactionCount = 0

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1

          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid')
            return false
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction')
            return false
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          })

          if (transaction.input.amount !== trueBalance) {
            console.error('Invalid input amount');
            return false
          }

          if (transactionSet.has(transaction)) {
            console.error('An identical transaction appears more than once in the block')
            return false;
          } else {
            transactionSet.add(transaction)
          }
        }
      }
    }
    return true
  }
}

module.exports = Blockchain