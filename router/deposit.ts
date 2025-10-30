import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken } from "../middleware/authMiddleware";
import { addDeposit, getDeposits } from "../utils/utils";
import { Role } from "../types/UserTypes";
import {depositSchema} from "../utils/validator.ts";

const router = Router();

router.get('/', authToken, async (req: Request, res: Response) => {
	const userID = req.userId
	const user = await prisma.user.findUnique({
		where: {id: userID}
	})
	if(!user) return res.status(403).json({'error': 'Ошибка доступа'})
	const deposits = await getDeposits(user)
	return res.json({'data': deposits})
})

router.post("/add", authToken, async (req: Request<{}, {}>, res: Response) => {
	const userID = req.userId
	const parsed = depositSchema.safeParse(req.body);
	if(!userID) return res.json({'error': 'Ошибка попробуйте позднее'})
	if(!parsed.success) return res.json(({'error': 'Имя или долг невалидный'}))
	const newDeposit = await addDeposit(parsed.data?.name, parsed.data.summary, userID)
	return res.status(201).json({'message': 'Долг создан', 'data': newDeposit})
});

router.patch('/update/:id', authToken, async (req: Request, res: Response) => {
	const userId = req.userId;
	const user = await prisma.user.findUnique({
		where: {id: userId}
	})
	const depositId = Number(req.params.id)
	const {summary} = req.body
	try {
		if (!userId) return res.status(401).json({ message: "Unauthorized" });

		
		const deposit = await prisma.deposit.findUnique({
			where: { id: depositId },
		});

		if (!deposit)
			return res.status(404).json({ message: "Deposit not found" });

		if (user?.role === Role.admin){
			const updatedDeposit = await prisma.deposit.update({
				where: { id: depositId },
				data: { summary },
			});
			return res.json({
				message: "Deposit updated successfully",
				deposit: updatedDeposit,
			});
		}

		if (deposit.author_id !== userId)
			return res.status(403).json({ message: "Access denied" });


		const updatedDeposit = await prisma.deposit.update({
			where: { id: depositId },
			data: { summary },
		});

		return res.json({
			message: "Deposit updated successfully",
			deposit: updatedDeposit,
		});
	}
	catch {

	}
})


router.delete('/delete/:id', authToken, async (req: Request, res: Response) => {
	const userId = req.userId;
	const depositId = Number(req.params.id);
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	try {
		if (!userId) return res.status(401).json({ message: "Unauthorized" });
		
		const deposit = await prisma.deposit.findUnique({
			where: { id: depositId },
		});

		if (!deposit)
			return res.status(404).json({ message: "Deposit not found" });

		if (user?.role === Role.admin){
			const deleteDeposit = await prisma.deposit.delete({
				where: { id: depositId },
			});
			return res.json({
				message: "Deposit delete successfully",
				deposit: deleteDeposit,
			});
		}

		if (deposit.author_id !== userId)
			return res.status(403).json({ message: "Access denied" });


		const deleteDeposit = await prisma.deposit.delete({
			where: {id: depositId}
		})

		return res.json({
			message: "Deposit delete successfully",
			deposit: deleteDeposit,
		});
	}
	catch (err){
		return res.json({'error': err})
	}
})



export default router;
