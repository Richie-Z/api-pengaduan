import { Router } from "express";
import csurf from "csurf";

import pengaduanRouter from "./pengaduan";
import petugasRouter from "./petugas";
import authRouter from "./auth";
import adminController from "./admin";

import auth from "../middleware/auth";
import hasRole from "../middleware/Role";

const router = Router();
const csrfProtection = csurf({ cookie: true });
const getIpClient = (ip) => ip.split(":").pop();

router.use(csrfProtection);
router.use((err, _req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403);
  res.json({ status: false, message: "Invalid CSRF Token" });
});

router.get("/", (_req, res) => {
  res.send("THIS IS INDEX ENDPOINT FOR PENGADUAN!");
});
router.get("/myip", (req, res) => {
  res.json({
    status: true,
    message: "Success",
    ip: getIpClient(req.ip || req.ips),
  });
});
router.get("/csrf-token", (req, res) => {
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token);
  res.json({
    status: true,
    message: "Success",
    csrfToken: token,
  });
});

router.use("/pengaduan", pengaduanRouter);
router.use("/auth", authRouter);
router.use("/petugas", auth, petugasRouter);
router.use("/admin", auth, hasRole("admin"), adminController);

export default router;
