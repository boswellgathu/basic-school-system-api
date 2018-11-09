

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    address: DataTypes.STRING,
  }, {});
  User.associate = (models) => {
    User.hasOne(models.Role);
  };
  return User;
};
