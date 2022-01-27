"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PengaduanDetail extends Model {
    static associate(models) {
      PengaduanDetail.belongsTo(models.Pengaduan, {
        foreignKey: "pengaduanId",
      });
    }
  }
  PengaduanDetail.init(
    {
      nama: DataTypes.STRING,
      masyarakatIp: DataTypes.TEXT,
      pengaduanId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM("belumVerif", "proses", "selesai"),
        validate: { isIn: [["belumVerif", "proses", "selesai"]] },
      },
    },
    {
      sequelize,
      modelName: "PengaduanDetail",
      tableName: "pengaduan_details",
    }
  );
  return PengaduanDetail;
};
