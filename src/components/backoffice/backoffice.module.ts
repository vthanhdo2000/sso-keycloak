import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';
import { FileEntity } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';
import { SpeechEntity } from '../speech/entities/speech.entity';
import { SpeechModule } from '../speech/speech.module';

@Module({
  imports: [TypeOrmModule.forFeature([SpeechEntity, FileEntity]), FileModule, SpeechModule],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
