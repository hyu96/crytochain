const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
  constructor({ blockchain }) {
    this.blockchain = blockchain
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChanels();

    this.subscriber.on(
      'message',
      (chanel, message) => this.handleMessage(chanel, message)
    )
  }

  handleMessage(chanel, message) {
    console.log(`Message received. Chanel: ${chanel}. Message: ${message}`);
    const parsedMessage = JSON.parse(message)

    if (chanel == CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage)
    }
  }

  subscribeToChanels() {
    Object.values(CHANNELS).forEach(chanel => {
      this.subscriber.subscribe(chanel)
    })
  }

  publish({ chanel, message }) {
    this.subscriber.unsubscribe(chanel, () => {
      this.publisher.publish(chanel, message, () => {
        this.subscriber.subscribe(chanel)
      })
    }) 
  }

  broadcastChain() {
    this.publish({
      chanel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }
}

module.exports = PubSub;