import amqp from 'amqplib';
import logger from './logger';

export default {
  async connect() {
    try {
      this.connection = await amqp.connect('amqp://rabbitmq:5672');
      this.channel = await this.connection.createChannel();
    } catch (err) {
      logger.error('Rabbitmq connect error: ', err);
    }
  },

  async sendMessage(queue, data) {
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  },

  async receiveMessage(queue) {
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, message => console.log(queue, message.content.toString()));
  },

  async close() {
    await this.channel.close();
    await this.connection.close();
  },
};
