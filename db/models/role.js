/* eslint-disable func-names */


module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.ENUM,
      values: ['admin', 'teacher', 'student'],
      unique: true,
    },
  }, {});
  Role.associate = function (models) {
    // associations can be defined here
  };
  return Role;
};
