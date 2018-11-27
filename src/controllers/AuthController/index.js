const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { catchErrors } = require('../../utils/errorHandlers');
const { User, Role } = require('../../../db/models');

const priCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/private.key'), 'utf8');
const pubCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/public.key'), 'utf8');

/**
 * VerifyToken
 *
 * Verifies a token
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The callback function
 * @returns {object} res The response object
 */
function VerifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (token) {
    const options = {
      expiresIn: '24h',
      algorithm: 'RS256',
    };
    const decoded = jwt.verify(token, pubCert, options);
    req.decoded = decoded;
    next();
  } else {
    return res.status(403).send({
      message: 'No token provided.',
    });
  }
}

/**
 * IsAdmin
 *
 * Check if current user has the admin role
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The callback function
 * @returns {object} res The response object
 */
async function IsAdmin(req, res, next) {
  const { id } = req.decoded;
  const [err, user] = await catchErrors(User.findOne({
    where: { id },
    attributes: ['id'],
    include: [{ model: Role, attributes: ['id', 'name'] }],
  }));
  if (err) {
    return res.status(500).send({
      message: 'An error occured',
      err
    });
  }

  const role = user.toJSON().Role;
  if (user.id === id && role && role.name === 'admin') {
    next();
  } else {
    return res.status(403).send({
      message: 'Not authorised to add user',
      err
    });
  }
}

/**
 * GenerateToken
 *
 * Generate a token
 *
 * @param {object} user The user object
 * @returns {string} token
 */
function GenerateToken(user) {
  return jwt.sign(user, priCert, {
    expiresIn: '24h',
    algorithm: 'RS256',
  });
}

module.exports = {
  VerifyToken,
  IsAdmin,
  GenerateToken
};
