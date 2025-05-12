import { extname } from 'path';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'src/config/config';
import { Repository } from 'typeorm';

import { FileEntity } from './entities/file.entity';
const { api_key, link_api } = config;

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async handleFileMultiUpload(files: Array<Express.Multer.File>) {
    return {
      message: 'Files uploaded successfully',
      files: files.map((file) => ({
        id: file.filename,
        name: file.originalname,
        size: file.size,
        extension: extname(file.originalname),
        mime_type: file.mimetype,
        created_by: 'user-id-placeholder',
        created_at: Date.now(),
      })),
    };
  }

  async uploadFile(file: Express.Multer.File, user: string) {
    try {
      const formData = new FormData();

      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      if (typeof user !== 'string') {
        throw new Error('User must be a string');
      }

      formData.append('user', user.toString());

      const response = await axios.post(`${link_api}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          ...formData.getHeaders(), // Include form-data headers
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
