const { Role, User } = require('../../db/models');
const { ADMIN, TEACHER, STUDENT } = require('../../db/constants');
const { catchErrors } = require('./errorHandlers');

async function fetchAdminRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: ADMIN }, attributes: ['id'], raw: true }
  ));
  if (err) {
    throw err;
  }
  return data.id;
}

async function fetchTeacherRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: TEACHER }, attributes: ['id'], raw: true }
  ));
  if (err) {
    throw err;
  }
  return data.id;
}

async function fetchStudentRole() {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: STUDENT }, attributes: ['id'], raw: true }
  ));
  if (err) {
    throw err;
  }
  return data.id;
}

async function fetchUser(email) {
  const [err, found] = await catchErrors(User.findOne({ where: { email } }));
  if (err) {
    throw err;
  }
  return found;
}

async function fetchAdmin() {
  const roleId = await fetchAdminRole();
  const [err, found] = await catchErrors(
    User.findOne({ where: { roleId }, raw: true })
  );
  if (err) {
    throw err;
  }
  return found;
}

module.exports = {
  fetchAdminRole,
  fetchTeacherRole,
  fetchStudentRole,
  fetchUser,
  fetchAdmin
};
