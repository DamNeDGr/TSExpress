import { prisma } from "../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role, type IUser } from "../types/UserTypes";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "1h";

export const generateToken = async (id: number, email: string, role?: string) => {
	if (JWT_SECRET && JWT_EXPIRES) {
		return jwt.sign(
			{
				userId: id,
				email: email,
				role: role
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES }
		);
	}
};

export const checkUser = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({
		where: { email: email },
	});
	if (user) {
		const validPassword = await bcrypt.compare(password, user.password);
		if (user.email === email && validPassword) return user;
	}
	return false;
};

export const addUser = async (
	email: string,
	username: string,
	password: string
) => {
	const hashPassword = await bcrypt.hash(password, 10);
	const newUser = await prisma.user.create({
		data: {
			email: email,
			username: username,
			password: hashPassword,
		},
	});
	return newUser;
};

export const getUserByID = async (id: number) => {
	const user = await prisma.user.findUnique({
		where: { id: id },
	})
	return user;
}

export const addDeposit = async (
	name: string,
	summary: number,
	userID: number
) => {
	const newDeposit = await prisma.deposit.create({
			data: {
				name: name,
				summary: summary,
				author_id: userID,
			},
		});
	return newDeposit
}


export const getDeposits = async (user: IUser) => {
	if(user?.role === Role.admin){
			const deposits = await prisma.deposit.findMany();
			return deposits
		}
	const deposits = await prisma.deposit.findMany({
			where: {author_id: user.id}
		})
	return deposits
}

