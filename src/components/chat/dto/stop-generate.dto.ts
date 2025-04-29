import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StopGenerateDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  user: string;
}
