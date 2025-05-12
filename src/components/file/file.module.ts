import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEntity } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), HttpModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [TypeOrmModule, FileService],
})
export class FileModule {}
