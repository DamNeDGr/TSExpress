import { Users } from "../db/users";
import { prisma } from "../db/db";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "1h";


export const generateToken = async (id: number, email: string) => {
	if(JWT_SECRET && JWT_EXPIRES){
		const token = jwt.sign(
			{
				userId: id,
				email: email
			},
			JWT_SECRET,
			{expiresIn: JWT_EXPIRES}
		)
		return token
	}
}




export const checkUser = async (email: string, password: string) => {
	const user = await prisma.users.findUnique({
		where: { email: email },
	});
	if (user) {
		const validPassword = await bcrypt.compare(password, user.password)
		if (user.email === email && validPassword) return user;
	}
	return false;
};


export const addUser = async (email: string, username: string, password: string) => {
	const hashPassword = await bcrypt.hash(password, 10)
	const newUser = await prisma.users.create({
		data: {
			email: email,
			username: username,
			password: hashPassword,
		}
	})
	return newUser;
};

export const deleteUser = (id: number) => {
	const index = Users.findIndex((user) => user.id === id);
	if (index !== -1) {
		Users.splice(index, 1);
	}
	return index;
};
