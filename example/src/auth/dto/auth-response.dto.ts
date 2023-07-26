import { ApiProperty } from '@nestjs/swagger';
import { SecurityUserDto } from '@/users';
import { TokensDto } from './tokens.dto';

export class AuthResponseDto {
	@ApiProperty({
		type: SecurityUserDto,
		description: 'Авторизованный пользователь',
	})
	declare user: SecurityUserDto;

	@ApiProperty({
		type: TokensDto,
		description: 'Токены пользователя',
	})
	declare tokens: TokensDto;
}
