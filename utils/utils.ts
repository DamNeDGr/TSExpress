import { prisma } from "../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role, type IUser } from "../types/UserTypes";



const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "1h";

export const generateToken = async (id: number, email: string) => {
	if (JWT_SECRET && JWT_EXPIRES) {
		return jwt.sign(
			{
				userId: id,
				email: email,
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


// export const checkAuthUser = async (req: Request, res: Response): Promise<IUser | Response> => {
// 	const userID = req.userId;
// 	if (!userID) return res.status(403).json({'error': 'Вы не авторизованы!'})
// 	const user = await getUserByID(userID)
// 	if (!user) return res.status(403).json({'error': 'Вы не авторизованы!'})
// 	return user
// }

export const addUser = async (
	email: string,
	username: string,
	password: string
) => {
	const hashPassword = await bcrypt.hash(password, 10);
	return  (await prisma.user.create({
		data: {
			email: email,
			username: username,
			password: hashPassword,
		},
	}));
};

export const getUserByID = async (id: number) => {
	return  (await prisma.user.findUnique({
		where: { id: id },
	}));
}

export const getUsers = async () => {
	return  (await prisma.user.findMany()) as IUser[];
}

export const addDeposit = async (
	name: string,
	summary: number,
	userID: number
) => {
	return (await prisma.deposit.create({
			data: {
				name: name,
				summary: summary,
				author_id: userID,
			},
		}));
}


export const getDeposits = async (user: IUser) => {
	if(user?.role === Role.admin){
			return (await prisma.deposit.findMany());
		}
	return (await prisma.deposit.findMany({
			where: {author_id: user.id}
		}));
}

