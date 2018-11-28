const expect = require('expect');
const { fetchUser } = require('../../utils/dbUtils');
const {
  validateUserData,
  verifyPassword,
  addUser,
  userExists
} = require('./');


describe('user service', () => {
  let user;
  beforeEach(() => {
    user = {
      firstName: 'jwt',
      lastName: 'test',
      email: 'jwt.test35@gmail.com',
      password: '123Qwerty',
      confirmPassword: '123Qwerty'
    };
  });

  it('validateUserData returns validated data', () => {
    const actual = validateUserData(user);
    expect(actual).toEqual(user);
  });

  it('validateUserData returns error on invalid email', () => {
    user = { ...user, email: 'what is this' };
    const actual = validateUserData(user);
    expect(actual).toBe('Email provided is invalid');
  });

  it('validateUserData returns escaped data', () => {
    user = { ...user, firstName: "<script>alert('very_secret_data')</script>" };
    const expected = '&lt;script&gt;alert(&#x27;very_secret_data&#x27;)&lt;&#x2F;script&gt;';
    const actual = validateUserData(user);
    expect(actual.firstName).toBe(expected);
  });

  it('verifyPassword truthy on matching passwords', () => {
    const actual = verifyPassword(user);
    expect(actual).toBeTruthy();
  });

  it('verifyPassword falsy on unmatching passwords', () => {
    user = { ...user, password: 'does not match' };
    const actual = verifyPassword(user);
    expect(actual).toBeFalsy();
  });

  it('addUser', async () => {
    const actual = await addUser(user);
    expect(actual.response.id).toBeDefined();
    expect(actual.response.email).toBe(user.email);
    expect(actual.statusCode).toBe(201);
  });

  it('addUser error - SequelizeUniqueConstraintError', async () => {
    const actual = await addUser(user);
    expect(actual.statusCode).toBe(400);
    expect(actual.response.Error).toBe('SequelizeUniqueConstraintError: Validation error');
  });

  it('userExists', async () => {
    const expectedUser = await fetchUser(user.email);
    const actual = await userExists(expectedUser.id);
    expect(actual).toBeTruthy();
  });

  it('userExists - user not found', async () => {
    const actual = await userExists(40005074646);
    expect(actual).toBeFalsy();
  });
});
