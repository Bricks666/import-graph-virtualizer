import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class TokensDto {
	@ApiProperty({
		type: String,
		description: 'Токен обновления',
	})
	@IsJWT()
	declare refreshToken: string;

	@ApiProperty({
		type: String,
		description: 'Токен доступа',
	})
	@IsJWT()
	declare accessToken: string;
}
