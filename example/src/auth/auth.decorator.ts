import { UseGuards, applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

export const RequiredAuth = () => {
	return applyDecorators(
		ApiBearerAuth(),
		ApiUnauthorizedResponse({
			description: 'Токен отсутствует или он невалидный',
		}),
		ApiBadRequestResponse({
			description: 'Неправильный тип токена',
		}),
		UseGuards(AuthGuard)
	);
};
