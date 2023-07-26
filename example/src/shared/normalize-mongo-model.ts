export interface ObjectId {
	readonly $oid: string;
}

export interface WithObjectId {
	readonly _id: ObjectId;
}

type ReplaceObjectId<T extends WithObjectId, Key extends string> = Omit<
	T,
	keyof WithObjectId
> & { [K in Key]: string };

export const normalizeMongoModel = <T extends WithObjectId>(
	object: T
): ReplaceObjectId<T, 'id'> => {
	const { _id, ...rest } = object;

	return {
		...rest,
		id: _id.$oid,
	};
};
