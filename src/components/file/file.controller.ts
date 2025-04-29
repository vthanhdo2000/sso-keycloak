import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('multi-upload')
  @UseInterceptors(FilesInterceptor('file'))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    this.logger.log(`Received files: ${JSON.stringify(files)}`);

    if (!files || files.length === 0) {
      this.logger.error('No files received');
      throw new Error('No files received');
    }

    return this.fileService.handleFileMultiUpload(files);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('user') user: string) {
    return this.fileService.uploadFile(file, user);
  }
}
