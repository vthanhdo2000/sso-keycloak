import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
