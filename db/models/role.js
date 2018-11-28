/* eslint-disable func-names */
const { roleEnum, STUDENT } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.ENUM,
      values: roleEnum,
      unique: true,
      defaultValue: STUDENT
    },
  }, {});
  Role.associate = function (models) {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
  };
  return Role;
};
