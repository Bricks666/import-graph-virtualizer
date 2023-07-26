import { CreateMovieDto, RateMovieDto, RemovePhotosDto } from './dto';

export interface SelectMovie {
	readonly id: string;
}

export interface SelectMoviePhoto {
	readonly movieId: string;
}

export interface CreateMovie extends Omit<CreateMovieDto, 'photos'> {
	readonly photos?: string[];
}

export interface AddPhotos {
	readonly movieId: string;
	readonly photos: string[];
}

export interface RemovePhotos extends RemovePhotosDto {
	readonly movieId: string;
}

export interface RateMovie extends RateMovieDto {
	readonly userId: string;
}

export interface RemovePhoto {
	readonly movieId: string;
	readonly photoId: string;
}
