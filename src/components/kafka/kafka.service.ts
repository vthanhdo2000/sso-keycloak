import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // Đảm bảo NestJS đăng ký consumer topic
    this.kafkaClient.subscribeToResponseOf('ekyc.result');
    await this.kafkaClient.connect();
  }

  async sendMessage(topic: string, message: any) {
    return this.kafkaClient.emit(topic, message);
  }

  // async consume(topic: string, callback: (value: any) => void) {
  //   const consumer = this.kafkaClient.consumer({ groupId: 'my-group' });
  //   await consumer.connect();
  //   await consumer.subscribe({ topic, fromBeginning: true });

  //   await consumer.run({
  //     eachMessage: async ({ topic, message }) => {
  //       const value = message.value?.toString();
  //       console.log(`Received from topic [${topic}]:`, value);
  //       callback(value);
  //     },
  //   });
  // }
}
