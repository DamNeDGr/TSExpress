import { Router } from "express";
import type { Request, Response } from "express";
import type { IUser } from "../types/UserTypes";
import { addUser, checkUser, deleteUser, generateToken } from "../utils/utils";
import { prisma } from "../db/db";
import { loginScheme, registerSchema } from "../utils/validator";

const router = Router();




router.post("/login", async (req: Request<{}, {}, IUser>, res: Response) => {
	const parsed = loginScheme.safeParse(req.body);
	if (!parsed.success) {
		return res
			.status(409)
			.json({ error: "Недопустимый email" });
	}
	const auth = await checkUser(parsed.data.email, parsed.data.password);
	if (!auth)
		return res.status(401).json({ message: "Неверный email или пароль", status: 'error'});
	const token = await generateToken(auth.id, auth.email)
	res.status(200).json({
		message: `Welcome ${auth.username}`,
		status: "success",
		token: token,
	});
});

router.post("/register", async (req: Request<{}, {}, IUser>, res: Response) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(409).json({ error: "Недопустимый email" });
	}
	const existEmail = await prisma.users.findUnique({
		where: { email: parsed.data?.email },
	});
	const existUsername = await prisma.users.findFirst({
		where: { username: parsed.data?.username },
	});
	if (existEmail || existUsername) {
		return res.status(409).json({ error: "Conflict email" });
	}
	try {
		const newUser = addUser(
			parsed.data.email,
			parsed.data.username,
			parsed.data.password
		);
		return res
			.status(201)
			.json({ message: `Register Success`, data: (await newUser).email});
	} catch (err) {
		return res.status(409).json({ error: "Conflict email" });
	}
});

router.delete("/user/:id", (req: Request, res: Response) => {
	const userId = req.params.id;
	const users = deleteUser(Number(userId));
	return res.json(users);
});

export default router;
