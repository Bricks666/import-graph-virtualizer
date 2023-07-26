import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
	@ApiProperty({
		type: Number,
		description: 'Номер страницы',
		default: 1,
		required: false,
	})
	declare page?: number;

	@ApiProperty({
		type: Number,
		description: 'Количество записей на странице',
		default: 10,
		required: false,
	})
	declare count?: number;
}

export interface NormalizedPagination {
	readonly limit: number;
	readonly offset: number;
}

export const normalizePagination = (
	base: PaginationDto,
	defaultValue: Required<PaginationDto>
): NormalizedPagination => {
	const page = base.page ?? defaultValue.page;
	const count = base.count ?? defaultValue.count;

	return {
		limit: Number(count),
		offset: (page - 1) * count,
	};
};
