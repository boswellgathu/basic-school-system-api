const { validateUserData, verifyPassword, addUser } = require('../services/users');

const CreateUser = (req, res) => {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  if (!verifyPassword(req.body)) {
    return res.status(400).send({ validationError: 'password and confirm password don\'t match' });
  }

  const { response, statusCode } = addUser(sanitizedData);
  console.log(response, statusCode);
  return res.status(statusCode).send(response);
};

module.exports = {
  CreateUser,
};
