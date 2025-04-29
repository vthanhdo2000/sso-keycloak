import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class TextToAudioDto {
  @ApiProperty({ example: '5ad4cb98-f0c7-4085-b384-88c403be6290' })
  @IsString()
  @IsOptional()
  message_id?: string;

  @ApiProperty({ example: 'Hello Ryan' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 'abc-123' })
  @IsString()
  user: string;
}
