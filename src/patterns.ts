export type RawPattern = string | RegExp;

export const preparePattern = (rawPattern: RawPattern): RegExp =>
	rawPattern instanceof RegExp
		? rawPattern
		: new RegExp(rawPattern.replace(/([+*])/g, '(.$1)'));

export const preparedPatterns = (rawPatters: RawPattern[]): RegExp[] => {
	return rawPatters.map(preparePattern);
};

export const matchAnyPattern = (str: string, patterns: RegExp[]): boolean => {
	return patterns.some((pattern) => pattern.test(str));
};
