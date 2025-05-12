import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpeechEntity } from './entities/speech.entity';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpeechEntity])],
  controllers: [SpeechController],
  providers: [SpeechService],
  exports: [TypeOrmModule, SpeechService],
})
export class SpeechModule {}
