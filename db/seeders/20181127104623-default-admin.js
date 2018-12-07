/* eslint-disable no-unused-vars */
const { adminLogin } = require('../../config/config');
const factory = require('../factories');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await factory.create('Admin', {}, {
      email: 'admin@gmail.com',
      password: adminLogin
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { email: ['admin@gmail.com'] });
  },
};
