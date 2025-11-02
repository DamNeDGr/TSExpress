import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { authToken } from "../middleware/authMiddleware";
import {addDeposit, getDeposits, getUserByID} from "../utils/utils";
import { Role } from "../types/UserTypes";
import {depositSchema} from "../utils/validator.ts";

const router = Router();

router.get('/', authToken, async (req: Request, res: Response) => {
	const userID = req.userId;
	if (!userID) return res.status(403).json({'error': 'Ошибка доступа'})
	const user = await getUserByID(userID);
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
	if(!userId) return res.status(403).json({'error': 'Ошибка доступа'})
	const user = await getUserByID(userId)
	if (!user) return res.status(403).json({'error': 'Ошибка доступа'})
	const depositId = Number(req.params.id)
	const {summary} = req.body
	try {
		const deposit = await prisma.deposit.findUnique({
			where: { id: depositId },
		});

		if (!deposit)
			return res.status(404).json({ message: "Долг не найден" });

		if (user.role === Role.admin){
			const updatedDeposit = await prisma.deposit.update({
				where: { id: depositId },
				data: { summary },
			});
			return res.json({
				message: "Долг успешно обновлен",
				deposit: updatedDeposit,
			});
		}

		if (deposit.author_id !== userId) return res.status(403).json({ message: "Доступ запрещен", data: user});



		const updatedDeposit = await prisma.deposit.update({
			where: { id: depositId },
			data: { summary },
		});

		return res.json({
			message: "Долг успешно обновлен",
			deposit: updatedDeposit,
		});
	}
	catch (err){
		return res.json({'error': err})
	}
})


router.delete('/delete/:id', authToken, async (req: Request, res: Response) => {
	const userId = req.userId;
	if (!userId) return res.status(403).json({'error': 'Ошибка доступа'})
	const depositId = Number(req.params.id);
	const user = await getUserByID(userId);

	try {
		if (!userId) return res.status(401).json({ message: "Вы не авторизованы" });
		
		const deposit = await prisma.deposit.findUnique({
			where: { id: depositId },
		});

		if (!deposit)
			return res.status(404).json({ message: "Долг не найден" });

		if (user?.role === Role.admin){
			const deleteDeposit = await prisma.deposit.delete({
				where: { id: depositId },
			});
			return res.json({
				message: "Долг успешно удален",
				deposit: deleteDeposit,
			});
		}

		if (deposit.author_id !== userId)
			return res.status(403).json({ message: "Доступ запрещен" });


		const deleteDeposit = await prisma.deposit.delete({
			where: {id: depositId}
		})

		return res.json({
			message: "Долг успешно удален",
			deposit: deleteDeposit,
		});
	}
	catch (err){
		return res.json({'error': err})
	}
})



export default router;
