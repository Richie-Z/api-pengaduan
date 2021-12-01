import { Router } from "express";
import userRouter from "./users";
import authRouter from "./auth";
import pengaduanRouter from "./pengaduan";
import auth from "../middleware/auth";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});
router.use("/auth", authRouter);
router.use("/pengaduan", pengaduanRouter);
router.use("/user", auth, userRouter);
export default router;
