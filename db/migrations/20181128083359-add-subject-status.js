const { statusEnum, VALIDATION } = require('../constants');

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.addColumn('Subjects', 'status', {
      type: Sequelize.ENUM,
      values: statusEnum,
      defaultValue: VALIDATION
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Subjects', 'status')
      .then(() => queryInterface.sequelize.query('DROP TYPE "enum_Subjects_status"'));
  }
};
