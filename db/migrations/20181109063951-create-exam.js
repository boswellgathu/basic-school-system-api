
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Exams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      examDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      grade: {
        type: Sequelize.ENUM,
        values: ['A', 'B', 'C', 'D', 'E'],
        allowNull: false,
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Subjects',
          key: 'id',
        },
      },
      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Subjects',
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
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Exams');
  }
};
