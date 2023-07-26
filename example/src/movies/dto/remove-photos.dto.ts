import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class RemovePhotosDto {
	@ApiProperty({
		type: String,
		isArray: true,
		description: 'Id фотографий для удаления',
	})
	@IsMongoId({ each: true, })
	readonly photosIds: string[];
}
