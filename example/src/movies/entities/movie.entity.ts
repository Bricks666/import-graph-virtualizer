import { ApiProperty } from '@nestjs/swagger';
import { Movie as MovieModel } from '@prisma/client';
import {
	IsArray,
	IsMongoId,
	IsNumber,
	IsString,
	Max,
	Min,
	MinLength
} from 'class-validator';
import { MoviePhoto } from './movie-photo.entity';

export class Movie implements MovieModel {
	@ApiProperty({
		type: Number,
		description: 'ID фильма',
	})
	@IsMongoId()
	declare id: string;

	@ApiProperty({
		type: String,
		description: 'Название фильма',
	})
	@IsString()
	@MinLength(2)
	declare title: string;

	@ApiProperty({
		type: String,
		description: 'Описание фильма',
	})
	@MinLength(2)
	declare description: string;

	@ApiProperty({
		type: Number,
		nullable: true,
		description: 'Рейтинг фильма',
	})
	@IsNumber()
	@Min(1)
	@Max(10)
	declare rating: number | null;

	@ApiProperty({
		type: MoviePhoto,
		isArray: true,
		description: 'Фотографии фильма',
	})
	@IsArray()
	declare photos: MoviePhoto[];
}
