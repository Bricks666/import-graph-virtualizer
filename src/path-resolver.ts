/* eslint-disable no-underscore-dangle */
import { resolve } from 'node:path';

export interface ResolveParams {
	readonly path: string;
	readonly parentPath?: string;
}

export interface ResolvedPath {
	/**
	 * Absolute path from root of file system
	 */
	readonly fullPath: string;
	/**
	 * Relative path take beginning from process
	 */
	readonly relativePath: string;
}

export interface PathResolveParams {
	readonly targetPath: string;
	readonly aliases?: Record<string, string>;
}

export class PathResolver {
	private _targetPath: string;
	private _aliases: Map<RegExp, string>;

	private static _prepareAliases(
		aliases: Record<string, string>
	): Map<RegExp, string> {
		const pairs = Object.entries(aliases);
		const preparedAliases = new Map();
		pairs.forEach(([key, value]) => {
			const regExp = new RegExp(key.replaceAll('*', '(.*)'));

			preparedAliases.set(regExp, value);
		});

		return preparedAliases;
	}

	constructor({ targetPath, aliases = {} }: PathResolveParams) {
		this._targetPath = resolve(process.cwd(), targetPath);
		this._aliases = PathResolver._prepareAliases(aliases);
	}

	resolve(params: ResolveParams): ResolvedPath {
		const fullPath = resolve(
			this._targetPath,
			params.parentPath ?? '.',
			params.path
		);

		return {
			fullPath,
			relativePath: fullPath
				.replace(this._targetPath, './')
				.replace(/\/+/g, '/'),
		};
	}

	resolveAliases(path: string): string {
		const pair = Array.from(this._aliases).find(([alias]) => alias.test(path));

		if (!pair) {
			return path;
		}

		const match = path.match(pair[0]);

		return path.replace(pair[0], pair[1] + match[1]);
	}
}
