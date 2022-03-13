"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Petugas extends Model {
    static associate(models) {
      Petugas.hasMany(models.PengaduanTanggapan, {
        foreignKey: "petugasId",
        as: "tanggapan",
      });
    }
  }
  Petugas.init(
    {
      username: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
      },
      role: DataTypes.ENUM("admin", "operator"),
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Petugas",
      tableName: "petugas",
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password"] },
        },
      },
    }
  );
  return Petugas;
};
