import * as fs from 'fs';
import * as path from 'path';

import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['broker1.company.com:9093', 'broker2.company.com:9093'],
      ssl: {
        rejectUnauthorized: false,
        ca: [fs.readFileSync(path.join(__dirname, '../../certs/ca.crt'), 'utf-8')],
        key: fs.readFileSync(path.join(__dirname, '../../certs/client.key'), 'utf-8'),
        cert: fs.readFileSync(path.join(__dirname, '../../certs/client.crt'), 'utf-8'),
      },
      sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
      clientId: 'ekyc-service',
    },
    consumer: {
      groupId: 'ekyc-consumer-group',
    },
  },
};
