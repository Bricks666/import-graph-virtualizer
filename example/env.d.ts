declare namespace NodeJS {
	interface ProcessEnv {
		readonly SECRET: string;
		readonly PORT: number;
		readonly COOKIE_NAME?: string;
	}

	interface Process {
		env: ProcessEnv;
	}
}
