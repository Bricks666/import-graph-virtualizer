import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesService } from '@/files';
import { RemovePhotosDto } from '../../dto';
import { Movie, MoviePhoto } from '../../entities';
import { MoviePhotosRepository } from '../../repositories';
import { MoviesService, SelectMovie } from '../movies';
import type { Express } from 'express';

@Injectable()
export class MoviePhotosService {
	constructor(
		private readonly moviesService: MoviesService,
		private readonly filesService: FilesService,
		private readonly moviePhotosRepository: MoviePhotosRepository
	) {}

	async addPhotos(
		params: SelectMovie,
		photos: Express.Multer.File[]
	): Promise<Movie> {
		// Test that movie exists
		await this.moviesService.getOne(params);
		const filesPaths = await Promise.all(
			photos.map((photo) => this.filesService.writeFile(photo))
		);

		await this.moviePhotosRepository.addPhotos({
			movieId: params.id,
			photos: filesPaths,
		});

		return this.moviesService.getOne(params);
	}

	async removePhotos(
		params: SelectMovie,
		dto: RemovePhotosDto
	): Promise<Movie> {
		// Test that movie exists
		const movie = await this.moviesService.getOne(params);
		const photosMap = movie.photos.reduce((acc, photo) => {
			acc[photo.id] = photo;
			return acc;
		}, {} as Record<number, MoviePhoto>);

		const removeRequests = dto.photosIds.map(async (id) => {
			const photo = photosMap[id];
			if (!photo) {
				throw new NotFoundException(
					`There is not photo with id ${id} in movie with id ${params.id}`
				);
			}

			await this.moviePhotosRepository.removePhoto({
				movieId: params.id,
				photoId: id,
			});
			await this.filesService.removeFile(
				this.filesService.toFileSystemPath(photo.path)
			);
		});

		await Promise.all(removeRequests);

		return this.moviesService.getOne(params);
	}
}
