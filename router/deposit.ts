import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken } from "../middleware/authMiddleware";
import { addDeposit, getDeposits } from "../utils/utils";

const router = Router();

router.get('/', authToken, async (req: Request, res: Response) => {
	const userID = req.userId
	const user = await prisma.user.findUnique({
		where: {id: userID}
	})
	if(!user) return res.status(403).json({'error': 'Ошибка доступа'})
	const deposits = await getDeposits(user)
	console.log(deposits)
	return res.json({'data': deposits})
})

router.post("/add", authToken, async (req: Request<{}, {}>, res: Response) => {
	const userID = req.userId
	const {name, summary} = req.body
	if(!userID) return res.json({'error': 'Ошибка попробуйте позднее'})
	const newDeposit = await addDeposit(name, summary, userID)
	return res.status(201).json({'message': 'Долг создан', 'data': newDeposit})
});



export default router;
