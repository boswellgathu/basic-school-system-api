const dotenv = require('dotenv');

dotenv.config({
  silent: true,
});

module.exports = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  adminLogin: process.env.ADMINLOGIN
};
