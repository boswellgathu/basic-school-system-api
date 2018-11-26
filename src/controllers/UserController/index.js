const { validateUserData, verifyPassword, addUser } = require('../../services/users');

const CreateUser = async (req, res) => {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  if (!verifyPassword(sanitizedData)) {
    return res.status(400).send(
      { validationError: 'password and confirm password don\'t match' }
    );
  }

  const { response, statusCode } = await addUser(sanitizedData);
  return res.status(statusCode).send(response);
};

module.exports = {
  CreateUser,
};
