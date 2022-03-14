import {
  Pengaduan,
  PengaduanDetail,
  sequelize,
} from "../database/models/index";
import { unlinkSync, existsSync } from "fs";

import PengaduanException from "../exception/PengaduanException";

const getIpClient = (ip) => ip.split(":").pop();

const getPengaduanIP = async (req, res) => {
  try {
    const pengaduanModel = await Pengaduan.findAll({
      attributes: ["id", "laporan", "isiLaporan", "createdAt"],
      order: [["id", "DESC"]],
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

const updatePengaduan = async (req, res) => {
  try {
    const { isiLaporan, deletedLampiran } = req.body;
    const { pengaduanID } = req.params;
    const currentPengaduan = await Pengaduan.findByPk(pengaduanID);
    if (!currentPengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanID} not found`
      );
    const files = req.files?.map((x) => {
      return { filename: x.originalname, location: x.path };
    });
    const currentLampiran = JSON.parse(currentPengaduan.lampiran);
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
          currentLampiran.splice(val, 1);
        });
      }
    }
    if (files) files.forEach((x) => currentLampiran.push(x));

    await currentPengaduan.update({
      isiLaporan,
      lampiran: JSON.stringify(currentLampiran),
    });
    res.json({
      status: true,
      message: "Update Pengaduan Success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export { getPengaduanIP, getPengaduanID, createPengaduan, updatePengaduan };
