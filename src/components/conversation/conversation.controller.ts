import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ConversationService } from './conversation.service';
import { DeleteConversationDto } from './dto/delete-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { GetMessagesQueryDto } from './dto/get-message-query.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('messages')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMessages(@Query() query: GetMessagesQueryDto) {
    return this.conversationService.getMessages(query);
  }

  @Get('conversations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getConversations(@Query() query: GetConversationsQueryDto) {
    return this.conversationService.getConversations(query);
  }

  @Delete('conversations/:conversation_id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteConversation(
    @Param('conversation_id') conversationId: string,
    @Body() deleteConversationDto: DeleteConversationDto,
  ) {
    const { user } = deleteConversationDto;
    return this.conversationService.deleteConversation(conversationId, user);
  }

  @Post('conversations/:conversation_id/name')
  @UsePipes(new ValidationPipe({ transform: true }))
  async renameConversation(
    @Param('conversation_id') conversationId: string,
    @Body() renameConversationDto: RenameConversationDto,
  ) {
    return this.conversationService.renameConversation(conversationId, renameConversationDto);
  }
}
