import { Body } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat-messages')
  async handleMessage(@Body() data: SendChatMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.chatService.processMessage(data);

      this.server.to(client.id).emit('chatResponse', response);

      await this.server.emit('message', response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.server.emit('error', 'Failed to process message');
    }
  }
}
