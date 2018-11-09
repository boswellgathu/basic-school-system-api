const jwt = require('jsonwebtoken');
const { pubCert, priCert } = require('../../config');

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
