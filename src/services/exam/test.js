const expect = require('expect');
const factory = require('../../../db/factories');
const { Exam, Subject, User } = require('../../../db/models');
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

  before(async () => {
    teacher = await factory.create('Teacher');
    student = await factory.create('Student');
    subject = await factory.create('Subject', {}, { teacher: true });
    exam = await factory.create('Exam', {}, { subjectId: subject.id, teacherId: subject.teacherId });
  });

  describe('examExists', () => {
    it('finds an exam by its id', async () => {
      const actual = await examExists(exam.id);
      expect(actual.id).toBe(exam.id);
      expect(actual.studentId).toBe(exam.studentId);
      expect(actual.examDate).toEqual(exam.examDate);
      expect(actual.Subject.id).toBe(actual.subjectId);
      expect(actual.createdBy).toBe(actual.Subject.teacherId);
    });
  });
});
