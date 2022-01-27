import { Router } from "express";
import petugasRouter from "./petugas";
import authRouter from "./auth";
import pengaduanRouter from "./pengaduan";
import auth from "../middleware/auth";

const router = Router();
const getIpClient = (ip) => ip.split(":").pop();

router.get("/", (_req, res) => {
  res.send("Hello World!");
});
router.get("/myip",(req,res)=>{
  res.json({
    status: true,
    message: "Success",
    ip:getIpClient(req.ip || req.ips)
  });
});
router.use("/auth", authRouter);
router.use("/pengaduan", pengaduanRouter);
router.use("/petugas", auth, petugasRouter);
export default router;
