const factoryGirl = require('factory-girl');
const { Exam, Subject, User } = require('../models');
const { LIVE, VALID } = require('../constants');
const { fetchAdminRole, fetchTeacherRole, fetchStudentRole } = require('../../src/utils/dbUtils');

const adapter = new factoryGirl.SequelizeAdapter();
const { factory } = factoryGirl;
factory.setAdapter(adapter);

factory.define('Exam', Exam, async (buildOptions) => {
  return ({
    examDate: factory.chance('date'),
    grade: factory.chance('character', { pool: 'ABCDE' }),
    subjectId: buildOptions.subjectId || factory.assoc('Subject', 'id'),
    studentId: buildOptions.studentId || factory.assoc('Student', 'id'),
    createdBy: buildOptions.teacherId || factory.assoc('Teacher', 'id'),
    status: buildOptions.status || VALID
  });
});

factory.define('Subject', Subject, (buildOptions) => {
  if (buildOptions.teacher) {
    return ({
      name: factory.chance('first'),
      teacherId: buildOptions.teacherId || factory.assoc('Teacher', 'id'),
      status: LIVE
    });
  }
  return ({
    name: factory.chance('first')
  });
});

factory.define('Student', User, async (buildOptions) => {
  return ({
    firstName: factory.chance('first'),
    lastName: factory.chance('last'),
    email: factory.chance('email', { domain: 'school.com' }),
    password: factory.chance('word'),
    roleId: await fetchStudentRole()
  });
});

factory.define('Teacher', User, async (buildOptions) => {
  return ({
    firstName: factory.chance('first'),
    lastName: factory.chance('last'),
    email: factory.chance('email', { domain: 'school.com' }),
    password: factory.chance('word'),
    roleId: await fetchTeacherRole()
  });
});

factory.define('Admin', User, async (buildOptions) => {
  return ({
    firstName: factory.chance('first'),
    lastName: factory.chance('last'),
    email: factory.chance('email', { domain: 'school.com' }),
    password: factory.chance('word'),
    roleId: await fetchAdminRole()
  });
});

module.exports = factory;
