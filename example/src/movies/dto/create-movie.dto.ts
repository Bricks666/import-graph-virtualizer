import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Movie } from '../entities';
import type { Express } from 'express';

export class CreateMovieDto extends OmitType(Movie, [
	'id',
	'rating',
	'photos'
]) {
	@ApiProperty({
		type: String,
		format: 'binary',
		isArray: true,
		description: 'Файлы фотографий',
		required: false,
	})
	@IsOptional()
	declare photos?: Express.Multer.File[];
}
