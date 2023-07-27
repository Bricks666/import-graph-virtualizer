import { parseasparseAST } from '@babel/parser';
/* eslint-disable no-underscore-dangle */
import { dirname } from 'node:path';
import { isDir } from './files';
import { PathResolver, pathResolver } from './path-resolver';
import type {
	File,
	ImportOrExportDeclaration,
	Statement,
	StringLiteral,
} from '@babel/types';

export type NodeType = 'external' | 'internal' | 'resource' | 'package';

interface EditableNode {
	path: string;
	type: NodeType;
	dependsOn: string[];
}

export interface Node extends Readonly<EditableNode> {}

interface AddNodeParams extends Node {}

const neededTypes: Statement['type'][] = [
	'ImportDeclaration',
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
];

type ImportExportDeclarationWithSource = ImportOrExportDeclaration & {
	readonly source: StringLiteral;
};

const isNeededLeave = (
	statement: Statement
): statement is ImportOrExportDeclaration => {
	return neededTypes.includes(statement.type);
};

export interface AddASTNodeParams {
	readonly parsed: File;
	readonly filePath: string;
}

interface Source {
	/**
	 * Resolved path
	 */
	readonly path: string;
	/**
	 * Source type
	 */
	readonly type: NodeType;
}

export class Nodes {
	private readonly _nodes: Record<string, Node>;

	constructor() {
		this._nodes = {};
	}

	addNodeFromResource(path: string): Node {
		return this._addNode({
			path,
			type: 'resource',
			dependsOn: [],
		});
	}

	async addNodeFromAST({ parsed, filePath }: AddASTNodeParams): Promise<Node> {
		const declarations = Nodes._filterImportExportNodes(parsed);
		const sources = await Nodes._extractSources(
			declarations,
			dirname(filePath)
		);

		const dependsOn = await Promise.all(
			sources.map(async ({ path, type }) => {
				this._addNode({ path, type, dependsOn: [] });
				return path;
			})
		);

		return this._addNode({
			path: filePath,
			type: 'internal',
			dependsOn,
		});
	}

	toJSON() {
		return this._nodes;
	}

	private static _filterImportExportNodes(
		parsed: File
	): ImportExportDeclarationWithSource[] {
		return parsed.program.body.filter(
			(statement): statement is ImportExportDeclarationWithSource => {
				if (!isNeededLeave(statement)) {
					return false;
				}

				return 'source' in statement && statement.source !== null;
			}
		);
	}

	private static async _extractSources(
		declarations: ImportExportDeclarationWithSource[],
		parentPath: string
	): Promise<Source[]> {
		return Promise.all(
			declarations.map(async (declaration) => {
				const path = declaration.source.value;
				const aliasResolvedPath = pathResolver.resolveAliases(path);
				const isPackage = PathResolver.isPackage(aliasResolvedPath);

				if (isPackage) {
					return {
						path: aliasResolvedPath,
						type: 'package',
					};
				}

				const wasAlias = aliasResolvedPath !== path;

				const resolvedPath = pathResolver.resolve({
					path: aliasResolvedPath,
					parentPath: wasAlias ? undefined : parentPath,
				});

				const isInternal = pathResolver.isInternalPath(resolvedPath.fullPath);

				if (!isInternal) {
					return {
						path,
						type: 'external',
					};
				}

				const dir = await isDir(resolvedPath.fullPath);

				if (dir) {
					const dirPath = await pathResolver.resolveIndexFile(
						resolvedPath.fullPath
					);

					return {
						path: dirPath,
						type: 'internal',
					};
				}

				const filePath = await pathResolver.resolveFileExtension(
					resolvedPath.fullPath
				);

				return {
					path: filePath,
					type: 'internal',
				};
			})
		);
	}

	private _nodeExists(path: string): boolean {
		return this._nodes[path] !== undefined;
	}

	private _appendNodeDependencies(path: string, dependencies: string[]): void {
		const node = this._nodes[path] as EditableNode;

		const oldDependencies = new Set(node.dependsOn.concat(dependencies));

		node.dependsOn = Array.from(oldDependencies);
	}

	private _addNode(params: AddNodeParams): Node {
		const { dependsOn, path, type } = params;

		let node = this._nodes[path] as EditableNode | null;
		if (!node) {
			node = {
				path,
				type,
				dependsOn: [],
			};
			this._nodes[path] = node;
		}

		if (dependsOn.length) {
			const oldDependencies = new Set(node.dependsOn.concat(dependsOn));

			node.dependsOn = Array.from(oldDependencies);
		}

		return node;
	}
}

export const nodes = new Nodes();
