import amqp from 'amqplib';
import config from 'config';

import logger from './logger';

export default {
  // connect to RabbitMQ server.
  async connect() {
    try {
      this.connection = await amqp.connect(config.get('rabbitmq.url'));

      /*
       * single channel is created and is used between
       * Producer and Consumer
       * api-gateway microserive is the only Producer, also
       * UI microservice is the only Consumer
       */
      this.channel = await this.connection.createChannel();
    } catch (err) {
      logger.error('Rabbitmq connect error: ', err);
    }
  },

  // publish message to a queue
  async sendMessage(queue, data) {
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  },

  /*
   * function not in use.
   * Consumer: receive message from a queue
   */
  async receiveMessage(queue) {
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, message => console.log(queue, message.content.toString()));
  },

  /*
   * function not in use.
   * close the channel and server connection.
   */
  async close() {
    await this.channel.close();
    await this.connection.close();
  },
};
