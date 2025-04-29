import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteConversationDto {
  @IsString()
  @ApiProperty({ example: 'abc-123' })
  user: string;
}
