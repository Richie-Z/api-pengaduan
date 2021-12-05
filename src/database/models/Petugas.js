"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Petugas extends Model {
    static associate(models) {
      Petugas.belongsToMany(models.Pengaduan, {
        through: models.PengaduanTanggapan,
        foreignKey: "petugasId",
      });
    }
  }
  Petugas.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.ENUM("admin", "operator"),
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Petugas",
      tableName: "petugas",
    }
  );
  return Petugas;
};
