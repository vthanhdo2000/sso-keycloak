import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetMessagesQueryDto {
  @IsString()
  @ApiProperty({ example: '404ad678-b63c-4576-9a40-1d346e2fddc1' })
  conversation_id: string;

  @IsString()
  @ApiProperty({ example: 'abc-123' })
  user: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '',
  })
  first_id?: string;

  @ApiProperty({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
