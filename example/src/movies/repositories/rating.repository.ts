import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database';
import { Rating } from '../entities';
import { CreateRatingDto } from '../dto';

@Injectable()
export class RatingRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async create(dto: CreateRatingDto): Promise<Rating> {
		return this.databaseService.rating.create({
			data: dto,
		});
	}
}
