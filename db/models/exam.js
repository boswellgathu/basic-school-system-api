/* eslint-disable func-names */

module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    name: DataTypes.STRING
  }, {});
  Exam.associate = function(models) {
  };
  return Exam;
};
