import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { kafkaConfig } from './config/kafka.config';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        ...kafkaConfig,
      },
    ]),
    HttpModule,
    KafkaModule,
  ],
  exports: [ClientsModule],
  controllers: [KafkaController],
  providers: [KafkaService],
})
export class KafkaModule {}
