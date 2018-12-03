/* eslint-disable no-unused-vars */
const { User } = require('../models');
const config = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return User.create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@gmail.com',
      password: config.adminLogin,
      roleId: 1
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { email: ['admin@gmail.com'] });
  },
};
