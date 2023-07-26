import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth';
import {
	MoviePhotosService,
	MovieRatingService,
	MoviesService
} from './services';
import { MoviesController } from './movies.controller';
import {
	MoviePhotosRepository,
	MovieRepository,
	RatingRepository
} from './repositories';

@Module({
	controllers: [MoviesController],
	providers: [
		MoviesService,
		MoviePhotosService,
		MovieRatingService,
		MovieRepository,
		MoviePhotosRepository,
		RatingRepository
	],
	imports: [AuthModule],
})
export class MoviesModule {}
