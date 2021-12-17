"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Petugas extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {}
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
