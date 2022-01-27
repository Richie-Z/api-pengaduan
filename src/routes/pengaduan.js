import { Router } from "express";
import {
  Pengaduan,
  PengaduanDetail,
  sequelize,
} from "../database/models/index";
import Multer from "multer";
const router = Router();
const getIpClient = (ip) => ip.split(":").pop();
const storage = Multer.diskStorage({
  destination: "./public/files",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = new Multer({ storage: storage });
router.get("/", async function (req, res) {
  try {
    const pengaduanModel = await Pengaduan.findAll({
      attributes: ["id", "laporan", "isiLaporan", "createdAt"],
      include: [
        {
          model: PengaduanDetail,
          as: "detail",
          where: { masyarakatIp: getIpClient(req.ip || req.ips) },
          attributes: ["nama", "masyarakatIp", "status"],
        },
      ],
    });
    res.json({
      status: true,
      message: "Success get",
      data: pengaduanModel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
router.get("/:pengaduanId(\\d+)", async function (req, res) {
  try {
    let { pengaduanId } = req.params;
    const pengaduanModel = await Pengaduan.findByPk(pengaduanId, {
      attributes: ["id", "laporan", "isiLaporan", "lampiran", "createdAt"],
      include: [
        "detail",
        {
          association: "tanggapan",
          include: "penanggap",
        },
      ],
    });
    res.json({
      status: true,
      message: "Success get by ID",
      data: pengaduanModel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/", upload.array("lampiran", 6), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { isiLaporan, nama } = req.body;
    const files = req.files.map((x) => x.path);
    const pengaduanModel = await Pengaduan.create(
      {
        isiLaporan,
        lampiran: JSON.stringify(files),
        status: "belumVerif",
      },
      { transaction: t }
    );
    await pengaduanModel.createDetail(
      {
        masyarakatIp: getIpClient(req.ip),
        status: "belumVerif",
        nama: nama,
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
    console.log(error);
    res.status(400).json(error);
  }
});
export default router;
