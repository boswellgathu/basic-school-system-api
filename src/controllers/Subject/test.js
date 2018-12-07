const request = require('supertest');
const expect = require('expect');
const { User, Subject } = require('../../../db/models');
const { generateToken } = require('../Auth');
const factory = require('../../../db/factories');
const { LIVE, VALIDATION, ARCHIVED } = require('../../../db/constants');
const app = require('../../../index');

describe('Subject Controller', () => {
  let token;
  before(async () => {
    const adminUser = await factory.create('Admin');
    token = generateToken({ id: adminUser.id });
  });

  after(() => {
    Subject.destroy({ truncate: true, cascade: true });
    User.destroy({ truncate: true, cascade: true });
  });

  describe('POST /api', () => {
    let subject = {
      name: 'Controlling Drones for dummies'
    };
    let teacher;
    before(async () => {
      teacher = await factory.create('Teacher');
    });

    after(() => {
      Subject.destroy({ truncate: true, cascade: true });
      User.destroy({ where: { id: [teacher.id] }, cascade: true });
    });

    it('/subject', (done) => {
      request(app)
        .post('/api/subject')
        .send(subject)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe(subject.name);
          expect(res.body.status).toBe(VALIDATION);
          expect(res.body.teacherId).toBe(null);
          done();
        });
    });

    it('/subject', (done) => {
      subject = { name: 'herding ants for capibaras', teacherId: teacher.id };
      request(app)
        .post('/api/subject')
        .send(subject)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe(subject.name);
          expect(res.body.status).toBe(LIVE);
          expect(res.body.teacherId).toBe(teacher.id);
          done();
        });
    });
    it('/subject', (done) => {
      subject = { name: 'herding ants for capibaras' };
      request(app)
        .post('/api/subject')
        .send(subject)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('SequelizeUniqueConstraintError: Validation error');
          done();
        });
    });
  });

  describe('PUT /api/subject:id', () => {
    let createdSubject;
    before(async () => {
      const subject = { name: 'Controlling Drones for dummies' };
      createdSubject = await Subject.create(subject, { raw: true });
    });

    after(() => {
      Subject.destroy({ truncate: true, cascade: true });
    });

    it('updates subject name', (done) => {
      request(app)
        .put(`/api/subject/${createdSubject.id}`)
        .send({ name: 'what a lame name' })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe('what a lame name');
          expect(res.body.status).toBe(VALIDATION);
          expect(res.body.teacherId).toBe(null);
          done();
        });
    });

    it('returns 404 when subject is not found', (done) => {
      request(app)
        .put('/api/subject/2344')
        .send({ name: 'what a lame name' })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('Subject: 2344 does not exist');
          done();
        });
    });
  });

  describe('PUT /api/subject/archive/:id', () => {
    let createdSubject;
    let subject;
    before(async () => {
      subject = {
        name: 'Controlling Drones for dummies'
      };
      createdSubject = await Subject.create(subject, { raw: true });
    });

    after(() => {
      Subject.destroy({ truncate: true, cascade: true });
    });

    it('updates status to achived', (done) => {
      request(app)
        .put(`/api/subject/archive/${createdSubject.id}`)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe(subject.name);
          expect(res.body.status).toBe(ARCHIVED);
          expect(res.body.teacherId).toBe(null);
          done();
        });
    });

    it('returns 404 when subject is not found', (done) => {
      request(app)
        .put('/api/subject/archive/2344')
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('Subject: 2344 does not exist');
          done();
        });
    });
  });

  describe('PUT /api/subject/assign/:id', () => {
    let createdSubject;
    let subject;
    let teacher;
    before(async () => {
      subject = {
        name: 'Controlling Drones for dummies'
      };
      teacher = await factory.create('Teacher');
      createdSubject = await Subject.create(subject, { raw: true });
    });

    after(() => {
      Subject.destroy({ truncate: true, cascade: true });
      User.destroy({ where: { id: [teacher.id] }, cascade: true });
    });

    it('assigns subject to given teacher', (done) => {
      request(app)
        .put(`/api/subject/assign/${createdSubject.id}`)
        .send({ teacherId: teacher.id })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe(subject.name);
          expect(res.body.status).toBe(LIVE);
          expect(res.body.teacherId).toBe(teacher.id);
          done();
        });
    });

    it('does not assign when subject already has a teacher', (done) => {
      request(app)
        .put(`/api/subject/assign/${createdSubject.id}`)
        .send({ teacherId: 645 })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(202)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.message).toBe(
            `can't assign teacherId: 645 to Subject: ${createdSubject.id} with teacherId: ${teacher.id}`
          );
          done();
        });
    });

    it('returns 404 when subject is not found', (done) => {
      request(app)
        .put('/api/subject/assign/2344')
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('Subject: 2344 does not exist');
          done();
        });
    });
  });

  describe('PUT /api/subject/reassign/:id', () => {
    let createdSubject;
    let subject;
    let teacher1;
    let teacher2;
    before(async () => {
      [teacher1, teacher2] = await factory.createMany('Teacher', 2);
      subject = {
        name: 'Controlling Drones for dummies',
        teacherId: teacher1.id
      };
      createdSubject = await Subject.create(subject, { raw: true });
    });

    after(() => {
      Subject.destroy({ truncate: true, cascade: true });
      User.destroy({ where: { id: [teacher1.id, teacher2.id] }, cascade: true });
    });

    it('reassigns subject to given teacher', (done) => {
      request(app)
        .put(`/api/subject/reassign/${createdSubject.id}`)
        .send({ teacherId: teacher2.id })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.name).toBe(subject.name);
          expect(res.body.status).toBe(LIVE);
          expect(res.body.teacherId).toBe(teacher2.id);
          done();
        });
    });

    it('returns 404 when subject is not found', (done) => {
      request(app)
        .put('/api/subject/reassign/2344')
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('Subject: 2344 does not exist');
          done();
        });
    });
  });

  describe('GET /api/subject', () => {
    let teacher1;
    let teacher2;
    let newToken;
    let studentToken;
    before(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });

      [teacher1, teacher2] = await factory.createMany(
        'Teacher', 2
      );
      const student = await factory.create('Student');
      newToken = generateToken({ id: teacher1.id });
      studentToken = generateToken({ id: student.id });
      await factory.createMany('Subject', 2, {}, { teacher: true, teacherId: teacher1.id });
      await factory.createMany('Subject', 2);
      await factory.createMany('Subject', 2, {}, {
        teacher: true, teacherId: teacher2.id, status: ARCHIVED
      });
    });

    it('/api/subject - gets all subjects', (done) => {
      request(app)
        .get('/api/subject')
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(6);
          done();
        });
    });

    it('/api/subject - gets all subjects - limit & pageNo', (done) => {
      request(app)
        .get('/api/subject?limit=3&pageNo=0')
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(3);
          done();
        });
    });

    it('/api/subject - gets all subjects - limit only', (done) => {
      request(app)
        .get('/api/subject?limit=1')
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(1);
          done();
        });
    });

    it('/api/subject - gets all subjects - status', (done) => {
      request(app)
        .get(`/api/subject?status=${LIVE}`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(2);
          done();
        });
    });

    it('/api/subject - gets all subjects - teacherId', (done) => {
      request(app)
        .get(`/api/subject?teacherId=${teacher1.id}`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(2);
          done();
        });
    });

    it('/api/subject - gets all subjects - teacherId, status, limit', (done) => {
      request(app)
        .get(`/api/subject?status=${ARCHIVED}&teacherId=${teacher2.id}&limit=2`)
        .set('Accept', 'application/json')
        .set('x-access-token', newToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(2);
          done();
        });
    });

    it('/api/subject - should return an error to a student', (done) => {
      request(app)
        .get('/api/subject?limit=2')
        .set('Accept', 'application/json')
        .set('x-access-token', studentToken)
        .expect(403)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.message).toBe('Not authorised to perform this action');
          done();
        });
    });
  });
});
