import {
  Pengaduan,
  PengaduanDetail,
  sequelize,
} from "../database/models/index";
import PengaduanException from "../exception/PengaduanException";

const getIpClient = (ip) => ip.split(":").pop();

const getPengaduanIP = async (req, res) => {
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
};

const getPengaduanID = async (req, res) => {
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
    if (!pengaduanModel)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanId} not found`
      );
    res.json({
      status: true,
      message: "Success get by ID",
      data: pengaduanModel ?? "hello",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const createPengaduan = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { isiLaporan, nama } = req.body;
    const files = req.files.map((x) => {
      return { filename: x.originalname, location: x.path };
    });
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
};
export { getPengaduanIP, getPengaduanID, createPengaduan };
