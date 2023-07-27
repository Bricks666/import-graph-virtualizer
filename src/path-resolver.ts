/* eslint-disable no-underscore-dangle */
import { extname, resolve } from 'node:path';
import { access, readdir } from 'node:fs/promises';
import { preparePattern } from './patterns';
import { ConfigManager, configManager } from './config-manage';

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
const MULTIPLE_SLASH_PATTERN = /\/+/g;
const PACKAGE_PATTERN = /^[@\w\d]+/;

export class PathResolver {
	private _targetPath: string;

	private _aliases: AliasesMap;

	private _configManager: ConfigManager;

	static isPackage(path: string): boolean {
		return PACKAGE_PATTERN.test(path);
	}

	private static _prepareAliases(aliases: RawAliases): AliasesMap {
		const pairs = Object.entries(aliases);
		const preparedAliases = new Map();
		pairs.forEach(([key, value]) => {
			preparedAliases.set(preparePattern(key), value);
		});

		return preparedAliases;
	}

	constructor(configManager: ConfigManager) {
		this._configManager = configManager;
	}

	configure({ targetPath, aliases = {} }: PathResolveParams) {
		this._targetPath = resolve(process.cwd(), targetPath);
		this._aliases = PathResolver._prepareAliases(aliases);
	}

	resolve(params: ResolveParams): ResolvedPath {
		const fullPath = this._resolveFullPath(params);

		return {
			fullPath,
			relativePath: this._toRelativePath(fullPath),
		};
	}

	isInternalPath(fullPath: string): boolean {
		return fullPath.includes(this._targetPath);
	}

	async resolveIndexFile(fullPath: string): Promise<string> {
		const extensions = this._configManager.supportedExtensions;
		const files = await readdir(fullPath);

		const indexFile = files.find((file) => file.includes('index'));

		const relativePath = this._toRelativePath(fullPath);

		if (!indexFile) {
			return relativePath;
		}

		const indexExtension = extname(indexFile);

		if (!extensions.includes(indexExtension as any)) {
			return relativePath;
		}

		return this.resolve({ path: indexFile, parentPath: relativePath })
			.relativePath;
	}

	async resolveFileExtension(fullPath: string): Promise<string> {
		const extensions = this._configManager.supportedExtensions;

		const relativePath = this._toRelativePath(fullPath);

		if (extensions.includes(extname(relativePath))) {
			return relativePath;
		}

		const resolved = await Promise.allSettled(
			extensions.map((extension) => access(fullPath + extension))
		);

		const resolvedExtensionIndex = resolved.findIndex(
			(resolved) => resolved.status === 'fulfilled'
		);

		if (resolvedExtensionIndex === -1) {
			return relativePath;
		}

		return relativePath + extensions[resolvedExtensionIndex];
	}

	resolveAliases(path: string): string {
		const pair = Array.from(this._aliases).find(([alias]) => alias.test(path));

		if (!pair) {
			return path;
		}

		const match = path.match(pair[0]);

		return path.replace(pair[0], pair[1] + match[1]);
	}

	private _resolveFullPath(params: ResolveParams): string {
		return resolve(
			this._targetPath,
			params.parentPath ?? CURRENT_DIR,
			params.path
		);
	}

	private _toRelativePath(fullPath: string): string {
		return fullPath
			.replace(this._targetPath, CURRENT_DIR)
			.replace(MULTIPLE_SLASH_PATTERN, '/');
	}
}

export const pathResolver = new PathResolver(configManager);
