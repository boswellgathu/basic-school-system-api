const { Role, User } = require('../../db/models');
const { catchErrors } = require('./errorHandlers');


const fetchStudentRole = async () => {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: 'student' }, attributes: ['id'] }
  ));
  if (err) {
    throw err;
  }
  return data.toJSON().id;
};

const fetchAdminRole = async () => {
  const [err, data] = await catchErrors(Role.findOne(
    { where: { name: 'admin' }, attributes: ['id'] }
  ));
  if (err) {
    throw err;
  }
  return data.toJSON().id;
};

const fetchUser = async (email) => {
  const [err, found] = await catchErrors(User.findOne({ where: { email } }));
  if (err) {
    throw err;
  }
  return found.toJSON();
};

module.exports = {
  fetchAdminRole,
  fetchStudentRole,
  fetchUser
};
