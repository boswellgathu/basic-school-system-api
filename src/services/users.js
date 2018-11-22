const validator = require('validator');
const { User } = require('../../db/models');
const generateToken = require('../controllers/authController').GenerateToken;

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

const addUser = async (user) => {
  try {
    const res = await User.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      roleId: 1,
    });
    // .catch(err => ({ statusCode: 400, response: { Error: { [err.name]: err.message } } }));
    // res = res.dataValues;
    console.log('this is res: ', res);

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
