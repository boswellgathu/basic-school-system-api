
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StudentExams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Subjects',
          key: 'id',
        },
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      ExamId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Exams',
          key: 'id',
        },
      },
      GradeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Grades',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('StudentExams');
  }
};