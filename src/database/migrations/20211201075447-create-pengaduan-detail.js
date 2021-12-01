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
      masyarakatIp: {
        type: Sequelize.TEXT,
      },
      pengurus: {
        type: Sequelize.STRING,
      },
      pengaduanId: {
        type: Sequelize.INTEGER,
        references: {
          model: "pengaduans",
          key: "id",
        },
        onDelete: "CASCADE",
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pengaduan_details");
  },
};
