/* eslint-disable func-names */
const { VALID, CANCELLED } = require('../constants');

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
    },
    status: {
      type: DataTypes.ENUM,
      values: [VALID, CANCELLED],
      defaultValue: VALID,
    },
  }, {});
  Exam.associate = (models) => {
    Exam.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    Exam.belongsTo(models.User, { foreignKey: 'studentId' });
  };
  return Exam;
};
