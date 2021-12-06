import { Router } from "express";
import petugasRouter from "./petugas";
import authRouter from "./auth";
import pengaduanRouter from "./pengaduan";
import auth from "../middleware/auth";

const router = Router();

router.get("/", (_req, res) => {
  res.send("Hello World!");
});
router.use("/auth", authRouter);
router.use("/pengaduan", pengaduanRouter);
router.use("/petugas", auth, petugasRouter);
export default router;
