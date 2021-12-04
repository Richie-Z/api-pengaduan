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
      masyarakatIp: DataTypes.TEXT,
      pengurus: DataTypes.STRING,
      pengaduanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PengaduanDetail",
      tableName: "pengaduan_details",
    }
  );
  return PengaduanDetail;
};
