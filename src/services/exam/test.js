const expect = require('expect');
const factory = require('../../../db/factories');
const { Exam, Subject, User } = require('../../../db/models');
const {
  addExam,
  patchExam,
  cancelExam,
  viewExam,
  examExists,
  fetchSubjectByTeacherId
} = require('./');


describe('Exam service', () => {
  let teacher;
  let teacher2;
  let student;
  let subject;
  let subject2;
  let subject3;
  let exam;

  before(async () => {
    teacher = await factory.create('Teacher');
    teacher2 = await factory.create('Teacher');
    student = await factory.create('Student');
    subject = await factory.create('Subject', {}, { teacher: true, teacherId: teacher.id });
    subject2 = await factory.create('Subject', {}, { teacher: true, teacherId: teacher.id });
    subject3 = await factory.create('Subject', {}, { teacher: true, teacherId: teacher2.id });
    exam = await factory.create('Exam', {}, { subjectId: subject.id, teacherId: subject.teacherId });
  });

  after(async () => {
    await Exam.destroy({ truncate: true, cascade: true });
    await Subject.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });
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

  describe('fetchSubjectByTeacherId', () => {
    it('finds a subject by its teacherId', async () => {
      const actual = await fetchSubjectByTeacherId(subject.teacherId);
      expect(actual).toEqual([subject.id, subject2.id]);
    });

    it('returns false when no subject has that teacherId', async () => {
      const actual = await fetchSubjectByTeacherId(345662882);
      expect(actual).toBeFalsy();
    });
  });

  describe('addExam', () => {
    let examAttrs;
    beforeEach(() => {
      examAttrs = {
        examDate: '2026-11-02T01:13:39.718Z',
        grade: 'A',
        subjectId: subject.id,
        studentId: student.id,
        createdBy: subject.teacherId
      };
    });

    it('creates an exam record in the db', async () => {
      const actual = await addExam(examAttrs);
      expect(actual.response.grade).toBe(examAttrs.grade);
      expect(actual.response.subjectId).toBe(subject.id);
      expect(actual.response.createdBy).toBe(subject.teacherId);
      expect(actual.statusCode).toBe(201);
    });

    it('returns error message when teacher does not teach any subjects', async () => {
      examAttrs = { ...examAttrs, createdBy: 40000036 };
      const actual = await addExam(examAttrs);
      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe(
        `Subject with teacherId: ${examAttrs.createdBy} not found`
      );
    });

    it('returns error message teacher does not teach this subject', async () => {
      examAttrs = { ...examAttrs, createdBy: teacher2.id };
      const actual = await addExam(examAttrs);
      expect(actual.statusCode).toBe(403);
      expect(actual.response.Error).toBe(
        `Not allowed. Only teacher teaching subjectId: ${examAttrs.subjectId} is allowed to add an exam record`
      );
    });
  });
});
