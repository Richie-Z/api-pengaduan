"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pengaduan extends Model {
    static associate(models) {
      Pengaduan.hasOne(models.PengaduanDetail, {
        as: "detail",
        foreignKey: "pengaduanId",
      });

      Pengaduan.hasMany(models.PengaduanTanggapan, {
        as: "tanggapan",
        foreignKey: "pengaduanId",
      });
    }
  }
  Pengaduan.init(
    {
      isiLaporan: DataTypes.TEXT,
      lampiran: DataTypes.TEXT,
      laporan: {
        type: DataTypes.VIRTUAL,
        get() {
          let fixedLaporan = this.isiLaporan.split(" "),
            n = fixedLaporan.length;
          if (n >= 25) fixedLaporan.splice(25, fixedLaporan.length);
          return `${fixedLaporan.join(" ")}${n >= 25 ? "..." : ""}`;
        },
      },
    },
    {
      sequelize,
      modelName: "Pengaduan",
      tableName: "pengaduans",
    }
  );
  return Pengaduan;
};
