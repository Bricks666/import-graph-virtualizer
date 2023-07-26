import { RateMovieDto } from '../../dto';

export interface RateMovie extends RateMovieDto {
	readonly userId: string;
}
