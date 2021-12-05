"use strict";

const bcrypt = require("bcrypt");
const saltRounds = 10;
const petugas = [
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
];
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("petugas", petugas);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("petugas", null, {});
  },
};
