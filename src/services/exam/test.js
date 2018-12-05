const expect = require('expect');
const factory = require('../../../db/factories');
const { VALID, CANCELLED } = require('../../../db/constants');
const { Exam, Subject, User } = require('../../../db/models');
const {
  addExam,
  patchExam,
  cancelExam,
  viewExam,
  examExists,
  fetchSubjectByTeacherId,
  getOptions,
  isStudent
} = require('./');


describe('Exam service', () => {
  let teacher;
  let teacher2;
  let student;
  let student2;
  let subject;
  let subject2;
  let subject3;
  let exam;

  before(async () => {
    teacher = await factory.create('Teacher');
    teacher2 = await factory.create('Teacher');
    student = await factory.create('Student');
    student2 = await factory.create('Student');
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

  describe('patchExam', () => {
    it('updates an existing exam record', async () => {
      const actual = await patchExam({
        id: exam.id, teacherId: teacher.id, grade: 'D'
      });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.grade).toBe('D');
    });

    it('fails if updatingTeacher did not create the exam record', async () => {
      const actual = await patchExam({
        id: exam.id, teacherId: 4563232, grade: 'D'
      });
      expect(actual.statusCode).toBe(403);
      expect(actual.response.Error).toBe(
        `Not allowed. Only teacher teaching subjectId: ${exam.subjectId} is allowed to update that exam record`
      );
    });

    it('fails if exam does not exist', async () => {
      const actual = await patchExam({
        id: 4563892, teacherId: 4563232, grade: 'D'
      });
      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe('Exam: 4563892 does not exist');
    });
  });

  describe('cancelExam', () => {
    it('cancels an existing exam record', async () => {
      const actual = await cancelExam({
        id: exam.id, teacherId: teacher.id
      });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.status).toBe(CANCELLED);
    });

    it('fails if updatingTeacher did not create the exam record', async () => {
      const actual = await cancelExam({
        id: exam.id, teacherId: 4563232
      });
      expect(actual.statusCode).toBe(403);
      expect(actual.response.Error).toBe(
        `Not allowed. Only teacher teaching subjectId: ${exam.subjectId} is allowed to update that exam record`
      );
    });

    it('fails if exam does not exist', async () => {
      const actual = await cancelExam({
        id: 4563892, teacherId: 4563232, grade: 'D'
      });
      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe('Exam: 4563892 does not exist');
    });
  });

  describe('isStudent', () => {
    it('returns false if user is not a student', async () => {
      const actual = await isStudent(teacher.id);
      expect(actual).toBeFalsy();
    });

    it('returns false if user is not a student', async () => {
      const actual = await isStudent(student.id);
      expect(actual).toBeTruthy();
    });
  });

  describe('viewExam', () => {
    before(async () => {
      await factory.createMany('Exam', 2, {}, { subjectId: subject.id, teacherId: subject.teacherId });
      await factory.createMany('Exam', 2, {}, { studentId: student2.id });
      await factory.createMany('Exam', 2, {}, { subjectId: subject.id, teacherId: subject.teacherId, status: CANCELLED });
    });

    it('fetches all exam records', async () => {
      const actual = await viewExam({ userId: teacher.id });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length >= 2).toBeTruthy();
    });

    it('fetches all exam records with given query limit', async () => {
      const actual = await viewExam({ userId: teacher.id, limit: 1 });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 1).toBeTruthy();
    });

    it('fetches all exam records with given query - status - CANCELLED', async () => {
      const actual = await viewExam({ userId: teacher.id, status: CANCELLED });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length >= 2).toBeTruthy();
    });

    it('fetches all exam records with given query - status - VALID', async () => {
      const actual = await viewExam({ userId: teacher.id, status: VALID });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length >= 2).toBeTruthy();
    });

    it('fetches all exam records with given query - pageNo and limit', async () => {
      const actual = await viewExam({ userId: teacher.id, pageNo: 1, limit: 2 });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });

    it('fetches all exam records with given queryArgs', async () => {
      const actual = await viewExam({
        userId: teacher.id, createdBy: teacher.id, limit: 1, status: CANCELLED
      });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 1).toBeTruthy();
    });

    it('a student only sees their records', async () => {
      const actual = await viewExam({ userId: student2.id });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });
  });

  describe('getOptions', () => {
    it('constructions filter, sort and pagination keywords', async () => {
      const queryParams = {
        limit: 5, pageNo: 3, subjectId: 23, status: VALID
      };
      const actual = await getOptions(queryParams);
      expect(actual).toEqual({
        limit: 5, offset: 10, where: { subjectId: 23, status: VALID }
      });
    });

    it('does not add offset when either limit and offset not in queryParams', async () => {
      const queryParams = {
        contour: 20, limit: 23, subjectId: 23, status: VALID, drive: true
      };
      const actual = await getOptions(queryParams);
      expect(actual).toEqual({ limit: 23, where: { subjectId: 23, status: VALID } });
    });

    it('removes key, value not in specified expected keywords', async () => {
      const queryParams = {
        contour: 20, maten: 23, subjectId: 23, status: VALID, drive: true
      };
      const actual = await getOptions(queryParams);
      expect(actual).toEqual({ where: { subjectId: 23, status: VALID } });
    });
  });
});
