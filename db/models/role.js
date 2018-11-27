/* eslint-disable func-names */


module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.ENUM,
      values: ['admin', 'teacher', 'student'],
      unique: true,
      alowNull: false,
    },
  }, {});
  Role.associate = function (models) {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
  };
  return Role;
};
