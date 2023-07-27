import { stat } from 'node:fs/promises';

export const isDir = async (path: string): Promise<boolean> => {
	return stat(path)
		.then((stat) => stat.isDirectory())
		.catch(() => false);
};

export const isFile = async (path: string): Promise<boolean> => {
	return stat(path).then((stat) => stat.isFile());
};

export class File {
	constructor(path: string) {}

	async read() {}
}
