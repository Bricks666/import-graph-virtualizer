#! /usr/bin/env node
import { parse as parseAST } from '@babel/parser';
import {
	ExportAllDeclaration,
	ExportDeclaration,
	ExportNamedDeclaration,
	File,
	ImportOrExportDeclaration,
	Statement,
	StringLiteral,
} from '@babel/types';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Node {
	readonly path: string;
	readonly dependsOn: string[];
}

const nodes: Record<string, Node> = {};

const test = async () => {
	const file = await readFile(
		resolve(__dirname, '..', 'example', 'src', 'index.js'),
		'utf-8'
	);

	const files = await readdir(resolve(__dirname, '..', 'example', 'src'));

	const parsed = parse(file, {
		sourceType: 'module',
		plugins: ['typescript'],
		attachComment: false,
	});
};

type NeedStatementType = ImportOrExportDeclaration['type'];

type NeedStatement = ImportOrExportDeclaration & {
	readonly source: StringLiteral;
};

const neededTypes: NeedStatementType[] = [
	'ImportDeclaration',
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
];

const isNeededLeave = (
	statement: Statement
): statement is ImportOrExportDeclaration => {
	return true;
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
		dependsOn: filteredStatements.map((statement) => statement.source.value),
	};
};

const parseDir = async ({ path, relativePath = '.' }) => {
	const files = await readdir(resolve(__dirname, relativePath, path));

	const parsers = files.map((file) => {
		return parse({
			path: file,
			relativePath: resolve(__dirname, relativePath, path),
		});
	});

	await Promise.all(parsers);
};

const parseFile = async ({ path, relativePath = '.' }): Promise<Node> => {
	const file = await readFile(resolve(__dirname, relativePath, path), 'utf-8');

	const parsed = parseAST(file, {
		sourceType: 'module',
		plugins: ['typescript', 'decorators-legacy'],

		attachComment: false,
	});

	return makeNodeFromAST({
		parsed,
		filePath: resolve(relativePath, path),
	});
};

const parse = async ({ path, relativePath = '.' }) => {
	const information = await stat(resolve(__dirname, relativePath, path));

	if (information.isFile()) {
		const node = await parseFile({ path, relativePath });

		nodes[node.path] = node;
	} else if (information.isDirectory()) {
		await parseDir({ path, relativePath });
	}
};

const start = async () => {
	await parse({ path: './../example/src' });

	await writeFile('./results.json', JSON.stringify(nodes, undefined, 2));
};

start();
