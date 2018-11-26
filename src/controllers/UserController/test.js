const request = require('supertest');
const expect = require('expect');
const app = require('../../../index');

describe('users', () => {
  let user = {
    firstName: 'jwt',
    lastName: 'test',
    email: 'jwt.test34@gmail.com',
    password: '123Qwerty',
    confirmPassword: '123Qwerty'
  };

  it('POST api/user', (done) => {
    request(app)
      .post('/api/user')
      .send(user)
      .set('Accept', 'application/json')
      .expect(201)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toBe(user.email);
        done();
      });
  });

  it('POST api/user validation error', (done) => {
    request(app)
      .post('/api/user')
      .send(user)
      .set('Accept', 'application/json')
      .expect(400)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.token).toBeUndefined();
        expect(res.body.Error)
          .toEqual({ SequelizeUniqueConstraintError: `Key (email)=(${user.email}) already exists.` });
        done();
      });
  });

  it('POST api/user validation error when passwords don\'t match', (done) => {
    user = { ...user, password: 'new_password' };
    request(app)
      .post('/api/user')
      .send(user)
      .set('Accept', 'application/json')
      .expect(400)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.token).toBeUndefined();
        expect(res.body)
          .toEqual({ validationError: "password and confirm password don't match" });
        done();
      });
  });
});
