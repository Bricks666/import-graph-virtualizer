import { mkdir } from 'node:fs/promises';
import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { FilesService } from './files.service';
import {
	ConfigurableModuleClass,
	MODULE_OPTIONS_TOKEN,
	OPTIONS_TYPE
} from './files.module-definition';

@Module({
	providers: [FilesService],
	exports: [FilesService],
})
export class FilesModule
	extends ConfigurableModuleClass
	implements OnModuleInit
{
	#dir: string;

	constructor(@Inject(MODULE_OPTIONS_TOKEN) options: typeof OPTIONS_TYPE) {
		super();

		this.#dir = options.dir;
	}

	async onModuleInit() {
		await mkdir(this.#dir, { recursive: true, });
	}
}
