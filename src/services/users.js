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
  };
};

module.exports = {
  validateUserData,
};
