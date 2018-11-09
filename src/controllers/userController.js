const { validateUserData } = require('../services/users');
const { User } = require('../../db/models');


const CreateUser = (req, res) => {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  return User
    .create({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      userName: sanitizedData.lastName,
      email: sanitizedData.email,
    })
    .then(todo => res.status(201).send(todo))
    .catch(error => res.status(400).send({ Error: error.parent.detail }));
};

module.exports = {
  CreateUser,
};
