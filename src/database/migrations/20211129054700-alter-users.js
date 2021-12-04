"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "name", Sequelize.STRING, {
      after: "id",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "name");
  },
};
