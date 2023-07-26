import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator<unknown, ExecutionContext>(
	(_, context) => {
		const req: Request = context.switchToHttp().getRequest();

		return (req as any).user ?? null;
	}
);
