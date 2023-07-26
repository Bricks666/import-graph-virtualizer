import type { CookieOptions } from 'express';

export const COOKIE_TIME: number = 30 * 24 * 60 * 60 * 1000;

export const BASE_COOKIE_CONFIG: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'none',
	maxAge: COOKIE_TIME,
};
