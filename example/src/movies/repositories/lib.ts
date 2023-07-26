import { Prisma } from '@prisma/client';
import { SORT_ORDER_VALUE, WithObjectId, normalizeMongoModel } from '@/shared';
import { Movie, MoviePhoto } from '../entities';
import { MovieSortQueryDto } from '../dto';

export interface RawMovie extends WithObjectId {
	readonly title: string;
	readonly description: string;
	readonly photos: RawMoviePhoto[];
	readonly rating?: number;
}

export interface RawMoviePhoto extends WithObjectId {
	readonly path: string;
}

export const normalizeMovie = (movie: RawMovie): Movie => {
	return {
		...normalizeMongoModel(movie),
		rating: movie.rating ? Number(movie.rating) : null,
		photos: movie.photos.map(normalizePhoto),
	};
};

export const normalizePhoto = (photo: RawMoviePhoto): MoviePhoto => {
	return normalizeMongoModel(photo);
};

export const resolveMovieSort = (
	sort: MovieSortQueryDto
): Prisma.InputJsonValue | undefined => {
	if (!sort.sortBy) {
		return;
	}

	const order = (sort.sortOrder ?? 'asc').toUpperCase();

	return {
		$sort: {
			[sort.sortBy]: SORT_ORDER_VALUE[order],
		},
	};
};
