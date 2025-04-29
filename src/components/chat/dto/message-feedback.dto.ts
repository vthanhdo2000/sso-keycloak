import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { RatingEnum } from '../constants/rating.enum';

export class MessageFeedbackDto {
  @IsIn([RatingEnum.LIKE, RatingEnum.DISLIKE, RatingEnum.NULL], {
    message: 'Rating must be either "like", "dislike", or null',
  })
  @ApiProperty({ example: RatingEnum.LIKE })
  rating: RatingEnum.LIKE | RatingEnum.DISLIKE | RatingEnum.NULL;

  @ApiProperty({ example: 'abc-123' })
  @IsString()
  user: string;

  @ApiProperty({ example: 'message feedback information' })
  @IsString()
  @IsOptional()
  content?: string;
}
