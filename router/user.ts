import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken, checkAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/users", checkAdmin, async (req: Request, res: Response) => {
	const users = await prisma.users.findMany();
	return res.json(users);
});

router.get("/me", authToken, async (req: Request, res: Response) => {
	const user = await prisma.users.findUnique({
		where: { id: req.userId },
		select: {
			id: true,
			username: true,
			email: true,
			created_at: true,
		},
	});
	if (!user) return res.status(404).json({ error: "Пользователь не найден" });
	return res.json(user);
});

export default router;
