import {config} from 'dotenv'
config()
import express from 'express'
import  UserRouter from './router/user'
import AuthRouter from './router/auth'

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use('/api', UserRouter)
app.use('/auth', AuthRouter)


app.listen(PORT, () => {
	console.log(`Server started... port: ${PORT}`)
})

