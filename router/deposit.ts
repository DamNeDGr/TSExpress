import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken } from "../middleware/authMiddleware";
// import type { IDeposit } from "../types/DepositTypes";

const router = Router();

router.get('/', authToken, async (req: Request, res: Response) => {
	const userID = req.userId
	console.log(userID)
	const deposits = await prisma.deposit.findMany({
		where: {author_id: userID}
	})
	return res.json({'message': deposits})
})

router.post("/add", authToken, async (req: Request<{}, {}>, res: Response) => {
	const userID = req.userId
	const {name, summary} = req.body
	console.log(req.body)
	try {
		if(!userID) return res.status(401).json({'message': 'Error'})
		const newDeposit = await prisma.deposit.create({
			data: {
				name: name,
				summary: summary,
				author_id: userID
			}
		})
		return res.json({'message': 'Depos created!', 'data': newDeposit})
	}
	catch (err){
		res.status(409).json({"error": err})
	}
});



export default router;
