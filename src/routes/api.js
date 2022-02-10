import { Router } from "express";
import petugasRouter from "./petugas";
import authRouter from "./auth";
import pengaduanRouter from "./pengaduan";
import auth from "../middleware/auth";
import csurf from "csurf";

const router = Router();
const getIpClient = (ip) => ip.split(":").pop();
const csrfProtection = csurf({ cookie: true });

router.get("/", (_req, res) => {
  res.send("Hello World!");
});

router.get("/csrf-token", (req, res) => {
  res.json({
    status: true,
    message: "Success",
    csrfToken: req.csrfToken(),
  });
});

router.get("/myip", (req, res) => {
  res.json({
    status: true,
    message: "Success",
    ip: getIpClient(req.ip || req.ips),
  });
});

router.use("/auth", authRouter);
router.use("/pengaduan", pengaduanRouter);
router.use("/petugas", auth, csrfProtection, petugasRouter);
export default router;
