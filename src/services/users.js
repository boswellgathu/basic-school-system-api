const validator = require('validator');

const validateUserData = (userData) => {
  if (!validator.isEmail(userData.email)) {
    return 'Email provided is invalid';
  }
  return {
    email: userData.email,
    firstName: validator.escape(userData.firstName),
    lastName: validator.escape(userData.lastName),
    userName: validator.escape(userData.userName),
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

const hashPassword = (password) {
  // do something here
}


module.exports = {
  validateUserData,
  verifyPassword,
};
