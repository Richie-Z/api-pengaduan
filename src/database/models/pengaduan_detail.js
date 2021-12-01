"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pengaduan_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      pengaduan_detail.belongsTo(models.pengaduan);
    }
  }
  pengaduan_detail.init(
    {
      masyarakatIp: DataTypes.TEXT,
      pengurus: DataTypes.STRING,
      pengaduanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pengaduan_detail",
    }
  );
  return pengaduan_detail;
};
