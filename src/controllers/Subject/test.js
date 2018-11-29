const request = require('supertest');
const expect = require('expect');
const { User, Subject } = require('../../../db/models');
const { generateToken } = require('../Auth');
const { fetchTeacherRole, fetchUser, fetchAdmin } = require('../../utils/dbUtils');
const { LIVE, VALIDATION, ARCHIVED } = require('../../../db/constants');
const app = require('../../../index');

describe('Subject Controller', () => {
  describe('POST /api', () => {
    let subject = {
      name: 'Controlling Drones for dummies'
    };
    let token;
    let teacher;
    before(async () => {
      const adminUser = await fetchAdmin();
      teacher = await User.create({
        firstName: 'bravo',
        lastName: 'one',
        email: 'bravo.one@gmail.com',
        password: '123Qwerty',
        confirmPassword: '123Qwerty',
        roleId: await fetchTeacherRole()
      }, { raw: true });
      token = generateToken({ id: adminUser.id });
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
    let token;
    before(async () => {
      const subject = {
        name: 'Controlling Drones for dummies'
      };
      createdSubject = await Subject.create(subject, { raw: true });
      const adminUser = await fetchAdmin();
      token = generateToken({ id: adminUser.id });
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
});
