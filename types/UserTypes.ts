export interface IUser {
	id: number;
	email: string;
	username: string;
	role: string
	password: string;
}


export enum Role {
	admin = 'ADMIN',
	user = 'USER'
}
