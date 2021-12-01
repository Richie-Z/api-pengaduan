"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jwt_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  jwt_token.init(
    {
      token: DataTypes.TEXT,
      expiredAt: DataTypes.BIGINT,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "jwt_token",
    }
  );
  return jwt_token;
};
