import { Router } from "express";
import type {Request, Response} from 'express'
import {prisma} from '../db/db'


const router = Router();



router.get('/users', async (req: Request, res: Response) => {
	const users = await prisma.users.findMany()
	res.json(users)
})


export default router;
