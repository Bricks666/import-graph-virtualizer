import { ExtractValueType } from './types';

export const SORT_ORDER = {
	ASC: 'asc',
	DESC: 'desc',
} as const;

export type SortOrder = ExtractValueType<typeof SORT_ORDER>;

export const SORT_ORDER_VALUE = {
	ASC: 1,
	DESC: -1,
} satisfies Record<Uppercase<SortOrder>, number>;
