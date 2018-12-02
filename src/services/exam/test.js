const expect = require('expect');
const factory = require('../../../db/factories');
const { Exam, Subject, User } = require('../../../db/models');
const { fetchTeacherRole, fetchStudentRole } = require('../../utils/dbUtils');
const {
  addExam,
  patchExam,
  cancelExam,
  viewExam,
  examExists
} = require('./');


describe('Exam service', () => {
  let teacher;
  let student;
  let subject;
  let exam;
  let studentRole;
  let teacherRole;
  before(async () => {
    studentRole = await fetchStudentRole();
    teacherRole = await fetchTeacherRole();
    studentRole = await fetchStudentRole();
    teacher = await factory.create('User', { roleId: teacherRole });
    // student = factory.create('User', { roleId: studentRole });
    subject = await factory.create('Subject', { roleId: teacherRole });
    // exam = await factory.create('Exam', {},
    //   { teacherRoleId: teacherRole, studentRoleId: studentRole });

    console.log('what is this', teacher.dataValues);
    console.log('what is this subject', subject.dataValues);
  });

  describe('examExists', () => {
    it('finds an exam by its id', async () => {
      const actual = await examExists(exam.dataValues.id);
      console.log(actual);
    });
  });
});
