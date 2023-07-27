#! /usr/bin/env node
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parse as parseAST } from '@babel/parser';
import { ResolveParams, ResolvedPath, pathResolver } from './path-resolver';
import { matchAnyPattern, preparedPatterns } from './patterns';
import { Node, nodes } from './nodes';
import { configManager } from './config-manage';

const parseDir = async (resolvedPath: ResolvedPath) => {
	const files = await readdir(resolvedPath.fullPath);

	const parsers = files.map((file) =>
		parse({
			path: file,
			parentPath: resolvedPath.relativePath,
		})
	);

	await Promise.all(parsers);
};

const parsableExtensions: string[] = ['.ts', '.js', '.mjs'];

const ignorePatterns = preparedPatterns([
	'node_modules',
	'dist',
	'prisma',
	'*.json',
]);

const parseFile = async (resolvedPath: ResolvedPath): Promise<Node> => {
	const file = await readFile(resolvedPath.fullPath, 'utf-8');
	const extension = extname(resolvedPath.fullPath);

	if (!parsableExtensions.includes(extension as any)) {
		return nodes.addNodeFromResource(resolvedPath.relativePath);
	}

	const parsed = parseAST(file, {
		sourceType: 'module',
		sourceFilename: resolvedPath.relativePath,
		plugins: ['typescript', 'decorators-legacy', 'jsx'],
		attachComment: false,
	});

	return nodes.addNodeFromAST({
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
		await parseFile(resolvedPath);
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
	configManager.setConfig({
		ignorePatterns,
		supportedExtensions: parsableExtensions,
	});
	await parse({ path: pathResolver.resolve({ path: '.' }).fullPath });

	console.log('[SUCCESSFULLY PARSED]');
	await writeFile('./results.json', JSON.stringify(nodes, undefined, 2));
};

startParsing();
