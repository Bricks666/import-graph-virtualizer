import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database';
import { AddPhotos, RemovePhoto, SelectMoviePhoto } from '../types';
import { MoviePhoto } from '../entities';

@Injectable()
export class MoviePhotosRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getAllByMovie(params: SelectMoviePhoto): Promise<MoviePhoto[]> {
		return this.databaseService.moviePhotos.findMany({
			where: {
				movieId: params.movieId,
			},
			select: moviePhotoSelect,
		});
	}

	async addPhotos(dto: AddPhotos): Promise<boolean> {
		const { count, } = await this.databaseService.moviePhotos.createMany({
			data: dto.photos.map((photo) => ({
				path: photo,
				movieId: dto.movieId,
			})),
		});
		return !!count;
	}

	async removePhoto(dto: RemovePhoto): Promise<boolean> {
		return this.databaseService.moviePhotos
			.delete({
				where: {
					id: dto.photoId,
				},
				select: moviePhotoSelect,
			})
			.then(() => true)
			.catch(() => false);
	}
}

const moviePhotoSelect = {
	id: true,
	path: true,
};
