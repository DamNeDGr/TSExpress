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


const capitaLize = (text: string): string => {
	if (text.length <= 0) {
		return ""
	}
	const clean = text.trim();
	const firstSymbol = clean[0];
	if (typeof firstSymbol === 'string') {
		return `${firstSymbol.toLocaleUpperCase()}${text.slice(1).toLocaleLowerCase()}`
	}
	return ""
}


export const addUser = async (
	email: string,
	username: string,
	password: string,
	first_name: string,
	last_name: string,
	sur_name: string
) => {
	const hashPassword = await bcrypt.hash(password, 10);
	const firstName = capitaLize(first_name);
	const lastName = capitaLize(last_name);
	const surName = capitaLize(sur_name);
	const fullName = `${firstName} ${lastName} ${surName}`
	return  (await prisma.user.create({
		data: {
			email: email,
			username: username,
			password: hashPassword,
			first_name: firstName,
			last_name: lastName,
			sur_name: surName,
			full_name: fullName
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


export const getAllDeposits = async (user: IUser) => {
	if(user?.role === Role.admin){
			return (await prisma.deposit.findMany());
		}
	return []
}

export const getDepositsById = async (user: IUser, id: number) => {
	return (await prisma.deposit.findMany({
			where: {
				id: id,
				author_id: user.id
			},
			select: {
				id: true,
				name: true,
				summary: true,
				created_at: true,
				updated_at: true
			}
		}));
}

export const getDeposits = async (user: IUser) => {
	return (await prisma.deposit.findMany({
			where: {author_id: user.id},
			select: {
				id: true,
				name: true,
				summary: true,
				created_at: true,
				updated_at: true
			}
		}));
}
