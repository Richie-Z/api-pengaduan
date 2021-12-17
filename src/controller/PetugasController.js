import {
  Pengaduan,
  sequelize,
  PengaduanDetail,
} from "../database/models/index";

const updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { pengaduanId, statusVerif } = req.params;
    const pengaduan = await Pengaduan.findByPk(pengaduanId, {
      include: "detail",
    });
    if (!pengaduan) throw { status: false, message: "Pengaduan Not Found" };
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
    res.status(500).send(error);
  }
};

const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { pengaduanId } = req.params;
    const { tanggapan, statusVerif } = req.body;
    if (!tanggapan) throw { status: false, message: "Missing Field tanggapan" };
    const pengaduan = await Pengaduan.findByPk(pengaduanId, {
      include: "detail",
    });
    if (!pengaduan) throw { status: false, message: "Pengaduan Not Found" };
    let tanggapanObject = {
      petugasId: req?.petugas.id,
      tanggapan: tanggapan,
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
    res.status(500).send(error);
  }
};
export { updateStatus, update };
