#! /usr/bin/env node
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parse as parseAST } from '@babel/parser';
import { PathResolver, ResolveParams, ResolvedPath } from './path-resolver';
import type {
	File,
	ImportOrExportDeclaration,
	Statement,
	StringLiteral,
} from '@babel/types';

const pathResolver = new PathResolver({
	targetPath: './example/src',
	aliases: {
		'@/*': './',
	},
});

interface Node {
	readonly path: string;
	readonly dependsOn: string[];
}

const nodes: Record<string, Node> = {};

type NeedStatement = ImportOrExportDeclaration & {
	readonly source: StringLiteral;
};

const neededTypes: Statement['type'][] = [
	'ImportDeclaration',
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
];

const isNeededLeave = (
	statement: Statement
): statement is ImportOrExportDeclaration => {
	return neededTypes.includes(statement.type);
};

interface MakeNodeParams {
	readonly parsed: File;
	readonly filePath: string;
}

const makeNodeFromAST = ({ parsed, filePath }: MakeNodeParams): Node => {
	const filteredStatements = parsed.program.body.filter(
		(statement): statement is NeedStatement => {
			if (!isNeededLeave(statement)) {
				return false;
			}

			return 'source' in statement && statement.source !== null;
		}
	);

	return {
		path: filePath,
		dependsOn: filteredStatements.map((statement) =>
			pathResolver.resolveAliases(statement.source.value)
		),
	};
};

const parseDir = async (resolvedPath: ResolvedPath) => {
	const files = await readdir(resolvedPath.fullPath);

	const parsers = files.map(async (file) => {
		await parse({
			path: file,
			parentPath: resolvedPath.fullPath,
		});
	});

	await Promise.all(parsers);
};

const parsableExtensions = ['.ts', '.js', '.mjs'];

const parseFile = async (resolvedPath: ResolvedPath): Promise<Node> => {
	const file = await readFile(resolvedPath.fullPath, 'utf-8');
	const extension = extname(resolvedPath.fullPath);
	if (!parsableExtensions.includes(extension)) {
		return {
			path: resolvedPath.relativePath,
			dependsOn: [],
		};
	}

	const parsed = parseAST(file, {
		sourceType: 'module',
		plugins: ['typescript', 'decorators-legacy'],

		attachComment: false,
	});

	return makeNodeFromAST({
		parsed,
		filePath: resolvedPath.relativePath,
	});
};

const parse = async (params: ResolveParams) => {
	const resolvedPath = pathResolver.resolve(params);
	const information = await lstat(resolvedPath.fullPath);

	if (information.isFile()) {
		const node = await parseFile(resolvedPath);

		nodes[node.path] = node;
	} else if (information.isDirectory()) {
		await parseDir(resolvedPath);
	}
};

const start = async () => {
	await parse({ path: pathResolver.resolve({ path: '.' }).fullPath });

	console.log('[SUCCESSFULLY PARSED]');
	await writeFile('./results.json', JSON.stringify(nodes, undefined, 2));
};

start();
