import { PickType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';

export class RateMovieDto extends PickType(CreateRatingDto, ['mark']) {}
