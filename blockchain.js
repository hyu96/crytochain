const Block = require('./block')
const cryptoHash = require('./crypto-hash')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock(data) {
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

  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer')
      return
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid')
      return
    }
    
    console.log('replace chain with', chain)
    this.chain = chain
  }
}

module.exports = Blockchain