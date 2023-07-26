#! /usr/bin/env node
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parse as parseAST } from '@babel/parser';
import { ResolveParams, ResolvedPath, pathResolver } from './path-resolver';
import { matchAnyPattern, preparedPatterns } from './patterns';
import { Node, makeNodeFromAST, makeSimpleNode } from './nodes';

const nodes: Record<string, Node> = {};

const parseDir = async (resolvedPath: ResolvedPath) => {
	const files = await readdir(resolvedPath.fullPath);

	const parsers = files.map((file) =>
		parse({
			path: file,
			parentPath: resolvedPath.fullPath,
		})
	);

	await Promise.all(parsers);
};

const parsableExtensions = ['.ts', '.js', '.mjs'];

const ignorePatterns = preparedPatterns([
	'node_modules',
	'dist',
	'prisma',
	'index.js',
	'*.json',
]);

const parseFile = async (resolvedPath: ResolvedPath): Promise<Node> => {
	const file = await readFile(resolvedPath.fullPath, 'utf-8');
	const extension = extname(resolvedPath.fullPath);

	if (!parsableExtensions.includes(extension)) {
		return makeSimpleNode({
			filePath: resolvedPath.relativePath,
		});
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
	if (matchAnyPattern(resolvedPath.relativePath, ignorePatterns)) {
		return;
	}

	const information = await lstat(resolvedPath.fullPath);

	if (information.isFile()) {
		const node = await parseFile(resolvedPath);

		nodes[node.path] = node;
	} else if (information.isDirectory()) {
		await parseDir(resolvedPath);
	}
};

export const startParsing = async () => {
	pathResolver.configure({
		targetPath: './example/src',
		aliases: {
			'@/*': './',
		},
	});
	await parse({ path: pathResolver.resolve({ path: '.' }).fullPath });

	console.log('[SUCCESSFULLY PARSED]');
	await writeFile('./results.json', JSON.stringify(nodes, undefined, 2));
};

startParsing();
