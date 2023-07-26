import type { Request } from 'express';

export const extractAccessToken = (req: Request): string[] | null => {
	const header = req.headers.authorization;

	return header?.split(' ') ?? null;
};
