"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JwtToken extends Model {
    static associate(models) {}
  }
  JwtToken.init(
    {
      token: DataTypes.TEXT,
      expiredAt: DataTypes.BIGINT,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "JwtToken",
      tableName: "jwt_tokens",
    }
  );
  return JwtToken;
};
