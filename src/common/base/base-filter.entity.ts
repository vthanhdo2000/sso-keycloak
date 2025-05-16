import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { SortTypes, SortTypesEnum } from '../constants/sort-types.enum';

export class BaseFilter {
  @ApiPropertyOptional({ default: '1', description: 'default = 1' })
  @Transform(({ value }) => {
    value = +value;
    return value >= 1 ? value : 1;
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: '10', description: 'default = 10' })
  @Transform(({ value }) => {
    value = +value;
    return value >= 10 ? value : 10;
  })
  @IsNumber()
  @IsOptional()
  @Min(10)
  size?: number = 10;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string = '';

  @ApiPropertyOptional({
    enum: SortTypesEnum,
    enumName: 'SortTypesEnum',
    default: SortTypesEnum.DESC,
  })
  @Transform(({ value }) => value?.trim())
  @Transform(({ value }) => {
    if (Object.values(SortTypesEnum).includes(value.toUpperCase())) {
      return value.toUpperCase();
    }
    return SortTypesEnum.DESC;
  })
  @IsString()
  @IsOptional()
  @IsEnum(SortTypesEnum)
  sortType?: SortTypes = SortTypesEnum.DESC;
}
