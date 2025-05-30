import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { config } from 'src/config/config';
import { Repository } from 'typeorm';

import { FileEntity } from '../file/entities/file.entity';
import { FileService } from '../file/file.service';
import { SpeechEntity } from '../speech/entities/speech.entity';
import { SpeechService } from '../speech/speech.service';
const { api_key, link_api } = config;

@Injectable()
export class BackofficeService {
  private readonly logger = new Logger(BackofficeService.name);
  constructor(
    private readonly fileService: FileService,
    private readonly speechService: SpeechService,
    @InjectRepository(SpeechEntity)
    private readonly speechRepository: Repository<SpeechEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async query(): Promise<any> {
    const result = await this.speechService.findOneSpeech('Test');
    if (!result) {
      throw new NotFoundException('Speech not found');
    }
    const queryAll = await this.speechRepository.find({ relations: ['files'] });
    return { result: result, queryAll: queryAll };
  }

  async queryAll(): Promise<any> {
    const result = await this.speechService.findOneSpeech('Test');
    if (!result) {
      throw new NotFoundException('Speech not found');
    }
    const queryAll = await this.speechRepository.find({ relations: ['files'] });
    return { result: result, queryAll: queryAll, transactionID: 123123 };
  }

  async callApi3rd(): Promise<any> {
    try {
      // Call the external API
      const response = await axios.get(`${link_api}/info`, {
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
        timeout: 5000,
        // validateStatus: () => true,
      });
      console.log(response);

      if (!response) {
        throw new Error('Call api to process not found');
      }
      const queryAll = await this.speechRepository.find({ relations: ['files'] });
      console.log(queryAll);
      console.log(response.status);
      return response;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error fetching conversations: ', err.message);
      throw new InternalServerErrorException('Failed to fetch conversations');
    }
  }
}
