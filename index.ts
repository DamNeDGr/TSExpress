import express from 'express'
import cors from 'cors'
import  UserRouter from './router/user'
import AuthRouter from './router/auth'
import DeposRouter from './router/deposit'

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use('/api', UserRouter)
app.use('/auth', AuthRouter)
app.use('/deposits', DeposRouter)


app.listen(PORT, () => {
	console.log(`Server started... port: ${PORT}`)
})

