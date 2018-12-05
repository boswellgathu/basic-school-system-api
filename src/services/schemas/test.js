const expect = require('expect');
const Joi = require('joi');
const { VALID, LIVE, VALIDATION } = require('../../../db/constants');
const { examSchema, userSchema, subjectSchema, patchExamSchema } = require('./');


describe('schemas', () => {
  describe('examSchema', () => {
    let examData;
    before(async () => {
      examData = {
        examDate: '02-03-2018',
        grade: 'A',
        subjectId: 14,
        studentId: 1,
        createdBy: 4
      };
    });

    it('validates on valid data', () => {
      const actual = Joi.validate(examData, examSchema);
      expect(actual.error).toBe(null);
      expect(actual.value.subjectId).toBe(examData.subjectId);
      expect(actual.value.grade).toBe(examData.grade);
      expect(actual.value.studentId).toBe(examData.studentId);
      expect(actual.value.createdBy).toBe(examData.createdBy);
    });

    it('returns optional fields when specified', () => {
      examData = { ...examData, status: VALID };
      const actual = Joi.validate(examData, examSchema);
      expect(actual.error).toBe(null);
      expect(actual.value.subjectId).toBe(examData.subjectId);
      expect(actual.value.grade).toBe(examData.grade);
      expect(actual.value.studentId).toBe(examData.studentId);
      expect(actual.value.createdBy).toBe(examData.createdBy);
      expect(actual.value.status).toBe(examData.status);
    });

    it('fails on invalid data', () => {
      examData = { ...examData, grade: 'K' };
      const actual = Joi.validate(examData, examSchema);
      expect(actual.error.toString()).toBe('ValidationError: child "grade" fails because ["grade" must be one of [A, B, C, D, E]]');
    });
  });

  describe('userSchema', () => {
    let userData;
    before(async () => {
      userData = {
        firstName: 'Jakaya',
        lastName: 'Mwenda',
        password: 'This is ridonculous',
        email: 'not@sure.com',
        roleId: 4
      };
    });

    it('validates on valid data', () => {
      const actual = Joi.validate(userData, userSchema);
      expect(actual.error).toBe(null);
      expect(actual.value).toEqual(userData);
    });

    it('fails on invalid data', () => {
      userData = { ...userData, email: 'whaaat' };
      const actual = Joi.validate(userData, userSchema);
      expect(actual.error.toString()).toBe('ValidationError: child "email" fails because ["email" must be a valid email]');
    });
  });

  describe('patchExamSchema', () => {
    let patchExamData;
    before(async () => {
      patchExamData = {
        id: 23,
        grade: 'A'
      };
    });

    it('validates on valid data', () => {
      const actual = Joi.validate(patchExamData, patchExamSchema);
      expect(actual.error).toBe(null);
      expect(actual.value).toEqual(patchExamData);
    });

    it('fails on invalid data', () => {
      patchExamData = { ...patchExamData, id: 'what the heck is an id' };
      const actual = Joi.validate(patchExamData, patchExamSchema);
      expect(actual.error.toString()).toBe('ValidationError: child "id" fails because ["id" must be a number]');
    });
  });

  describe('subjectSchema', () => {
    let subjectData;
    before(async () => {
      subjectData = {
        name: 'Keeping up with the madathians'
      };
    });

    it('validates on valid data', () => {
      const actual = Joi.validate(subjectData, subjectSchema);
      expect(actual.error).toBe(null);
      expect(actual.value.name).toBe(subjectData.name);
    });

    it('returns optional fields when specified', () => {
      subjectData = { ...subjectData, teacherId: 34, status: LIVE };
      const actual = Joi.validate(subjectData, subjectSchema);
      expect(actual.error).toBe(null);
      expect(actual.value.teacherId).toBe(subjectData.teacherId);
      expect(actual.value.status).toBe(subjectData.status);
    });

    it('fails on invalid data', () => {
      subjectData = { ...subjectData, status: 'invalid' };
      const actual = Joi.validate(subjectData, subjectSchema);
      expect(actual.error.toString()).toBe('ValidationError: child "status" fails because ["status" must be one of [live, archived, validation]]');
    });

    it('fails when status is specified and no teacherId', () => {
      subjectData = { name: 'Kissing the ring for beginners', status: VALIDATION };
      const actual = Joi.validate(subjectData, subjectSchema);
      expect(actual.error.toString()).toBe('ValidationError: "status" missing required peer "teacherId"');
    });
  });
});
