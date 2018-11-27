const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { User } = require('../../../db/models');

const priCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/private.key'), 'utf8');
const pubCert = fs.readFileSync(path.resolve(__dirname, '../../utils/configs/public.key'), 'utf8');

/**
 * AuthHandler
 *
 * Handles Authentication
 * @class
 */
class AuthHandler {
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
  static VerifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, pubCert, (err, decoded) => {
        if (err) {
          return res.status(403).send({
            message: 'Failed to authenticate token.',
          });
        }
        req.decoded = decoded;
        next();
      });
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
  static async IsAdmin(req, res, next) {
    const { userId } = req.decoded.userId;
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: 'Role' }],
    });
    console.log(user);
  }

  /**
   * GenerateToken
   *
   * Generate a token
   *
   * @param {object} user The user object
   * @returns {string} token
   */
  static GenerateToken(user) {
    return jwt.sign(user, priCert, {
      expiresIn: '24h',
      algorithm: 'RS256',
    });
  }
}
module.exports = AuthHandler;
