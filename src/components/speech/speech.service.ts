import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'src/config/config';
import { Repository } from 'typeorm';

import { TextToAudioDto } from './dto/text-to-audio.dto';
import { SpeechEntity } from './entities/speech.entity';

const { api_key, link_api } = config;

@Injectable()
export class SpeechService {
  constructor(
    @InjectRepository(SpeechEntity)
    private readonly speechRepository: Repository<SpeechEntity>,
  ) {}

  async findOneSpeech(title: string) {
    const speech = await this.speechRepository.findOne({
      where: { title },
    });

    return speech;
  }

  async convertAudio(file: Express.Multer.File, user: string): Promise<string> {
    try {
      const formData = new FormData();

      if (typeof user !== 'string') {
        throw new Error('User must be a string');
      }

      formData.append('user', user.toString());

      const response = await axios.post(`${link_api}/audio-to-text`, formData, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          ...formData.getHeaders(),
        },
      });

      if (!response.data) {
        throw new BadGatewayException('Call api to process not found');
      }
      return response.data.text;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async convertTextToAudio(textToAudioDto: TextToAudioDto) {
    try {
      // Call the external API
      const response = await axios.post(`${link_api}/text-to-audio`, textToAudioDto, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });
      if (!response.data) {
        throw new BadGatewayException('Call api to process not found');
      }
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error('Error:', error);
      throw new InternalServerErrorException('Failed to process Text to Audio');
    }
  }
}
