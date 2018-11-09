const dotenv = require('dotenv');

dotenv.config({
  silent: true,
});

module.exports = {
  priCert: process.env.PRI_KEY,
  pubCert: process.env.PUB_KEY,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
};
