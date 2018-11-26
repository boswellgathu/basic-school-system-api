const validator = require('validator');
const { User } = require('../../db/models');
const generateToken = require('../controllers/authController').GenerateToken;
const { catchErrors } = require('../utils/errorHandlers');

/**
 *
 * @param {object} userData - contains all user data in req.body
 * @returns {object} - validated userData
 */
const validateUserData = (userData) => {
  if (!validator.isEmail(userData.email)) {
    return 'Email provided is invalid';
  }
  return {
    email: userData.email,
    firstName: validator.escape(userData.firstName),
    lastName: validator.escape(userData.lastName),
    password: validator.escape(userData.password),
    confirmPassword: validator.escape(userData.confirmPassword),
  };
};

const verifyPassword = (userData) => {
  const { password, confirmPassword } = userData;
  if (password === confirmPassword) {
    return true;
  }
  return false;
};

/**
 *
 * Adds user to the db
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
      roleId: 1,
    }));
    if (err) {
      if (err.name.toLowerCase().includes('Sequelize')) {
        return { statusCode: 400, response: { Error: { [err.name]: err.parent.detail } } };
      }
      return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
    }
    const res = data.toJSON();
    const userData = {
      id: res.id,
      firstName: res.firstName,
      lastName: res.lastName,
      email: res.email,
      token: generateToken({ id: res.id }),
    };
    return { statusCode: 201, response: userData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
};

module.exports = {
  validateUserData,
  verifyPassword,
  addUser,
};
