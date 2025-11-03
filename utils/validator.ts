import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email(),
	username: z.string().min(4),
	password: z.string().min(6),
}).strict();

export const loginScheme = z.object({
	email: z.string().email(),
	password: z.string().min(6),
}).strict();



export const depositSchema = z.object({
	name: z.string().min(2),
	summary: z.number()
}).strict();
