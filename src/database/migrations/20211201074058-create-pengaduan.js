"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pengaduans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isiLaporan: {
        type: Sequelize.TEXT,
      },
      lampiran: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM("belumVerif", "proses", "selesai"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("pengaduans");
  },
};
