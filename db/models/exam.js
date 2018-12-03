/* eslint-disable func-names */

module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    examDate: DataTypes.DATE,
    grade: {
      type: DataTypes.ENUM,
      values: ['A', 'B', 'C', 'D', 'E'],
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Exam.associate = (models) => {
    Exam.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    Exam.belongsTo(models.User, { foreignKey: 'studentId' });
  };
  return Exam;
};
