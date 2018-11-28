const bcrypt = require('bcryptjs');
const validator = require('validator');
const { User } = require('../../../db/models');
const { generateToken } = require('../../controllers/AuthController');
const { catchErrors } = require('../../utils/errorHandlers');
const { fetchStudentRole } = require('../../utils/dbUtils');

/**
 *
 * Validates and escapes given fields
 * @param {object} userData - contains all user data in req.body
 * @returns {object} - validated userData
 */
const validateUserData = (userData) => {
  if (userData.email && !validator.isEmail(userData.email)) {
    return 'Email provided is invalid';
  }
  Object.keys(userData).map((field) => {
    userData[field] = validator.escape(userData[field].toString());
  });
  return userData;
};

const verifyPassword = (userData) => {
  const { password, confirmPassword } = userData;
  if (password === confirmPassword) {
    return true;
  }
  return false;
};

/**
 * Check if user with given userId exists
 *
 * @param {number} userId - id of the user being checked
 * @returns object | boolean
 */
const userExists = async (userId) => {
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
};

/**
 *
 * Aauthenticates user
 *
 * @param {object} user - user object
 * @returns {object} - status code and response - ceated user || error object
 */
const authenticate = async (user) => {
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
};

/**
 *
 * Adds user to the db
 *
 * @param {object} user - user object
 * @returns {object} - status code and response - ceated user || error object
 */
const addUser = async (user) => {
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
};

/**
 *
 * updates an existing user
 *
 * @param {object} user - user object
 * @returns {object} - status code and response
 */
const putUser = async (user) => {
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

    const [err, data] = await catchErrors(User.update(user, { individualHooks: true, where: { id: user.id } }));
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    return { statusCode: 200, response: { message: 'User updated successfully' } };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
};

/**
 *
 * Deletes a user from the db
 *
 * @param {object} user - user object
 * @returns {object} - status code and response
 */
const removeUser = async (user) => {
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
};

module.exports = {
  validateUserData,
  verifyPassword,
  authenticate,
  addUser,
  putUser,
  removeUser,
  userExists
};
