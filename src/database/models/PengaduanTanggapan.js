"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PengaduanTanggapan extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {}
  }
  PengaduanTanggapan.init(
    {
      pengaduanId: DataTypes.INTEGER,
      petugasId: DataTypes.INTEGER,
      tanggapan: DataTypes.TEXT,
      detailPerubahan: DataTypes.STRING,
      lampiran: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "PengaduanTanggapan",
    }
  );
  return PengaduanTanggapan;
};
