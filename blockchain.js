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
      const { timestamp, lastHash, hash, data } = block
      
      if (block.lastHash !== lastBlock.hash) {
        return false
      }

      if (hash !== cryptoHash(timestamp, lastHash, data)) {
        return false
      }

    }
    return true
  }

  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      return
    }

    if (!Blockchain.isValidChain(chain)) {
      return
    }
    
    this.chain
  }
}

module.exports = Blockchain