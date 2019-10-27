const Block = require('./block')
const { GENESIS_DATA, MINE_RATE } = require('../config')
const { cryptoHash } = require('../util')
const hexToBinary = require('hex-to-binary')
describe('Block ', () => {
  const timestamp = 2000
  const lastHash = 'foo-hash'
  const hash = 'bar-hash'
  const data = ['blockchain', 'data']
  const nonce = 1
  const difficulty = 3
  const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty})

  it('has a timestamp, lastHash, hash, data', () => {
    expect(block.timestamp).toEqual(timestamp)
    expect(block.lastHash).toEqual(lastHash)
    expect(block.hash).toEqual(hash)
    expect(block.data).toEqual(data)
    expect(block.nonce).toEqual(nonce)
    expect(block.difficulty).toEqual(difficulty)
  })

  describe('genesis()', () => {
    const genesisBlock = Block.genesis()

    it('return a Block instance', () => {
      expect(genesisBlock instanceof Block).toEqual(true)
    })

    it('return the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA)
    })
  })

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis()
    const data = 'mined data'
    const minedBlock = Block.mineBlock({ lastBlock, data })
    
    it('return a Block instance', () => {
      expect(minedBlock instanceof Block).toEqual(true)
    })

    it('set the `lastHash` to be the `hash` of the lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash)
    })

    it('set the `data`', () => {
      expect(minedBlock.data).toEqual(data)
    })

    it('set a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined)
    })

    it('create a SHA-256 `hash` based on the proper inputs', () => {
      expect(minedBlock.hash)
        .toEqual(
          cryptoHash(
            minedBlock.timestamp,
            minedBlock.nonce,
            minedBlock.difficulty,
            lastBlock.hash,
            data
          )
        )
    })

    it('set a `hash` that matches the difficulty criteria', () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty))
    })

    it('adjustDifficulty', () => {
      const posibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1]
      expect(posibleResults.includes(minedBlock.difficulty)).toBe(true)
    })
  })

  describe('adjustDifficulty()', () => {
    it('increase the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
      })).toEqual(block.difficulty + 1)
    })

    it('lower the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
      })).toEqual(block.difficulty - 1)
    })

    it('has a lower limit of 1', () => {
      block.difficulty = -1

      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1)
    })
  })
})