import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Role } from "../types/UserTypes";
import {getUserByID} from "../utils/utils.ts";


const JWT_SECRET = process.env.JWT_SECRET;



export const authToken = (req: Request, res: Response, next: NextFunction) => {
	if (JWT_SECRET) {
		const token = req.cookies?.token;
		if (!token) return res.status(401).json({ error: "Вы не авторизованы" });
		try {
			const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
			req.userId = payload.userId;
			next();
		} catch {
			return res.status(403).json({ error: "Неверный токен" });
		}
	}
};

export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
	if (JWT_SECRET) {
		const token = req.cookies?.token;
		if (!token) return res.status(401).json({ error: "Вы не авторизованы" });
		try {
			const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
			const user = await getUserByID(payload.userId);
			if (!user) {
				return res.status(403).json({ error: "Недостаточно прав" });
			}
			if(user.role !== Role.admin) return res.status(403).json({ error: "Недостаточно прав" });
			
			next()
		} catch {
			return res.status(403).json({ error: "Недостаточно прав" });
		}
	}
};
