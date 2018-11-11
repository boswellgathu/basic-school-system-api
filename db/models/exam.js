/* eslint-disable func-names */

module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    name: DataTypes.STRING,
    examDate: DataTypes.DATE,
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
  }, {});
  Exam.associate = function(models) {
    Exam.hasMany(models.Subject);
  };
  return Exam;
};
