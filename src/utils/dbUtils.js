const { Role, User } = require('../../db/models');
const { ADMIN, TEACHER, STUDENT } = require('../../db/constants');
const { catchErrors } = require('./errorHandlers');

async function fetchAdminRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: ADMIN }, attributes: ['id'] }
  ));
  if (err) {
    throw err;
  }
  return data.toJSON().id;
}

async function fetchTeacherRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: TEACHER }, attributes: ['id'] }
  ));
  if (err) {
    throw err;
  }
  return data.toJSON().id;
}

async function fetchStudentRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: STUDENT }, attributes: ['id'] }
  ));
  if (err) {
    throw err;
  }
  return data.toJSON().id;
}

async function fetchUser(email) {
  const [err, found] = await catchErrors(User.findOne({ where: { email } }));
  if (err) {
    throw err;
  }
  return found.toJSON();
}

module.exports = {
  fetchAdminRole,
  fetchTeacherRole,
  fetchStudentRole,
  fetchUser
};
