import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken, checkAdmin } from "../middleware/authMiddleware";
import { getUsers} from "../utils/utils.ts";


const router = Router();

router.get("/users", checkAdmin, async (req: Request, res: Response) => {
	const users = await getUsers();
	return res.status(200).json({'data': users})
});



export default router;
