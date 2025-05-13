import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FileEntity } from '../file/entities/file.entity';
import { FileService } from '../file/file.service';
import { SpeechEntity } from '../speech/entities/speech.entity';
import { SpeechService } from '../speech/speech.service';

@Injectable()
export class BackofficeService {
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
}
