"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JwtToken extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {}
  }
  JwtToken.init(
    {
      token: DataTypes.TEXT,
      expiredAt: DataTypes.BIGINT,
      petugasId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "JwtToken",
      tableName: "jwt_tokens",
    }
  );
  return JwtToken;
};
