const request = require('supertest');
const expect = require('expect');
const { User, Subject, Exam } = require('../../../db/models');
const { generateToken } = require('../Auth');
const { VALID, CANCELLED } = require('../../../db/constants');
const factory = require('../../../db/factories');
const app = require('../../../index');


describe('Exam controller', () => {
  let token;
  let teacher;

  before(async () => {
    teacher = await factory.create('Teacher');
    token = generateToken({ id: teacher.id });
  });

  after(async () => {
    await Exam.destroy({ truncate: true, cascade: true });
    await Subject.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });
  });

  describe('POST /api', () => {
    let examData;
    let subject;
    let student;
    before(async () => {
      subject = await factory.create(
        'Subject', {}, { teacher: true, teacherId: teacher.id }
      );
      student = await factory.create('Student');
      examData = {
        examDate: '02-03-2018',
        grade: 'A',
        subjectId: subject.id,
        studentId: student.id,
        createdBy: teacher.id
      };
    });

    it('/exam - saves exam to db', (done) => {
      request(app)
        .post('/api/exam')
        .send(examData)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.grade).toBe(examData.grade);
          expect(res.body.status).toBe(VALID);
          expect(res.body.teacherId).toBe(examData.teacherId);
          expect(res.body.studentId).toBe(examData.studentId);
          done();
        });
    });

    it('/exam - returns an error incase of missing subject ot teacher Id', (done) => {
      examData = { ...examData, studentId: 3400 };
      request(app)
        .post('/api/exam')
        .send(examData)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ Error: 'SequelizeForeignKeyConstraintError: insert or update on table "Exams" violates foreign key constraint "Exams_studentId_fkey"' });
          done();
        });
    });

    it('/exam - returns an error when invalid grade is used', (done) => {
      examData = { ...examData, grade: 'K' };
      request(app)
        .post('/api/exam')
        .send(examData)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ validationError: 'ValidationError: child "grade" fails because ["grade" must be one of [A, B, C, D, E]]' });
          done();
        });
    });
  });

  describe('PUT /api', () => {
    let exam;
    let examPatchData;
    let teacher2;
    let token2;
    before(async () => {
      const subject = await factory.create('Subject', {},
        { teacher: true, teacherId: teacher.id });
      exam = await factory.create('Exam', {},
        { subjectId: subject.id, teacherId: teacher.id });
      examPatchData = {
        id: exam.id,
        grade: 'E'
      };
      teacher2 = await factory.create('Teacher');
      token2 = generateToken({ id: teacher2.id });
    });

    it('/exam - patches exam data', (done) => {
      request(app)
        .put(`/api/exam/${examPatchData.id}`)
        .send(examPatchData)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual(examPatchData);
          done();
        });
    });

    it('/exam - returns error when exam is not found', (done) => {
      examPatchData = { ...examPatchData, id: 345666 };
      request(app)
        .put(`/api/exam/${examPatchData.id}`)
        .send(examPatchData)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe(`Exam: ${examPatchData.id} does not exist`);
          done();
        });
    });

    it('/exam - errors on a teacher who did not create the exam, tries to update it', (done) => {
      examPatchData = { ...examPatchData, id: exam.id };
      request(app)
        .put(`/api/exam/${examPatchData.id}`)
        .send(examPatchData)
        .set('Accept', 'application/json')
        .set('x-access-token', token2)
        .expect(403)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe(
            'Not allowed. '
             + `Only teacher teaching subjectId: ${exam.subjectId} `
             + 'is allowed to update that exam record'
          );
          done();
        });
    });
  });

  describe('PUT /api/exam', () => {
    let exam;
    let teacher2;
    let token2;
    before(async () => {
      const subject = await factory.create('Subject', {},
        { teacher: true, teacherId: teacher.id });
      exam = await factory.create('Exam', {},
        { subjectId: subject.id, teacherId: teacher.id });
      teacher2 = await factory.create('Teacher');
      token2 = generateToken({ id: teacher2.id });
    });

    it('/invalidate - invalidates an exam', (done) => {
      request(app)
        .put(`/api/exam/invalidate/${exam.id}`)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ id: exam.id, status: CANCELLED });
          done();
        });
    });

    it('/invalidate - returns error when exam is not found', (done) => {
      request(app)
        .put('/api/exam/invalidate/20989')
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('Exam: 20989 does not exist');
          done();
        });
    });

    it('/invalidate - errors on a teacher who did not create the exam, tries to update it', (done) => {
      request(app)
        .put(`/api/exam/invalidate/${exam.id}`)
        .set('Accept', 'application/json')
        .set('x-access-token', token2)
        .expect(403)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe(
            'Not allowed. '
             + `Only teacher teaching subjectId: ${exam.subjectId} `
             + 'is allowed to update that exam record'
          );
          done();
        });
    });
  });

  describe('GET /api/exam', () => {
    let exam;
    let newTeacher;
    let newToken;
    let studentToken;
    let subject;
    let student;
    before(async () => {
      await Exam.destroy({ truncate: true, cascade: true });
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });
      newTeacher = await factory.create('Teacher');
      student = await factory.create('Student');
      newToken = generateToken({ id: newTeacher.id });
      studentToken = generateToken({ id: student.id });
      subject = await factory.create('Subject', {},
        { teacher: true, teacherId: newTeacher.id });
      exam = await factory.createMany('Exam', 3, {},
        { subjectId: subject.id, teacherId: newTeacher.id });
      exam = await factory.createMany('Exam', 2, {},
        { subjectId: subject.id, teacherId: newTeacher.id, studentId: student.id });
      await factory.createMany('Exam', 3);
    });

    it('/api/exam - gets all exams - limit & pageNo', (done) => {
      request(app)
        .get('/api/exam?limit=3&pageNo=0')
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(3);
          done();
        });
    });

    it('/api/exam - gets all exams - limit only', (done) => {
      request(app)
        .get('/api/exam?limit=1')
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(1);
          done();
        });
    });

    it('/api/exam - gets all exams - status', (done) => {
      request(app)
        .get(`/api/exam?status=${VALID}`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(8);
          done();
        });
    });

    it('/api/exam - gets all exams - subjectId', (done) => {
      request(app)
        .get(`/api/exam?subjectId=${subject.id}`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(5);
          done();
        });
    });

    it('/api/exam - gets all exams - subjectId, status, limit', (done) => {
      request(app)
        .get(`/api/exam?status=${VALID}&subjectId=${subject.id}&limit=2`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(2);
          done();
        });
    });

    it('/api/exam - should return to a student only their exam records', (done) => {
      request(app)
        .get(`/api/exam?status=${VALID}&subjectId=${subject.id}&limit=2`)
        .set('Accept', 'application/json')
        .set('x-access-token', studentToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(2);
          expect(
            res.body.data.every(examRecord => examRecord.studentId == student.id)
          ).toBeTruthy();
          done();
        });
    });
  });
});
