import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from 'src/common/constants/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

import { ChatService } from './chat.service';
import { ResponseModeEnum } from './constants/response-mode.enum';
import { MessageFeedbackDto } from './dto/message-feedback.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { StopGenerateDto } from './dto/stop-generate.dto';
import { SuggestedQuestionsQueryDto } from './dto/suggested-questions-query.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat-messages')
  @Roles(Role.ADMIN)
  async sendChatMessage(@Body() sendChatMessageDto: SendChatMessageDto, @Res() res: Response) {
    if (sendChatMessageDto.response_mode === ResponseModeEnum.STREAMING) {
      // Stream responses
      await this.chatService.streamResponse(sendChatMessageDto, res);
    }

    if (sendChatMessageDto.response_mode === ResponseModeEnum.BLOCKING) {
      // Blocking mode
      const response = await this.chatService.getBlockingResponse(sendChatMessageDto);
      return res.status(HttpStatus.OK).json(response.data);
    }
  }

  @Post('chat-messages/:task_id/stop')
  async stopGenerate(
    @Param('task_id') taskId: string,
    @Body() stopGenerateDto: StopGenerateDto,
    @Res() res: Response,
  ) {
    const { user } = stopGenerateDto;
    const response = await this.chatService.stopGenerate(taskId, user);

    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/messages/:message_id/feedbacks')
  async submitFeedback(
    @Param('message_id') messageId: string,
    @Body() messageFeedbackDto: MessageFeedbackDto,
  ) {
    return await this.chatService.submitFeedback(messageId, messageFeedbackDto);
  }

  @Get('/messages/:message_id/suggested')
  async getSuggestedQuestions(
    @Param('message_id') messageId: string,
    @Query() query: SuggestedQuestionsQueryDto,
  ) {
    const { user } = query;
    return this.chatService.getSuggestedQuestions(messageId, user);
  }
}
