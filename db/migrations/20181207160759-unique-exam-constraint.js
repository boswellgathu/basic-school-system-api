
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint(
      'Exams',
      ['examDate', 'subjectId', 'studentId'],
      {
        type: 'unique',
        name: 'unique_exam_record'
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(
      'Exams',
      'unique_exam_record'
    );
  }
};
