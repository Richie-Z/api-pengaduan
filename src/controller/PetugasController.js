import {
  Pengaduan,
  Petugas,
  sequelize,
  PengaduanDetail,
  Sequelize,
} from "../database/models/index";
import { unlinkSync, existsSync } from "fs";
import PengaduanException from "../exception/PengaduanException";

const getAll = async (_req, res) => {
  try {
    const pengaduan = await Pengaduan.findAll({
      include: "detail",
    });
    res.json({
      status: true,
      message: "Success",
      data: pengaduan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
const updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { pengaduanId, statusVerif } = req.params;
    const pengaduan = await Pengaduan.findByPk(pengaduanId, {
      include: "detail",
    });
    if (!pengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanId} not found`
      );
    statusVerif = statusVerif === "belumverif" ? "belumVerif" : statusVerif;
    await pengaduan.createTanggapan(
      {
        petugasId: req?.petugas.id,
        detailPerubahan: `ubah status verif dari ${pengaduan.detail.status} ke ${statusVerif}`,
      },
      { transaction: t }
    );
    await PengaduanDetail.update(
      {
        status: statusVerif,
      },
      { where: { id: pengaduan.detail.id } }
    );
    await t.commit();

    res.json({
      status: true,
      message: "Success",
      data: pengaduan,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json(error);
  }
};

const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { pengaduanId } = req.params;
    const { tanggapan, statusVerif } = req.body;
    const files = req.files.map((x) => {
      return { filename: x.originalname, location: x.path };
    });
    if (!tanggapan && !statusVerif)
      throw {
        status: false,
        message: "Missing Field tanggapan or statusVerif",
      };
    const pengaduan = await Pengaduan.findByPk(pengaduanId, {
      include: "detail",
    });
    if (!pengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanId} not found`
      );
    let tanggapanObject = {
      petugasId: req?.petugas.id,
      tanggapan: tanggapan ?? "",
      lampiran: JSON.stringify(files),
      detailPerubahan: statusVerif
        ? `ubah status verif dari ${pengaduan.detail.status} ke ${statusVerif}`
        : "tambah tanggapan",
    };
    await pengaduan.createTanggapan(tanggapanObject, { transaction: t });
    if (statusVerif)
      await PengaduanDetail.update(
        {
          status: statusVerif,
        },
        { where: { id: pengaduan.detail.id } }
      );
    await t.commit();
    res.json({
      status: true,
      message: "Success",
      data: pengaduan,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json(error);
  }
};

const deletePengaduan = async (req, res) => {
  try {
    const { pengaduanId } = req.params;
    const pengaduan = await Pengaduan.findByPk(pengaduanId);
    if (!pengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanId} not found`
      );
    JSON.parse(pengaduan.lampiran).forEach((element) => {
      if (existsSync(element.location)) {
        unlinkSync(element.location);
      }
    });
    await pengaduan.destroy();
    res.json({
      status: true,
      message: `Success Delete Pengaduan with id ${pengaduanId}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const getMembers = async (_req, res) => {
  try {
    const members = await PengaduanDetail.findAll({
      attributes: [
        [Sequelize.fn("MAX", Sequelize.col("id")), "id"],
        "nama",
        "masyarakatIp",
      ],
      group: ["nama", "masyarakatIp"],
    });
    res.json({
      status: true,
      data: members,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
    });
  }
};
const getMembersPengaduan = async (req, res) => {
  try {
    const { memberIP, nama } = req.query;
    if (!memberIP || !nama)
      throw new PengaduanException("query memberIP or nama must available");

    const pengaduan = await Pengaduan.findAll({
      include: [
        {
          model: PengaduanDetail,
          as: "detail",
          where: { masyarakatIp: memberIP, nama: nama },
          attributes: ["nama", "masyarakatIp", "status"],
        },
      ],
    });
    if (!pengaduan)
      throw new PengaduanException(`Pengaduan with provided query not found`);
    res.json({
      status: true,
      data: pengaduan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const dashboard = async (req, res) => {
  try {
    const petugas = await Petugas.count();
    const pengaduan = await Pengaduan.count();
    const members = await PengaduanDetail.findAll({
      attributes: [
        [Sequelize.fn("MAX", Sequelize.col("id")), "id"],
        "nama",
        "masyarakatIp",
      ],
      group: ["nama", "masyarakatIp"],
    });
    res.json({
      status: true,
      data: {
        petugas: petugas,
        pengaduan: pengaduan,
        members: members.reduce((prev) => (prev += 1), 0),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
export {
  updateStatus,
  update,
  getAll,
  deletePengaduan,
  getMembers,
  getMembersPengaduan,
  dashboard,
};
