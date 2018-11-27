
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      { name: 'admin' },
      { name: 'teacher' },
      { name: 'student' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles',
      { name: ['admin', 'teacher', 'student'] });
  }
};
