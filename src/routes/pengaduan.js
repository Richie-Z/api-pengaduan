import { Router } from "express";
import { pengaduan, pengaduan_detail } from "../database/models/index";

var router = Router();
const getIpClient = (ip) => ip.split(":").pop();

router.get("/", function (req, res) {
  res.json({
    status: true,
    message: "Hello this is user index",
    ip: getIpClient(req.ip),
  });
});

router.post("/", async (req, res) => {
  const { pesan } = req.body;
  res.json({
    status: true,
    pesan,
    ip: getIpClient(req.ip),
  });
});
export default router;
