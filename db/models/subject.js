/* eslint-disable func-names */
const { statusEnum, VALIDATION } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: statusEnum,
      defaultValue: VALIDATION
    }
  }, {});
  Subject.associate = (models) => {
    Subject.belongsTo(models.User, { as: 'teacherId' });
  };
  return Subject;
};
