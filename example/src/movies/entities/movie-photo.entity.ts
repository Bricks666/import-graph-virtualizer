import { ApiProperty } from '@nestjs/swagger';
import { MoviePhotos } from '@prisma/client';
import { IsMongoId, IsString, MinLength } from 'class-validator';

export class MoviePhoto implements Omit<MoviePhotos, 'movieId'> {
	@ApiProperty({
		type: Number,
		description: 'ID привязки фото к фильму',
	})
	@IsMongoId()
	declare id: string;

	@ApiProperty({
		type: String,
		description: 'Путь для получения изображения с клиента',
	})
	@IsString()
	@MinLength(2)
	declare path: string;
}
