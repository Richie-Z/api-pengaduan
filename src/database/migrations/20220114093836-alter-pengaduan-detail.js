'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.alterTable("pengaduan_details", {
      nama: {
        type: Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pengaduan_tanggapans");
  }
};
