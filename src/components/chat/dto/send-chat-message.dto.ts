import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class FileDto {
  @IsString()
  type: string;

  @IsString()
  transfer_method: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  upload_file_id?: string;
}

export class SendChatMessageDto {
  @ApiProperty({ example: 'What are the specs of the iPhone 13 Pro Max?' })
  @IsString()
  query: string;

  @ApiProperty({ example: { device_type: 'mobile' } })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  inputs?: Record<string, any>;

  @ApiProperty({ example: 'streaming' })
  @IsString()
  @IsNotEmpty()
  response_mode: string;

  @ApiProperty({ example: 'abc-123' })
  @IsString()
  user: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  conversation_id?: string;

  @ApiProperty({
    example: [
      {
        type: 'image',
        transfer_method: 'remote_url',
        url: 'https://cloud.dify.ai/logo/logo-site.png',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  files?: FileDto[];

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  auto_generate_name?: boolean;
}
