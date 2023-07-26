import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '@/database';
import { NormalizedPagination } from '@/shared';
import { MovieSortQueryDto, UpdateMovieDto } from '../dto';
import { Movie } from '../entities';
import { CreateMovie, SelectMovie } from '../types';
import { RawMovie, normalizeMovie, resolveMovieSort } from './lib';

@Injectable()
export class MovieRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getAll(
		pagination: NormalizedPagination,
		sort: MovieSortQueryDto
	): Promise<Movie[]> {
		const pipeline: Prisma.InputJsonValue[] = [...moviePipeline];
		const sortPipe = resolveMovieSort(sort);
		if (sortPipe) {
			pipeline.push(sortPipe);
		}
		pipeline.push(
			{
				$skip: pagination.offset,
			},
			{
				$limit: pagination.limit,
			}
		);
		const raw = (await this.databaseService.movie.aggregateRaw({
			pipeline,
		})) as unknown as RawMovie[];
		return raw.map(normalizeMovie);
	}

	async getOne(params: SelectMovie): Promise<Movie | null> {
		const raw = await this.databaseService.movie
			.aggregateRaw({
				pipeline: [
					{
						// OMG It's work. Only this way
						// I found answer here https://github.com/prisma/prisma/issues/15013#issuecomment-1381397966
						$match: {
							_id: { $oid: params.id, },
						},
					},
					...moviePipeline
				],
			})
			.then((value) => (value[0] as unknown as RawMovie | undefined) ?? null);
		return raw ? normalizeMovie(raw) : null;
	}

	async create(params: CreateMovie): Promise<Movie> {
		const { photos, ...rest } = params;
		let createMany;
		if (photos.length) {
			createMany = {
				data: photos.map((photo) => ({ path: photo, })),
			};
		}
		const movie = await this.databaseService.movie.create({
			data: {
				...rest,
				photos: {
					createMany,
				},
			},
			select: {
				id: true,
			},
		});

		// Need for correct shape return
		return this.getOne({ id: movie.id, });
	}

	async update(params: SelectMovie & UpdateMovieDto): Promise<Movie | null> {
		const { id, ...rest } = params;
		const movie = await this.databaseService.movie
			.update({
				data: rest,
				where: {
					id,
				},
				select: {
					id: true,
				},
			})
			.catch(() => null);

		// Need for correct shape return
		return this.getOne({ id: movie.id, });
	}

	async remove(params: SelectMovie): Promise<boolean> {
		return this.databaseService.movie
			.delete({
				where: {
					id: params.id,
				},
			})
			.then(() => true)
			.catch(() => false);
	}
}

const moviePipeline = [
	{
		$lookup: {
			from: Prisma.ModelName.Rating,
			localField: '_id',
			foreignField: Prisma.RatingScalarFieldEnum.movieId,
			as: 'ratings',
			pipeline: [
				{
					$group: {
						_id: '$movieId',
						rating: { $avg: '$mark', },
					},
				},
				{
					$project: {
						_id: false,
						rating: true,
					},
				}
			],
		},
	},
	{
		$lookup: {
			from: Prisma.ModelName.MoviePhotos,
			localField: '_id',
			foreignField: Prisma.MoviePhotosScalarFieldEnum.movieId,
			as: 'photos',
			pipeline: [
				{
					$project: {
						_id: true,
						path: true,
					},
				}
			],
		},
	},
	{
		$replaceRoot: {
			newRoot: {
				$mergeObjects: [{ $arrayElemAt: ['$ratings', 0], }, '$$ROOT'],
			},
		},
	},
	{
		$project: {
			_id: true,
			title: true,
			description: true,
			rating: true,
			photos: true,
		},
	}
];
