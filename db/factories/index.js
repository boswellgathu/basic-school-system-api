const factoryGirl = require('factory-girl');
const { Exam, Subject, User } = require('../models');

const { factory } = factoryGirl;

// factory.define('Exam', Exam, (buildOptions) => {
//   return {
//     examDate: factory.chance('date'),
//     grade: factory.chance('character', { pool: 'ABCDE' }),
//     subjectId: factory.assoc('Subject', { roleId: buildOptions.teacherRoleId }, 'id'),
//     studentId: factory.assoc('User', { roleId: buildOptions.studentRoleId }, 'id')
//   };
// });

factory.define('Subject', Subject, (buildOptions) => {
  return {
    name: factory.chance('first'),
    teacherId: factory.assoc('User', { roleId: buildOptions.roleId })
  };
});

factory.define('User', User, (buildOptions) => {
  return {
    firstName: factory.chance('first'),
    lastName: factory.chance('last'),
    email: factory.chance('email', { domain: 'school.com' }),
    password: factory.chance('word'),
    roleId: buildOptions.roleId
  };
});

module.exports = factory;
