import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Put,
	HttpStatus,
	Query,
	UseInterceptors,
	UploadedFiles,
	Patch,
	FileTypeValidator,
	ParseFilePipe
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiConsumes,
	ApiNotFoundResponse,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser, RequiredAuth } from '@/auth';
import { SecurityUserDto } from '@/users';
import {
	AddPhotosDto,
	RemovePhotosDto,
	CreateMovieDto,
	UpdateMovieDto,
	RateMovieDto,
	GetAllQueryDto
} from './dto';
import {
	MoviePhotosService,
	MovieRatingService,
	MoviesService
} from './services';
import { Movie } from './entities';
import type { Express } from 'express';

@ApiTags('Фильмы')
@Controller('movies')
export class MoviesController {
	constructor(
		private readonly moviesService: MoviesService,
		private readonly moviePhotosService: MoviePhotosService,
		private readonly movieRatingService: MovieRatingService
	) {}

	@ApiOperation({
		summary: 'Вернуть все фильмы',
	})
	@ApiResponse({
		type: Movie,
		isArray: true,
		status: HttpStatus.OK,
		description: 'Фильмы',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@Get('/')
	getAll(@Query() query: GetAllQueryDto) {
		return this.moviesService.getAll(query);
	}

	@ApiOperation({
		summary: 'Получить один фильм',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.OK,
		description: 'Найденный фильм',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм не найден', })
	@Get('/:id')
	getOne(@Param('id') id: string) {
		return this.moviesService.getOne({ id, });
	}

	@ApiOperation({
		summary: 'Добавить фильм',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: CreateMovieDto,
		description: 'Данные для создание фильма',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.CREATED,
		description: 'Созданный фильм',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@RequiredAuth()
	@UseInterceptors(FilesInterceptor('photos'))
	@Post('/')
	create(
		@Body() dto: CreateMovieDto,
		@UploadedFiles(
			new ParseFilePipe({
				fileIsRequired: false,
				validators: [new FileTypeValidator({ fileType: 'image/*', })],
			})
		)
			photos: Express.Multer.File[]
	) {
		return this.moviesService.create(dto, photos);
	}

	@ApiOperation({
		summary: 'Изменить данные о фильме',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiBody({
		type: UpdateMovieDto,
		description: 'Новые данные фильма фильма',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.OK,
		description: 'Обновленный фильм',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм не найден', })
	@RequiredAuth()
	@Put('/:id')
	update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
		return this.moviesService.update({ id, }, dto);
	}

	@ApiOperation({
		summary: 'Добавление фото к фильму',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: AddPhotosDto,
		description: 'Новые данные фильма фильма',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.OK,
		description: 'Обновленные данные фильма',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм не найден', })
	@RequiredAuth()
	@UseInterceptors(FilesInterceptor('photos'))
	@Patch('/:id/photos/add')
	addPhotos(
		@UploadedFiles(
			new ParseFilePipe({
				fileIsRequired: true,
				validators: [new FileTypeValidator({ fileType: 'image/*', })],
			})
		)
			photos: Express.Multer.File[],
		@Param('id') id: string
	) {
		return this.moviePhotosService.addPhotos({ id, }, photos);
	}

	@ApiOperation({
		summary: 'Удаление фотографий',
	})
	@ApiBody({
		type: RemovePhotosDto,
		description: 'Данные для удаления',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.OK,
		description: 'Обновленные данные фильма',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм или фото не найдены', })
	@RequiredAuth()
	@Patch('/:id/photos/remove')
	removePhotos(@Param('id') id: string, @Body() dto: RemovePhotosDto) {
		return this.moviePhotosService.removePhotos({ id, }, dto);
	}

	@ApiOperation({
		summary: 'Выставление оценки',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiBody({
		type: RateMovieDto,
		description: 'Данные для оценки',
	})
	@ApiResponse({
		type: Movie,
		status: HttpStatus.OK,
		description: 'Обновленные данные фильма',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм не найден', })
	@ApiConflictResponse({
		description: 'Пользователь уже оставил оценку для этого фильма',
	})
	@RequiredAuth()
	@Patch('/:id/rate')
	async rateMovie(
		@Param('id') id: string,
		@CurrentUser() user: SecurityUserDto,
		@Body() dto: RateMovieDto
	) {
		return this.movieRatingService.rate(
			{ id, },
			{
				mark: dto.mark,
				userId: user.id,
			}
		);
	}

	@ApiOperation({
		summary: 'Изменить данные о фильме',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'Id фильма',
	})
	@ApiResponse({
		type: Boolean,
		status: HttpStatus.OK,
		description: 'Удачно ли прошло удаление',
	})
	@ApiBadRequestResponse({ description: 'Неправильные параметры запроса', })
	@ApiNotFoundResponse({ description: 'Фильм не найден', })
	@RequiredAuth()
	@Delete('/:id')
	remove(@Param('id') id: string) {
		return this.moviesService.remove({ id, });
	}
}
