import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { config } from 'src/config/config';

import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { GetMessagesQueryDto } from './dto/get-message-query.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
const { api_key, link_api } = config;

@Injectable()
export class ConversationService {
  async getMessages(query: GetMessagesQueryDto) {
    try {
      const { conversation_id, user, first_id, limit } = query;

      const response = await axios.get(`${link_api}/messages`, {
        params: {
          conversation_id,
          user,
          first_id,
          limit: limit || 20,
        },
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.data) {
        throw new Error('Call api to process not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw new InternalServerErrorException('Failed to fetch conversation history');
    }
  }

  async getConversations(query: GetConversationsQueryDto) {
    try {
      const { user, last_id, limit, sort_by } = query;

      const response = await axios.get(`${link_api}/conversations`, {
        params: {
          user,
          last_id,
          limit: limit || 20, // Default to 20 if limit is not provided
          sort_by: sort_by || '-updated_at', // Default to '-updated_at' if sort_by is not provided
        },
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.data) {
        throw new Error('Call api to process not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new InternalServerErrorException('Failed to fetch conversations');
    }
  }

  async deleteConversation(conversationId: string, user: string) {
    try {
      const response = await axios.delete(`${link_api}/conversations/${conversationId}`, {
        data: { user }, // Request body
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.data) {
        throw new Error('Call api to process not found');
      }

      return response.data;
    } catch (error) {
      // Log the full error for debugging
      console.error('Error deleting conversation:', error);
      throw new InternalServerErrorException('Failed to delete conversation');
    }
  }

  async renameConversation(conversationId: string, renameConversationDto: RenameConversationDto) {
    try {
      const { name, auto_generate, user } = renameConversationDto;

      const response = await axios.post(
        `${link_api}/conversations/${conversationId}/name`,
        {
          name,
          auto_generate,
          user,
        },
        {
          headers: {
            Authorization: `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data) {
        throw new Error('Call api to process not found');
      }

      return response.data;
    } catch (error) {
      console.log('conversation has deleted');
      console.error('Error renaming conversation:', error);
      throw new InternalServerErrorException('Failed to rename conversation');
    }
  }
}
