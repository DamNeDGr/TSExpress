import { Router } from "express";
import type { Request, Response } from "express";
import type { IUser } from "../types/UserTypes";
import { addUser, checkUser, generateToken } from "../utils/utils";
import { prisma } from "../db/db";
import { loginScheme, registerSchema } from "../utils/validator";
import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", async (req: Request<{}, {}, IUser>, res: Response) => {
	const parsed = loginScheme.safeParse(req.body);
	if (!parsed.success) {
		return res.status(409).json({ message: "Недопустимый email", status: 'error' });
	}
	const auth = await checkUser(parsed.data.email, parsed.data.password);
	if (!auth)
		return res
			.status(401)
			.json({ message: "Неверный email или пароль", status: "error" });
	if(!auth.role) return res.status(409).json({ error: "Conflict email" });
	const token = await generateToken(auth.id, auth.email);
	res.cookie("token", token, { maxAge: 3600000, httpOnly: true, secure: false, sameSite: "lax"});
	// res.send("Cookie set")
	res.status(200).json({
		message: `Welcome ${auth.username}`,
		status: "success",
	});
});

router.get("/logout", authToken, async (req: Request, res: Response) => {
	res.clearCookie("token", { path: "/" });
	res.json({ ok: true });
})

router.post("/register", async (req: Request<{}, {}, IUser>, res: Response) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(409).json({ error: "Недопустимый email или username" });
	}
	const existEmail = await prisma.user.findUnique({
		where: { email: parsed.data?.email },
	});
	const existUsername = await prisma.user.findFirst({
		where: { username: parsed.data?.username },
	});
	if (existEmail || existUsername) {
		return res.status(409).json({ error: "Conflict email" });
	}
	try {
		const newUser = addUser(
			parsed.data.email,
			parsed.data.username,
			parsed.data.password,
			parsed.data.first_name,
			parsed.data.last_name,
			parsed.data.sur_name
		);
		return res
			.status(201)
			.json({ message: `Register Success`, data: (await newUser).email });
	} catch (err) {
		return res.status(409).json({ error: "Conflict email" });
	}
});

router.get("/me", authToken, async (req: Request, res: Response) => {
	const user = await prisma.user.findUnique({
		where: { id: req.userId },
		select: {
			id: true,
			full_name: true,
			username: true,
			email: true,
			password: false,
			role: true,
			created_at: true,
		},
	});
	if (!user) return res.status(404).json({ error: "Пользователь не найден" });
	return res.json(user);
});

export default router;
