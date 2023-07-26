import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from '@/shared';
import { MovieSortQueryDto } from './movie-sort-query.dto';

export class GetAllQueryDto extends IntersectionType(
	PaginationDto,
	MovieSortQueryDto
) {}
