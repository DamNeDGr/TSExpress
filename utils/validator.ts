import  {z} from 'zod'


export const registerSchema = z.object({
	email: z.string().email(),
	username: z.string().min(4),
	password: z.string().min(6)
})

export const loginScheme = z.object({
	email: z.string().email(),
	password: z.string().min(6)
})
