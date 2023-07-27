/* eslint-disable no-underscore-dangle */

export interface SetConfigParams {
	readonly ignorePatterns: RegExp[];
	readonly supportedExtensions: string[];
}

export class ConfigManager {
	private _ignorePatterns: RegExp[] = [];

	private _supportedExtensions: string[] = [];

	get ignorePatterns() {
		return this._ignorePatterns;
	}

	get supportedExtensions() {
		return this._supportedExtensions;
	}

	setConfig(params: SetConfigParams) {
		this._ignorePatterns = params.ignorePatterns;
		this._supportedExtensions = params.supportedExtensions;
	}
}

export const configManager = new ConfigManager();
