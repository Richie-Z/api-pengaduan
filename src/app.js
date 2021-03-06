import express, { json, urlencoded } from "express";
import { join } from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index";
import apiRouter from "./routes/api";
const app = express();

app.set("trust proxy", "loopback");
app.use(logger("dev"));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/api/v1", apiRouter);
app.use("/api/v1/public", express.static(join(__dirname, "../public")));

export default app;
