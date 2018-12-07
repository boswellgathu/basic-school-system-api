const request = require('supertest');
const expect = require('expect');
const factory = require('../../../db/factories');
const { User } = require('../../../db/models');
const { generateToken } = require('../Auth');
const { fetchUser } = require('../../utils/dbUtils');
const app = require('../../../index');

describe('User Controller', () => {
  let user;
  let token;
  beforeEach(() => {
    user = {
      firstName: 'jwt',
      lastName: 'test',
      email: 'jwt.test34@gmail.com',
      password: '123Qwerty',
      confirmPassword: '123Qwerty'
    };
  });

  before(async () => {
    const adminUser = await factory.create('Admin');
    token = generateToken({ id: adminUser.id });
  });

  after(() => User.destroy({ truncate: true, cascade: true }));

  describe('POST /api', () => {
    it('/user', (done) => {
      request(app)
        .post('/api/user')
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.email).toBe(user.email);
          done();
        });
    });

    it('/user validation error', (done) => {
      request(app)
        .post('/api/user')
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.Error).toBe('SequelizeUniqueConstraintError: Validation error');
          done();
        });
    });

    it('/user validation error when passwords don\'t match', (done) => {
      user = { ...user, password: 'new_password' };
      request(app)
        .post('/api/user')
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body)
            .toEqual({ validationError: "password and confirm password don't match" });
          done();
        });
    });

    it('/user/signin', (done) => {
      request(app)
        .post('/api/user/signin')
        .send({ email: user.email, password: user.password })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.token).toBeDefined();
          expect(res.body.email).toBe(user.email);
          done();
        });
    });

    it('/user/signin - wrong password/username', (done) => {
      request(app)
        .post('/api/user/signin')
        .send({ email: user.email, password: 'pahala-peponi' })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.token).toBeUndefined();
          expect(res.body).toEqual({ message: 'wrong username or password' });
          done();
        });
    });
  });

  describe('PUT /api', () => {
    let userToUpdateId;
    before(async () => {
      const res = await fetchUser(user.email);
      userToUpdateId = res.id;
    });

    it('/user:id', (done) => {
      user = { ...user, email: 'updated@gmail.com' };
      request(app)
        .put(`/api/user/${userToUpdateId}`)
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ message: 'User updated successfully' });
          done();
        });
    });

    it('/user:id user not found', (done) => {
      user = { ...user, email: 'updated@gmail.com' };
      request(app)
        .put('/api/user/345')
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ Error: 'User: 345 does not exist' });
          done();
        });
    });
  });

  describe('DELETE /api', () => {
    let userToDeleteId;
    before(async () => {
      const res = await fetchUser(user.email);
      userToDeleteId = res.id;
    });
    it('/user:id', (done) => {
      request(app)
        .delete(`/api/user/${userToDeleteId}`)
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ message: 'User deleted successfully' });
          done();
        });
    });

    it('/user:id user not found', (done) => {
      request(app)
        .delete(`/api/user/${userToDeleteId}`)
        .send(user)
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(404)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toEqual({ Error: `User: ${userToDeleteId} does not exist` });
          done();
        });
    });
  });

  describe('GET /api/user', () => {
    let teacher;
    let adminToken;
    let teacherToken;
    let studentToken;
    before(async () => {
      await User.destroy({ truncate: true, cascade: true });

      const admin = await factory.create('Admin');
      teacher = await factory.create('Teacher');
      const student = await factory.create('Student');
      adminToken = generateToken({ id: admin.id });
      teacherToken = generateToken({ id: teacher.id });
      studentToken = generateToken({ id: student.id });
      await factory.createMany('Teacher', 2);
      await factory.createMany('Student', 4);
    });

    it('/api/user - gets all users - admin', (done) => {
      request(app)
        .get('/api/user')
        .set('Accept', 'application/json')
        .set('x-access-token', adminToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(8);
          done();
        });
    });

    it('/api/user - admin can sort for teachers', (done) => {
      request(app)
        .get('/api/user?userType=teacher')
        .set('Accept', 'application/json')
        .set('x-access-token', adminToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(3);
          done();
        });
    });

    it('/api/user - admin can sort for students', (done) => {
      request(app)
        .get('/api/user?userType=student')
        .set('Accept', 'application/json')
        .set('x-access-token', adminToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(5);
          done();
        });
    });

    it('/api/user - gets all students - teacher', (done) => {
      request(app)
        .get('/api/user')
        .set('Accept', 'application/json')
        .set('x-access-token', teacherToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(5);
          done();
        });
    });

    it('/api/user - gets all users - limit & pageNo', (done) => {
      request(app)
        .get('/api/user?limit=3&pageNo=0')
        .set('Accept', 'application/json')
        .set('x-access-token', teacherToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(3);
          done();
        });
    });

    it('/api/subject - gets all users - limit only', (done) => {
      request(app)
        .get('/api/user?limit=1')
        .set('Accept', 'application/json')
        .set('x-access-token', teacherToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(1);
          done();
        });
    });

    it('/api/user - returns student\'s data to a student', (done) => {
      request(app)
        .get('/api/user')
        .set('Accept', 'application/json')
        .set('x-access-token', studentToken)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.data.length).toBe(1);
          done();
        });
    });
  });
});
