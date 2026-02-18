import express from "express";
import cors from "cors";
import UserRouter from "./router/user";
import AuthRouter from "./router/auth";
import DeposRouter from "./router/deposit";
import cookieParser from 'cookie-parser';

const app = express();


const PORT = process.env.PORT || 3000;

app.use(
	cors({
		origin: "http://localhost:5173", // где фронт
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());



app.use("/api", UserRouter);
app.use("/auth", AuthRouter);
app.use("/deposits", DeposRouter);

app.listen(PORT, () => {
	console.log(`Server started... port: ${PORT}`);
});
