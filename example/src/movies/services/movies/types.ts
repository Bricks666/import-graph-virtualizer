import { CreateMovieDto } from '../../dto';

export interface SelectMovie {
	readonly id: string;
}

export interface CreateMovie extends Omit<CreateMovieDto, 'photos'> {
	readonly photos?: string[];
}
