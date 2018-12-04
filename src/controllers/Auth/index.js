const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { catchErrors } = require('../../utils/errorHandlers');
const { User, Role } = require('../../../db/models');
const { ADMIN, TEACHER } = require('../../../db/constants');

const priCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/private.key'), 'utf8');
const pubCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/public.key'), 'utf8');

/**
 * VerifyToken
 *
 * Verifies a token
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} res
 */
function VerifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (token) {
    try {
      const options = {
        expiresIn: '24h',
        algorithm: 'RS256',
      };
      const decoded = jwt.verify(token, pubCert, options);
      req.decoded = decoded;
      next();
    } catch (err) {
      return res.status(403).send({ Error: err.toString() });
    }
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
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} res
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
      message: 'An error occured, please try again later'
    });
  }
  if (!user) {
    return res.status(500).send({
      message: 'Access denied'
    });
  }

  const role = user.toJSON().Role;
  if (role && role.name === ADMIN) {
    next();
  } else {
    return res.status(403).send({
      message: 'Not authorised to perform this action'
    });
  }
}

/**
 * IsTeacher
 *
 * Check if current user has the teacher role
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} res
 */
async function IsTeacher(req, res, next) {
  const { id } = req.decoded;
  const [err, user] = await catchErrors(User.findOne({
    where: { id },
    attributes: ['id'],
    include: [{ model: Role, attributes: ['id', 'name'] }],
  }));
  if (err) {
    return res.status(500).send({
      message: 'An error occured, please try again later'
    });
  }
  if (!user) {
    return res.status(500).send({
      message: 'Access denied'
    });
  }

  const role = user.toJSON().Role;
  if (role && role.name === TEACHER) {
    next();
  } else {
    return res.status(403).send({
      message: 'Not authorised to perform this action'
    });
  }
}

/**
 * GenerateToken
 *
 * Generate a token
 *
 * @param {object} user - user object
 * @returns {string} token
 */
function generateToken(user) {
  return jwt.sign(user, priCert, {
    expiresIn: '24h',
    algorithm: 'RS256',
  });
}

module.exports = {
  VerifyToken,
  IsAdmin,
  generateToken,
  IsTeacher
};
