/* eslint-disable func-names */


module.exports = (sequelize, DataTypes) => {
  const StudentExam = sequelize.define('StudentExam', {
  }, {});
  StudentExam.associate = function (models) {
    StudentExam.belongsTo(models.User);
    StudentExam.hasOne(models.Subject);
    StudentExam.hasOne(models.Grade);
    StudentExam.belongsTo(models.Exam);
  };
  return StudentExam;
};
