import {
  Pengaduan,
  sequelize,
  PengaduanDetail,
} from "../database/models/index";
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
    const { pengaduanID } = req.params;
    const pengaduan = await Pengaduan.findByPk(pengaduanID);
    if (!pengaduan)
      throw new PengaduanException(
        `Pengaduan with id ${pengaduanID} not found`
      );
    await pengaduan.destroy();
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
export { updateStatus, update, getAll, deletePengaduan };
