import { pathResolver } from './path-resolver';
import type {
	File,
	ImportOrExportDeclaration,
	Statement,
	StringLiteral,
} from '@babel/types';

export interface Node {
	readonly path: string;
	readonly dependsOn: string[];
}

const neededTypes: Statement['type'][] = [
	'ImportDeclaration',
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
];

type NeedStatement = ImportOrExportDeclaration & {
	readonly source: StringLiteral;
};

const isNeededLeave = (
	statement: Statement
): statement is ImportOrExportDeclaration => {
	return neededTypes.includes(statement.type);
};

export interface MakeNodeFromASTParams {
	readonly parsed: File;
	readonly filePath: string;
}

export const makeNodeFromAST = ({
	parsed,
	filePath,
}: MakeNodeFromASTParams): Node => {
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

export interface MakeSimpleNodeParams {
	readonly filePath: string;
}

export const makeSimpleNode = ({ filePath }: MakeSimpleNodeParams): Node => {
	return {
		path: filePath,
		dependsOn: [],
	};
};
