import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import { Server } from 'socket.io';
import { config } from 'src/config/config';

import { ResponseModeEnum } from './constants/response-mode.enum';
import { MessageFeedbackDto } from './dto/message-feedback.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
const { api_key, link_api } = config;

@Injectable()
export class ChatService {
  @WebSocketServer()
  private server: Server;

  async processMessage(data: SendChatMessageDto) {
    const payload = {
      inputs: data.inputs || {},
      query: data.query,
      response_mode: data.response_mode || 'streaming',
      conversation_id: data.conversation_id || '',
      user: data.user,
      files: data.files || [],
    };
    try {
      const response = await axios.post(`${link_api}/chat-messages`, payload, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      });
    } catch (error) {
      console.error('Error calling LLM API:');
      this.server.emit('chatError', 'Failed to process message with LLM');
      throw new Error('Failed to process message with LLM');
    }
  }

  async getBlockingResponse(sendChatMessageDto: SendChatMessageDto) {
    const payload = {
      inputs: sendChatMessageDto.inputs || {},
      query: sendChatMessageDto.query,
      response_mode: sendChatMessageDto.response_mode || ResponseModeEnum.BLOCKING,
      conversation_id: sendChatMessageDto.conversation_id || '',
      user: sendChatMessageDto.user,
      files: sendChatMessageDto.files || [],
    };

    try {
      const response = await axios.post(`${link_api}/chat-messages`, payload, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response) {
        throw new BadGatewayException('Call to link API not found');
      }

      return { data: response.data };
    } catch (error) {
      throw new Error('Failed to process message with LLM');
    }
  }

  async streamResponse(sendChatMessageDto: SendChatMessageDto, res: Response) {
    const payload = {
      inputs: sendChatMessageDto.inputs || {},
      query: sendChatMessageDto.query,
      response_mode: sendChatMessageDto.response_mode || ResponseModeEnum.STREAMING,
      conversation_id: sendChatMessageDto.conversation_id || '',
      user: sendChatMessageDto.user,
      files: sendChatMessageDto.files || [],
    };

    try {
      console.log(payload);

      const response = await axios.post(`${link_api}/chat-messages`, payload, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      });

      if (!response) {
        throw new BadGatewayException('Call to link API not found');
      }

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Forward the streaming data to the client
      response.data.on('data', (chunk) => {
        const chunkString = chunk.toString();
        const lines = chunkString.split('\n');

        lines.forEach((line) => {
          if (line.startsWith('data:')) {
            res.write(line + '\n\n');
          }
        });
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error) => {
        console.error('Streaming error:', error);
        res.status(500).json({ message: 'Streaming error' });
      });
    } catch (error) {
      throw new Error('Failed to process message with LLM');
    }
  }

  async stopGenerate(taskId: string, user: string) {
    try {
      const response = await axios.post(
        `${link_api}/chat-messages/${taskId}/stop`,
        { user },
        {
          headers: {
            Authorization: `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error stopping generation:', error);
      throw new InternalServerErrorException('Failed to stop generation');
    }
  }

  async submitFeedback(messageId: string, feedbackDto: MessageFeedbackDto) {
    try {
      const { rating, user, content } = feedbackDto;

      const response = await axios.post(
        `${link_api}/messages/${messageId}/feedbacks`,
        {
          rating,
          user,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { result: 'success' };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new InternalServerErrorException('Failed to submit feedback');
    }
  }

  async getSuggestedQuestions(messageId: string, user: string) {
    try {
      const response: AxiosResponse = await axios.get(
        `${link_api}/messages/${messageId}/suggested`,
        {
          params: { user },
          headers: {
            Authorization: `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data) {
        throw new BadGatewayException('Call api to process not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
      throw new InternalServerErrorException('Failed to fetch suggested questions');
    }
  }
}
