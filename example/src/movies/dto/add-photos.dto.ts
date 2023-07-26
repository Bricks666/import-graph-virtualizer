import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import type { Express } from 'express';

export class AddPhotosDto {
	@ApiProperty({
		type: String,
		format: 'binary',
		isArray: true,
		description: 'Файлы, которые нужно добавить',
	})
	@IsArray()
	declare photos: Express.Multer.File[];
}
