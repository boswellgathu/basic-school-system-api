const Joi = require('joi');
const Qs = require('qs');
const schemas = require('../../services/schemas');
const { validateUserData } = require('../../utils/dataValidateUtils');
const {
  verifyPassword,
  addUser,
  putUser,
  removeUser,
  authenticate,
  viewUser
} = require('../../services/users');


/**
 *Controller to authenticate user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
async function signIn(req, res) {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await authenticate(sanitizedData);
  return res.status(statusCode).send(response);
}

/**
 *Controller to create a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
async function createUser(req, res) {
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
}

/**
 *Controller to update a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
async function updateUser(req, res) {
  const user = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(user);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await putUser(sanitizedData);
  return res.status(statusCode).send(response);
}

/**
 *Controller to delete a user
 *
 * @param {object} req
 * @param {object} res
 * @returns
 */
async function deleteUser(req, res) {
  const user = { id: req.params.id };
  const sanitizedData = validateUserData(user);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { response, statusCode } = await removeUser(sanitizedData);
  return res.status(statusCode).send(response);
}

async function showUser(req, res) {
  const { error, value } = Joi.validate(Qs.parse(req.query), schemas.searchUserSchema);
  if (error) {
    return res.status(400).send({ validationError: error });
  }
  const queryParams = {
    ...value,
    user: {
      id: req.decoded.id,
      roleName: req.decoded.roleName
    }
  };
  const { response, statusCode } = await viewUser(queryParams);
  return res.status(statusCode).send(response);
}

module.exports = {
  signIn,
  createUser,
  updateUser,
  deleteUser,
  showUser
};
