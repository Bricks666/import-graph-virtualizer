export interface SelectUserById {
	readonly id: string;
}

export interface SelectUserByLogin {
	readonly login: string;
}

export type SelectUser = SelectUserById | SelectUserByLogin;
