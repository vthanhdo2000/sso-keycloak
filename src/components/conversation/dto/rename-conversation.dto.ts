import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class RenameConversationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '' })
  name?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  auto_generate?: boolean;

  @IsString()
  @ApiProperty({ example: 'abc-123' })
  user: string;
}
