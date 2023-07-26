import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SORT_ORDER, type ExtractValueType, type SortOrder } from '@/shared';

export const MOVIES_SORT_BY = {
	RATING: 'rating',
} as const;

export type MoviesSortBy = ExtractValueType<typeof MOVIES_SORT_BY>;

export class MovieSortQueryDto {
	@ApiProperty({
		description: '',
		enum: MOVIES_SORT_BY,
		required: false,
	})
	@IsEnum(MOVIES_SORT_BY)
	@IsOptional()
	declare sortBy?: MoviesSortBy;

	@ApiProperty({
		description: '',
		enum: SORT_ORDER,
		required: false,
	})
	@IsEnum(SORT_ORDER)
	@IsOptional()
	declare sortOrder?: SortOrder;
}
