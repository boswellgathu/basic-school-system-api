const request = require('supertest');
const expect = require('expect');
const { User, Subject } = require('../../../db/models');
const { generateToken } = require('../Auth');
const { fetchTeacherRole, fetchAdmin } = require('../../utils/dbUtils');
const { LIVE, VALIDATION, ARCHIVED } = require('../../../db/constants');
const app = require('../../../index');

describe('Subject Controller', () => {
  let token;
  let roleId;
  before(async () => {
    const adminUser = await fetchAdmin();
    token = generateToken({ id: adminUser.id });
    roleId = await fetchTeacherRole();
  });

  describe('POST /api', () => {
    let subject = {
      name: 'Controlling Drones for dummies'
    };
    let teacher;
    before(async () => {
      teacher = await User.create({
        firstName: 'bravo',
        lastName: 'one',
        email: 'bravo.one@gmail.com',
        password: '123Qwerty',
        confirmPassword: '123Qwerty',
        roleId
      }, { raw: true });
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
      teacher = await User.create({
        firstName: 'bravo',
        lastName: 'one',
        email: 'bravo.one@gmail.com',
        password: '123Qwerty',
        confirmPassword: '123Qwerty',
        roleId
      }, { raw: true });
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
      [teacher1, teacher2] = await User.bulkCreate([{
        firstName: 'bravo',
        lastName: 'one',
        email: 'bravo.one@gmail.com',
        password: '123Qwerty',
        confirmPassword: '123Qwerty',
        roleId
      }, {
        firstName: 'cartinger',
        lastName: 'two',
        email: 'cartinger.two@gmail.com',
        password: '123Qwerty',
        confirmPassword: '123Qwerty',
        roleId
      }], { returning: true, raw: true });
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
});
