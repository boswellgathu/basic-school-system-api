const validator = require('validator');

/**
 *
 * Validates and escapes given fields
 * @param {object} userData - contains all user data in req.body
 * @returns {object} - validated userData
 */
function validateUserData(userData) {
  if (userData.email && !validator.isEmail(userData.email)) {
    return 'Email provided is invalid';
  }
  Object.keys(userData).map((field) => {
    userData[field] = validator.escape(userData[field].toString());
  });
  return userData;
}

module.exports = {
  validateUserData
};
