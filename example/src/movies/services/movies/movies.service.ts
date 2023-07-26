import { Injectable, NotFoundException } from '@nestjs/common';
import { normalizePagination } from '@/shared';
import { FilesService } from '@/files';
import { CreateMovieDto, GetAllQueryDto, UpdateMovieDto } from '../../dto';
import { MovieRepository } from '../../repositories';
import { Movie } from '../../entities';
import type { Express } from 'express';
import type { SelectMovie } from './types';

@Injectable()
export class MoviesService {
	constructor(
		private readonly movieRepository: MovieRepository,
		private readonly filesService: FilesService
	) {}

	async getAll(query: GetAllQueryDto): Promise<Movie[]> {
		const { sortBy, sortOrder, ...pagination } = query;
		const normalizedPagination = normalizePagination(pagination, {
			count: 10,
			page: 1,
		});
		return this.movieRepository.getAll(normalizedPagination, {
			sortBy,
			sortOrder,
		});
	}

	async getOne(params: SelectMovie): Promise<Movie> {
		const movie = await this.movieRepository.getOne(params);

		if (!movie) {
			throw new NotFoundException(`Movie with id ${params.id} not found`);
		}

		return movie;
	}

	async create(
		dto: CreateMovieDto,
		photos: Express.Multer.File[]
	): Promise<Movie> {
		const filesPaths = await Promise.all(
			photos.map((photo) => this.filesService.writeFile(photo))
		);
		const movie = await this.movieRepository.create({
			...dto,
			photos: filesPaths,
		});
		return this.getOne({ id: movie.id, });
	}

	async update(params: SelectMovie, dto: UpdateMovieDto): Promise<Movie> {
		const movie = await this.movieRepository.update({ ...dto, ...params, });

		if (!movie) {
			throw new NotFoundException(`Movie with id ${params.id} not found`);
		}

		return this.getOne({ id: movie.id, });
	}

	async remove(params: SelectMovie): Promise<boolean> {
		const removed = await this.movieRepository.remove(params);

		if (!removed) {
			throw new NotFoundException(`Movie with id ${params.id} not found`);
		}

		return removed;
	}
}
