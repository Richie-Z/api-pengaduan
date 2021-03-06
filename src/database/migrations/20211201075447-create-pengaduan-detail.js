"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pengaduan_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pengaduanId: {
        type: Sequelize.INTEGER,
        references: {
          model: "pengaduans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      masyarakatIp: {
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
    await queryInterface.dropTable("pengaduan_details");
  },
};
