import { OmitType } from '@nestjs/swagger';
import { Rating } from '../entities';

export class CreateRatingDto extends OmitType(Rating, ['id']) {}
