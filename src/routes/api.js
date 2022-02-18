import { Router } from "express";
import pengaduanRouter from "./pengaduan";
import csrfSecure from "./csrf-secured";

const router = Router();
const getIpClient = (ip) => ip.split(":").pop();

router.get("/", (_req, res) => {
  res.send("Hello World!");
});

router.get("/myip", (req, res) => {
  res.json({
    status: true,
    message: "Success",
    ip: getIpClient(req.ip || req.ips),
  });
});

router.use("/pengaduan", pengaduanRouter);
router.use(csrfSecure);

export default router;
