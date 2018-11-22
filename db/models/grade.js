/* eslint-disable func-names */


module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    score: {
      type: DataTypes.ENUM,
      values: ['A', 'B', 'C', 'D', 'E'],
    },
    status: DataTypes.BOOLEAN,
    dateCreated: DataTypes.DATE,
    dateModified: DataTypes.DATE,
  }, {});
  Grade.associate = function (models) {
  };
  return Grade;
};
