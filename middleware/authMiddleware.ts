import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

export const authToken = (req: Request, res: Response, next: NextFunction) => {
	if (JWT_SECRET) {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Токен не найден" });
		try {
			const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
			req.userId = payload.userId;
			next();
		} catch {
			return res.status(403).json({ error: "Неверный токен" });
		}
	}
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (JWT_SECRET) {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Токен не найден" });
		try {
			const payload = jwt.verify(token, JWT_SECRET) as { role: string };
			if(payload.role != 'admin'){
				return res.status(403).json({ error: "Недостаточно прав" });
			}
			
			next()
		} catch {
			return res.status(403).json({ error: "Недостаточно прав" });
		}
	}
};
