const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { catchErrors } = require('../../utils/errorHandlers');
const { fetchStudentRole, fetchAdminRole, fetchTeacherRole } = require('../../utils/dbUtils');
const { getOptions } = require('../../utils/dbUtils');
const { generateToken } = require('../../controllers/Auth');
const { STUDENT, TEACHER, ADMIN } = require('../../../db/constants');
const { User } = require('../../../db/models');


function verifyPassword(userData) {
  const { password, confirmPassword } = userData;
  if (password === confirmPassword) {
    return true;
  }
  return false;
}

/**
 * Check if user with given userId exists
 *
 * @param {number} userId - id of the user being checked
 * @returns object | boolean
 */
async function userExists(userId) {
  try {
    const [err, data] = await catchErrors(User.findOne({ where: { id: userId } }));
    if (err) {
      return { statusCode: 500, response: { Error: err.toString() } };
    }
    if (!data) {
      return false;
    }
    return true;
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 * Aauthenticates user
 *
 * @param {object} user - user object
 * @returns {object} - status code and response - ceated user || error object
 */
async function authenticate(user) {
  try {
    const [err, data] = await catchErrors(User.findOne({ where: { email: user.email } }));
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    if (!data) {
      return { statusCode: 400, response: { message: 'wrong username or password' } };
    }

    const res = data.toJSON();
    if (await bcrypt.compare(user.password, res.password)) {
      const userData = {
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
        token: generateToken({ id: res.id }),
      };
      return { statusCode: 200, response: userData };
    }
    return { statusCode: 400, response: { message: 'wrong username or password' } };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 * Adds user to the db
 *
 * @param {object} user - user object
 * @returns {object} - status code and response - ceated user || error object
 */
async function addUser(user) {
  try {
    const [err, data] = await catchErrors(User.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      roleId: user.roleId || await fetchStudentRole(),
    }));
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data.toJSON();
    const userData = {
      id: res.id,
      firstName: res.firstName,
      lastName: res.lastName,
      email: res.email
    };
    return { statusCode: 201, response: userData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 * updates an existing user
 *
 * @param {object} user - user object
 * @returns {object} - status code and response
 */
async function putUser(user) {
  try {
    const checkUser = await userExists(user.id);
    if (typeof checkUser === 'object') {
      return checkUser;
    }
    if (!checkUser) {
      return {
        statusCode: 404,
        response: { Error: `User: ${user.id} does not exist` }
      };
    }

    const [err, data] = await catchErrors(
      User.update(user, { individualHooks: true, where: { id: user.id } })
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    return { statusCode: 200, response: { message: 'User updated successfully' } };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 * Deletes a user from the db
 *
 * @param {object} user - user object
 * @returns {object} - status code and response
 */
async function removeUser(user) {
  try {
    const checkUser = await userExists(user.id);
    if (typeof checkUser === 'object') {
      return checkUser;
    }
    if (!checkUser) {
      return {
        statusCode: 404,
        response: { Error: `User: ${user.id} does not exist` }
      };
    }

    const [err, data] = await catchErrors(User.destroy({ where: { id: user.id } }));
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    return { statusCode: 200, response: { message: 'User deleted successfully' } };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

async function getRoleId(userType) {
  let roleId;
  if (userType === TEACHER) {
    roleId = await fetchTeacherRole();
  } else {
    roleId = await fetchStudentRole();
  }
  return roleId;
}


/**
 * viewUser
 *
 * loads subjects and filters on search params
 *
 * @param {object} reqData - data to filter on ?
 * @returns {object} - status code and response - subject | error object
 */
async function viewUser(reqData) {
  try {
    const expectedKeywords = ['pageNo', 'limit', 'userType'];
    const whereKeyWords = [];
    let options = getOptions(expectedKeywords, whereKeyWords, reqData);

    if (!options.limit) options.limit = 30;
    options.raw = true;

    if (reqData.user.roleName === STUDENT) {
      options = { where: { id: reqData.user.id } };
    }
    if (reqData.user.roleName === TEACHER) {
      const adminRole = await fetchAdminRole();
      const teacherRole = await fetchTeacherRole();
      options = {
        ...options,
        where: { roleId: { [Op.notIn]: [adminRole, teacherRole] } }
      };
    }
    if (reqData.user.roleName === ADMIN) {
      const adminRole = await fetchAdminRole();
      let roleOpts = { [Op.notIn]: [adminRole] };
      if (reqData.userType) {
        const roleId = await getRoleId(reqData.userType);
        roleOpts = roleId;
      }
      options = {
        ...options,
        where: { roleId: roleOpts }
      };
    }
    const [err, data] = await catchErrors(
      User.findAndCountAll(options)
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }

    return { statusCode: 200, response: { data: data.rows } };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

module.exports = {
  verifyPassword,
  authenticate,
  addUser,
  putUser,
  removeUser,
  userExists,
  viewUser
};
