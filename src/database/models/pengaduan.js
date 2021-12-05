"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pengaduan extends Model {
    static associate(models) {
      Pengaduan.hasOne(models.PengaduanDetail, {
        as: "detail",
        foreignKey: "pengaduanId",
      });
      Pengaduan.belongsToMany(models.Petugas, {
        as: "tanggapan",
        through: models.PengaduanTanggapan,
        foreignKey: "pengaduanId",
      });
    }
  }
  Pengaduan.init(
    {
      isiLaporan: DataTypes.TEXT,
      lampiran: DataTypes.TEXT,
      status: DataTypes.ENUM("belumVerif", "proses", "selesai"),
    },
    {
      sequelize,
      modelName: "Pengaduan",
      tableName: "pengaduans",
    }
  );
  return Pengaduan;
};
