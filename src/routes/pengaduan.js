import { Router } from "express";
import {
  Pengaduan,
  PengaduanDetail,
  sequelize,
} from "../database/models/index";
const router = Router();
const getIpClient = (ip) => ip.split(":").pop();

router.get("/", async function (req, res) {
  try {
    const pengaduanModel = await Pengaduan.findAll({
      include: {
        model: PengaduanDetail,
        as: "detail",
        where: { masyarakatIp: getIpClient(req.ip) },
      },
    });
    res.json({
      status: true,
      message: "Hello this is user index",
      data: pengaduanModel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { isiLaporan } = req.body;
    const pengaduanModel = await Pengaduan.create(
      {
        isiLaporan,
        status: "belumVerif",
      },
      { transaction: t }
    );
    await pengaduanModel.createDetail(
      {
        masyarakatIp: getIpClient(req.ip),
      },
      { transaction: t }
    );
    await t.commit();
    res.json({
      status: true,
      message: "Create Pengaduan Success",
      data: pengaduanModel,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json(error);
  }
});
export default router;
