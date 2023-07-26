/* eslint-disable no-underscore-dangle */
import { resolve } from 'node:path';
import { preparePattern } from './patterns';

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
	readonly aliases?: RawAliases;
}

type RawAliases = Record<string, string>;
type AliasesMap = Map<RegExp, string>;

const CURRENT_DIR = './';

export class PathResolver {
	private _targetPath: string;

	private _aliases: AliasesMap;

	private static _prepareAliases(aliases: RawAliases): AliasesMap {
		const pairs = Object.entries(aliases);
		const preparedAliases = new Map();
		pairs.forEach(([key, value]) => {
			preparedAliases.set(preparePattern(key), value);
		});

		return preparedAliases;
	}

	configure({ targetPath, aliases = {} }: PathResolveParams) {
		this._targetPath = resolve(process.cwd(), targetPath);
		this._aliases = PathResolver._prepareAliases(aliases);
	}

	resolve(params: ResolveParams): ResolvedPath {
		const fullPath = resolve(
			this._targetPath,
			params.parentPath ?? CURRENT_DIR,
			params.path
		);

		return {
			fullPath,
			relativePath: fullPath
				.replace(this._targetPath, CURRENT_DIR)
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

export const pathResolver = new PathResolver();
