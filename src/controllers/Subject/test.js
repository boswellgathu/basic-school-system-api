const request = require('supertest');
const expect = require('expect');
const { User, Subject } = require('../../../db/models');
const { generateToken } = require('../Auth');
const { fetchTeacherRole, fetchUser, fetchAdmin } = require('../../utils/dbUtils');
const { LIVE, VALIDATION, ARCHIVED } = require('../../../db/constants');
const app = require('../../../index');

describe('Subject Controller', () => {
  describe('Post /api', () => {
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
  });
});
