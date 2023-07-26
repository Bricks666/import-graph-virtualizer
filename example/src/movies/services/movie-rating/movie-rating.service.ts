import { ConflictException, Injectable } from '@nestjs/common';
import { RatingRepository } from '../../repositories';
import { MoviesService, SelectMovie } from '../movies';
import type { RateMovie } from './types';

@Injectable()
export class MovieRatingService {
	constructor(
		private readonly moviesService: MoviesService,
		private readonly ratingRepository: RatingRepository
	) {}

	async rate(params: SelectMovie, dto: RateMovie) {
		try {
			// Test that movie exists
			await this.moviesService.getOne(params);

			await this.ratingRepository.create({
				...dto,
				movieId: params.id,
			});
		} catch (error) {
			throw new ConflictException('You have already marked this movie', {
				cause: error,
			});
		}

		return this.moviesService.getOne(params);
	}
}
