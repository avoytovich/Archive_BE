'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Archives", "group", {
      type: Sequelize.STRING,
      allowNull: true, // Adjust as needed
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Archives", "group");
  },
};

