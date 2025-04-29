import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class GetConversationsQueryDto {
  @IsString()
  @ApiProperty({ example: 'abc-123' })
  user: string;

  @IsString()
  @IsOptional()
  last_id?: string; // ID of the last record on the current page

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({ example: 20 })
  limit?: number;

  @IsOptional()
  @IsIn(['created_at', '-created_at', 'updated_at', '-updated_at'], {
    message: 'sort_by must be one of: created_at, -created_at, updated_at, -updated_at',
  })
  @ApiProperty({ example: '-updated_at' })
  sort_by?: string;
}
