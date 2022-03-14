import {
  Pengaduan,
  Petugas,
  sequelize,
  PengaduanDetail,
  PengaduanTanggapan,
  Sequelize,
} from "../database/models/index";
import { unlinkSync, existsSync } from "fs";
import PengaduanException from "../exception/PengaduanException";

function deleteFiles(arr) {
  JSON.parse(arr).forEach((element) => {
    if (existsSync(element.location)) {
      unlinkSync(element.location);
    }
  });
}
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
const deletePengaduan = async (req, res) => {
  try {
    const { pengaduanId } = req.params;
    const pengaduan = await Pengaduan.findByPk(pengaduanId);
    if (!pengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanId} not found`
      );
    deleteFiles(pengaduan.lampiran);
    const tanggapan = await PengaduanTanggapan.findAll({
      where: { pengaduanId: pengaduanId },
    });
    tanggapan.forEach((el) => {
      deleteFiles(el.lampiran);
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
const updateStatus = async (req, res) => {
  res.json({
    status: false,
    message: "Deprecated",
  });
};

const createTanggapan = async (req, res) => {
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
const updateTanggapan = async (req, res) => {
  try {
    const { tanggapan, deletedLampiran } = req.body;
    const { tanggapanID } = req.params;
    const currentTanggapan = await PengaduanTanggapan.findByPk(tanggapanID);
    if (!currentTanggapan)
      throw new PengaduanException(
        `Tanggapan with id ${tanggapanID} not found`
      );
    const files = req.files?.map((x) => {
      return { filename: x.originalname, location: x.path };
    });
    const currentLampiran = JSON.parse(currentTanggapan.lampiran);
    if (deletedLampiran) {
      if (typeof deletedLampiran === "string") {
        if (existsSync(currentLampiran[deletedLampiran].location))
          unlinkSync(currentLampiran[deletedLampiran].location);
        currentLampiran.splice(deletedLampiran, 1);
      }
      if (typeof deletedLampiran === "object") {
        deletedLampiran.forEach((val) => {
          if (existsSync(currentLampiran[val].location))
            unlinkSync(currentLampiran[val].location);
        });
        deletedLampiran
          .sort((a, b) => b - a)
          .forEach((val) => currentLampiran.splice(val, 1));
      }
    }
    if (files) files.forEach((x) => currentLampiran.push(x));

    await currentTanggapan.update({
      tanggapan,
      lampiran: JSON.stringify(currentLampiran),
    });
    res.json({
      status: true,
      message: "Update Tanggapan Success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
const deleteTanggapan = async (req, res) => {
  try {
    const { tanggapanId } = req.params;
    const tanggapan = await PengaduanTanggapan.findByPk(tanggapanId);
    if (!tanggapan)
      throw new PengaduanException(
        `Tanggapan with id ${tanggapanId} not found`
      );
    deleteFiles(tanggapan.lampiran);
    await tanggapan.destroy();
    res.json({
      status: true,
      message: `Success Delete Tanggapan with id ${tanggapanId}`,
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
    if (!memberIP)
      throw new PengaduanException("query memberIP must available");
    const pengaduan = await Pengaduan.findAll({
      include: [
        {
          model: PengaduanDetail,
          as: "detail",
          where: { masyarakatIp: memberIP, nama: nama ?? null },
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

export {
  updateStatus,
  createTanggapan,
  getAll,
  deletePengaduan,
  getMembers,
  getMembersPengaduan,
  dashboard,
  deleteTanggapan,
  updateTanggapan,
};
