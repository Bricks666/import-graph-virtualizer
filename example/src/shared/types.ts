export type ExtractValueType<T extends Record<string, any>> = T extends Record<
	string,
	infer R
>
	? R
	: never;
