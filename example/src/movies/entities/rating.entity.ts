import { ApiProperty } from '@nestjs/swagger';
import { Rating as RatingModel } from '@prisma/client';
import { IsMongoId, IsNumber, Max, Min } from 'class-validator';

export class Rating implements RatingModel {
	@ApiProperty({
		type: Number,
		description: 'ID пользователя',
	})
	@IsMongoId()
	declare id: string;

	@ApiProperty({
		type: Number,
		description: 'ID пользователя',
	})
	@IsMongoId()
	declare userId: string;

	@ApiProperty({
		type: Number,
		description: 'ID фильма',
	})
	@IsMongoId()
	declare movieId: string;

	@ApiProperty({
		type: Number,
		description: 'Оценка',
	})
	@IsNumber()
	@Min(1)
	@Max(10)
	declare mark: number;
}
