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
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
  };

  User.prototype.authenticate = (password) => {
    bcrypt.compare(password, this.password, (err, res) => {
      return res;
    });
  };

  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  });

  User.beforeUpdate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
    }
  });
  return User;
};
