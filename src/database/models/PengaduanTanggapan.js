"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PengaduanTanggapan extends Model {
    static associate(models) {
      PengaduanTanggapan.belongsTo(models.Pengaduan, {
        foreignKey: "pengaduanId",
        as: "pengaduan",
      });
      PengaduanTanggapan.belongsTo(models.Petugas, {
        foreignKey: "petugasId",
        as: "penanggap",
      });
    }
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
      tableName: "pengaduan_tanggapans",
    }
  );
  return PengaduanTanggapan;
};
