import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { extractAccessToken } from './lib';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: Request = context.switchToHttp().getRequest();

		const tokenPair = extractAccessToken(req);
		if (!tokenPair) {
			throw new UnauthorizedException('There is not token');
		}

		const [tokenType, token] = tokenPair;

		if (tokenType !== 'Bearer') {
			throw new BadRequestException('Invalid token type');
		}

		const authUser = await this.authService.extractUser({ token, });

		(req as any).user = authUser;

		return true;
	}
}
