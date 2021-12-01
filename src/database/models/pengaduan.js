"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pengaduan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      pengaduan.hasOne(models.pengaduan_detail);
    }
  }
  pengaduan.init(
    {
      isiLaporan: DataTypes.TEXT,
      lampiran: DataTypes.TEXT,
      status: DataTypes.ENUM("belumVerif", "proses", "selesai"),
    },
    {
      sequelize,
      modelName: "pengaduan",
    }
  );
  return pengaduan;
};
