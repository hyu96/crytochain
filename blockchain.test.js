const Block = require('./block')
const Blockchain = require('./blockchain')

describe('blockchain', () => {
  let blockchain, newChain, originalChain
  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()

    originalChain = blockchain.chain
  })

  it('contain a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toEqual(true)
  })

  it('starts with a genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })

  it('adds a new block to the chain', () => {
    const newData = 'foo bar'
    blockchain.addBlock(newData)
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
  })

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('return false', () => {
        blockchain.chain[0] = { data: 'fake-genesis'}
        expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
      })
    })

    describe('when the chain start with the genesis block and has multiple blocks', () => {
      describe('and a lastHash reference has changed', () => {
        it('return false', () => {
          blockchain.addBlock('bears')
          blockchain.addBlock('beats')
          blockchain.addBlock('hello-world')
  
          blockchain.chain[2].hash = 'broken-hash'
          expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
        })
      })

      describe('and the chain contain a block with an invalid field', () => {
        it('return false', () => {
          blockchain.addBlock('bears')
          blockchain.addBlock('beats')
          blockchain.addBlock('hello-world')
  
          blockchain.chain[2].data = 'fake-data'
          expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
        })
      })

      describe('and the chain does not contain any invalid blocks', () => {
        it('return true', () => {
          blockchain.addBlock('bears')
          blockchain.addBlock('beats')
          blockchain.addBlock('hello-world')
  
          expect(Blockchain.isValidChain(blockchain.chain)).toEqual(true)
        })
      })
    })
  })

  describe('replaceChain()', () => {
    let errorMock, logMock

    beforeEach(() => {
      errorMock = jest.fn()
      logMock = jest.fn()

      global.console.error = errorMock
      global.console.log = logMock
    })

    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0] = { new: 'chain'}
        blockchain.replaceChain(newChain.chain)
      })

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain)
      })

      it('log an error', () => {
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('when the chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock('bears')
        newChain.addBlock('beats')
        newChain.addBlock('hello-world')
      })

      describe('and the chain is invalid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'fake-hash'
          blockchain.replaceChain(newChain.chain)
        })
        
        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain)
        })

        it('log an error', () => {
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain)
        })
        it('replace the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain)
        })

        it('logs about the chain replacement', () => {
          expect(logMock).toHaveBeenCalled()
        })
      })
    })
  })  
})