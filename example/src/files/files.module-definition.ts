import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface FilesModuleOptions {
	readonly dir: string;
	readonly clientPath: string;
}

export const {
	ConfigurableModuleClass,
	ASYNC_OPTIONS_TYPE,
	MODULE_OPTIONS_TOKEN,
	OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<FilesModuleOptions>({
	moduleName: 'files',
})
	.setClassMethodName('forRoot')
	.setExtras<{ isGlobal?: boolean }>(
		{ isGlobal: true, },
		(definition, extra) => ({ ...definition, global: extra.isGlobal, })
	)
	.build();
