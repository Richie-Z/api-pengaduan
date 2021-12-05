"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pengaduan_tanggapans", {
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
      petugasId: {
        type: Sequelize.INTEGER,
        references: {
          model: "petugas",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      tanggapan: {
        type: Sequelize.TEXT,
      },
      detailPerubahan: {
        type: Sequelize.STRING,
      },
      lampiran: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("pengaduan_tanggapans");
  },
};
