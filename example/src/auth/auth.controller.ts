import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpStatus,
	Post,
	Res
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { BASE_COOKIE_CONFIG, COOKIE_NAME, Cookie } from '@/shared';
import { CreateUserDto, SecurityUserDto } from '@/users';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto, TokensDto } from './dto';
import type { Response } from 'express';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'Авторизация пользователя по токену обновления',
	})
	@ApiCookieAuth(COOKIE_NAME)
	@ApiResponse({
		type: AuthResponseDto,
		description: 'Пользователь и токен',
		status: HttpStatus.OK,
	})
	@ApiForbiddenResponse({
		description: 'Токен обновления отсутствует',
	})
	@ApiUnauthorizedResponse({
		description: 'Невалидный токен',
	})
	@ApiNotFoundResponse({
		description: 'Пользователь из токена не существует',
	})
	@Get('/')
	async auth(
		@Cookie(COOKIE_NAME) token: string | null,
		@Res({ passthrough: true, }) res: Response
	): Promise<AuthResponseDto> {
		if (!token) {
			throw new ForbiddenException('Token is null');
		}

		const response = await this.authService.auth({ token, });

		res.cookie(COOKIE_NAME, response.tokens.refreshToken, BASE_COOKIE_CONFIG);

		return response;
	}

	@ApiOperation({
		summary: 'Вход в аккаунт',
	})
	@ApiBody({
		type: LoginDto,
		description: 'Данные для входа',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: AuthResponseDto,
		description: 'Пользователь и токен',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({
		description: 'Пользователя с таким логином не существует',
	})
	@ApiUnauthorizedResponse({
		description: 'Неверный пароль',
	})
	@Post('/login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true, }) res: Response
	): Promise<AuthResponseDto> {
		const response = await this.authService.login(dto);

		res.cookie(COOKIE_NAME, response.tokens.refreshToken, BASE_COOKIE_CONFIG);
		res.status(HttpStatus.OK);

		return response;
	}

	@ApiOperation({
		summary: 'Регистрация нового пользователя',
	})
	@ApiBody({
		type: CreateUserDto,
		description: 'Данные нового пользователя',
	})
	@ApiResponse({
		type: SecurityUserDto,
		description: 'Добавленный пользователь',
		status: HttpStatus.CREATED,
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiConflictResponse({
		description: 'Пользователь с таким логином уже зарегистрирован',
	})
	@Post('/registration')
	async registration(@Body() dto: CreateUserDto): Promise<SecurityUserDto> {
		return this.authService.registration(dto);
	}

	@ApiOperation({
		summary: 'Выход из аккаунта',
	})
	@ApiCookieAuth(COOKIE_NAME)
	@ApiResponse({
		type: Boolean,
		status: HttpStatus.OK,
		description: 'Успешно ли произошел выход из аккаунта',
	})
	@Delete('/logout')
	async logout(@Res({ passthrough: true, }) res: Response): Promise<boolean> {
		res.clearCookie(COOKIE_NAME);
		return true;
	}

	@ApiOperation({
		summary: 'Обновление токенов',
	})
	@ApiCookieAuth(COOKIE_NAME)
	@ApiResponse({
		type: TokensDto,
		description: 'Обновленные токены',
		status: HttpStatus.OK,
	})
	@ApiForbiddenResponse({
		description: 'Отсутствует токен или он невалидный',
	})
	@Get('/refresh')
	async refresh(
		@Cookie(COOKIE_NAME) token: string | null,
		@Res({ passthrough: true, }) res: Response
	): Promise<TokensDto> {
		if (!token) {
			throw new ForbiddenException('Token is null');
		}

		const tokens = await this.authService.refresh({ token, });
		res.cookie(COOKIE_NAME, tokens.refreshToken, BASE_COOKIE_CONFIG);
		return tokens;
	}
}
