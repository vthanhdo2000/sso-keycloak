import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AudioToTextDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  @IsNotEmpty()
  user: string;
}
