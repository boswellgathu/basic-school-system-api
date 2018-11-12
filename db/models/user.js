const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});
  User.associate = (models) => {
    User.hasOne(models.Role);
  };
  User.prototype.authenticate = (password) => {
    bcrypt.compare(password, this.password, (err, res) => {
      return res;
    });
  };
  User.beforeCreate((user) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) {
          throw new Error('Error occured while try to save user to db');
        }
        user.password = hash;
      });
    });
  });
  return User;
};
