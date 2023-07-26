import { ApiProperty } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';
import { IsMongoId, IsString, Length } from 'class-validator';

export class User implements UserModel {
	@ApiProperty({
		type: Number,
		description: 'Идентификатор пользователя',
	})
	@IsMongoId()
	declare id: string;

	@ApiProperty({
		type: String,
		description: 'Логин пользователя',
	})
	@IsString()
	@Length(2)
	declare login: string;

	@ApiProperty({
		type: String,
		description: 'Пароль пользователя',
	})
	@IsString()
	@Length(2)
	declare password: string;
}
