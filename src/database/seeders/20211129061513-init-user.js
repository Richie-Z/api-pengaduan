"use strict";

const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Richie Zakaria",
          username: "richie",
          password: bcrypt.hashSync("richie", saltRounds),
          role: "admin",
        },
        {
          name: "Operator 1",
          username: "operator",
          password: bcrypt.hashSync("operator", saltRounds),
          role: "operator",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
