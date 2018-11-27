/* eslint-disable func-names */

module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    examDate: DataTypes.DATE,
    grade: {
      type: DataTypes.ENUM,
      values: ['A', 'B', 'C', 'D', 'E'],
      allowNull: false,
    }
  }, {});
  Exam.associate = (models) => {
    Exam.hasOne(models.Subject, { as: 'subjectId' });
    Exam.hasOne(models.User, { as: 'studentId' });
  };
  return Exam;
};
