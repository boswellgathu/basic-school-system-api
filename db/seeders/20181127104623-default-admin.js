/* eslint-disable no-unused-vars */
const config = require('../../config/config');
const factory = require('../factories');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return factory.create('Admin', {}, {
      email: 'admin@gmail.com',
      password: config.adminLogin
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { email: ['admin@gmail.com'] });
  },
};
