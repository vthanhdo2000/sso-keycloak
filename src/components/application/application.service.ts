import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { config } from 'src/config/config';

import { InfoDto } from './dto/info.dto';
const { api_key, link_api } = config;

@Injectable()
export class ApplicationService {
  async getApplicationInfo(): Promise<InfoDto> {
    try {
      // Call the external API
      const response = await axios.get(`${link_api}/info`, {
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      });

      if (!response.data) {
        throw new BadGatewayException('Call api to process not found');
      }

      const info: InfoDto = {
        name: response.data.name,
        description: response.data.description,
        tags: response.data.tags,
      };

      return info;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to get basic information about this application',
      );
    }
  }

  async getApplicationParameters() {
    try {
      // Call the external API
      const response = await axios.get(`${link_api}/parameters`, {
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to Get Application Parameters Information');
    }
  }

  async getApplicationMetaInformation() {
    try {
      // Call the external API
      const response = await axios.get(`${link_api}/meta`, {
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to Get Application Meta Information');
    }
  }
}
