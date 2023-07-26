import { extname, join, resolve } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import {
	Inject,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common';
import { v4 } from 'uuid';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './files.module-definition';
import type { Express } from 'express';

@Injectable()
export class FilesService {
	#dir: string;

	#clientPath: string;

	constructor(@Inject(MODULE_OPTIONS_TOKEN) options: typeof OPTIONS_TYPE) {
		this.#dir = options.dir;
		this.#clientPath = options.clientPath;
	}

	async writeFile(file: Express.Multer.File): Promise<string> {
		try {
			const fileName = v4() + extname(file.originalname);

			const fileSystemPath = this.getFileSystemPath(fileName);
			const servePath = this.getServePath(fileName);

			await writeFile(fileSystemPath, file.buffer);

			return servePath;
		} catch (error) {
			throw new InternalServerErrorException('Write file error', {
				cause: error,
			});
		}
	}

	async removeFile(path: string): Promise<void> {
		try {
			await unlink(path);
		} catch (error) {
			throw new InternalServerErrorException('Remove file error', {
				cause: error,
			});
		}
	}

	getFileSystemPath(fileName: string): string {
		return resolve(this.#dir, fileName);
	}

	getServePath(fileName: string): string {
		return resolve(this.#clientPath, fileName);
	}

	toFileSystemPath(servePath: string): string {
		return join(this.#dir, servePath.replace(this.#clientPath, ''));
	}

	toServePath(fileSystemPath: string): string {
		return join(this.#clientPath, fileSystemPath.replace(this.#dir, ''));
	}
}
