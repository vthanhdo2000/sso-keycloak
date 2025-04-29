import { extname } from 'path';

import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';

import { AudioToTextDto } from './dto/audio-to-text.dto';
import { TextToAudioDto } from './dto/text-to-audio.dto';
import { SpeechService } from './speech.service';

@Controller()
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('/audio-to-text')
  @ApiOperation({ summary: 'Convert audio to text' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        user: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Output text', type: String })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'audio/mp3',
          'audio/mp4',
          'audio/mpeg',
          'audio/mpga',
          'audio/m4a',
          'audio/wav',
          'audio/webm',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file format'), false);
        }
      },
    }),
  )
  async convertAudioToText(
    @UploadedFile() file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto,
  ) {
    if (!file) {
      throw new Error('File is required and must be a supported audio format');
    }
    return this.speechService.convertAudio(file, audioToTextDto.user);
  }

  @Post('text-to-audio')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({ status: 200, description: 'Audio file', content: { 'audio/wav': {} } })
  async convertTextToAudio(@Body() textToAudioDto: TextToAudioDto, @Res() res: Response) {
    const audioBuffer = await this.speechService.convertTextToAudio(textToAudioDto);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="text-to-audio.wav"');
    res.send(audioBuffer);
  }
}
