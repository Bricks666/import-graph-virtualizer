import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends OmitType(PartialType(CreateMovieDto), [
	'photos'
]) {}
