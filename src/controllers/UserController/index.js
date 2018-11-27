const {
  validateUserData,
  verifyPassword,
  addUser,
  putUser,
  removeUser,
  authenticate
} = require('../../services/users');


/**
 *Controller to authenticate user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
const signIn = async (req, res) => {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await authenticate(sanitizedData);
  return res.status(statusCode).send(response);
};

/**
 *Controller to create a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
const createUser = async (req, res) => {
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

/**
 *Controller to update a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
const updateUser = async (req, res) => {
  const user = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(user);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await putUser(sanitizedData);
  return res.status(statusCode).send(response);
};

/**
 *Controller to delete a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
const deleteUser = async (req, res) => {
  const user = { id: req.params.id };
  const sanitizedData = validateUserData(user);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await removeUser(sanitizedData);
  return res.status(statusCode).send(response);
};

module.exports = {
  signIn,
  createUser,
  updateUser,
  deleteUser
};
