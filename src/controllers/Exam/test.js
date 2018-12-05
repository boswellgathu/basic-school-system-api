const request = require('supertest');
const expect = require('expect');
const { User, Subject } = require('../../../db/models');
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
});
