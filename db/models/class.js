/* eslint-disable func-names */


module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    teacher: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {});
  Class.associate = function (models) {
    Class.hasOne(models.Subject);
  };
  return Class;
};
