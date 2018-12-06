const expect = require('expect');
const sinon = require('sinon');
const factory = require('../../../db/factories');
const { Subject, User } = require('../../../db/models');
const { LIVE, VALIDATION, ARCHIVED } = require('../../../db/constants');
const errorHandlers = require('../../utils/errorHandlers');
const {
  addSubject,
  patchSubject,
  archiveSubject,
  assignSubjectToTeacher,
  reassignSubjectToTeacher,
  subjectExists,
  viewSubject
} = require('./');

describe('subject service', () => {
  describe('subjectExists', () => {
    let expectedSubject;
    before(async () => {
      expectedSubject = await factory.create('Subject');
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
    });

    it('success', async () => {
      const actual = await subjectExists(expectedSubject.id);
      expect(actual.name).toBe(expectedSubject.name);
      expect(actual.status).toBe(VALIDATION);
      expect(actual.teacherId).toBeNull();
    });

    it('subject not found', async () => {
      const actual = await subjectExists(34567);
      expect(actual.name).toBeFalsy();
    });

    it('thrown error is caught and returned', async () => {
      const catchErrorsStub = sinon.stub(errorHandlers, 'catchErrors');
      catchErrorsStub.resolves([new Error('data.toJSON() is not a function?'), null]);
      const actual = await subjectExists(3454);
      expect(actual.statusCode).toBe(500);
      expect(actual.response).toEqual({ Error: 'Error: data.toJSON() is not a function?' });
      errorHandlers.catchErrors.restore();
    });

    it('object retuned is an err', async () => {
      const catchErrorsStub = sinon.stub(errorHandlers, 'catchErrors');
      catchErrorsStub.throws(new Error('data.toJSON() is not a function?'));
      const actual = await subjectExists(3454);

      expect(actual.statusCode).toBe(400);
      expect(actual.response.Error).toEqual({ Error: 'data.toJSON() is not a function?' });
      errorHandlers.catchErrors.restore();
    });
  });

  describe('addSubject', () => {
    let subject;
    let expectedTeacher;
    before(async () => {
      subject = {
        name: 'Beaver Architecture'
      };
      expectedTeacher = await factory.create('Teacher');
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });
    });

    it('add subject without teacherId', async () => {
      const actual = await addSubject(subject);
      expect(actual.statusCode).toBe(201);
      expect(actual.response.name).toBe(subject.name);
      expect(actual.response.status).toBe(VALIDATION);
      expect(actual.response.teacherId).toBe(null);
    });

    it('add subject with a teacherId', async () => {
      const { id } = expectedTeacher;
      subject = { name: 'Ant hill building for dummies', teacherId: id };
      const actual = await addSubject(subject);
      expect(actual.statusCode).toBe(201);
      expect(actual.response.name).toBe(subject.name);
      expect(actual.response.status).toBe(LIVE);
      expect(actual.response.teacherId).toBe(id);
    });

    it('add subject with non-existent teacherId', async () => {
      subject = { name: 'Cholestral extraction', teacherId: 2345 };
      const actual = await addSubject(subject);
      expect(actual.statusCode).toBe(400);
      expect(actual.response.Error).toBe(
        'SequelizeForeignKeyConstraintError: insert or update on table "Subjects" violates foreign key constraint "Subjects_teacherId_fkey"'
      );
    });
  });

  describe('patchSubject', () => {
    let expectedSubject;
    before(async () => {
      expectedSubject = await factory.create('Subject');
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
    });

    it('updates name of an existing subject', async () => {
      const subject = { name: 'whistling for novices', id: expectedSubject.id };
      const actual = await patchSubject(subject);

      expect(actual.statusCode).toBe(200);
      expect(actual.response.name).toBe('whistling for novices');
      expect(actual.response.id).toBe(subject.id);
    });

    it('returns an error when subject is not found', async () => {
      const subject = { name: 'whistling for novices', id: 647 };
      const actual = await patchSubject(subject);

      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe(`Subject: ${subject.id} does not exist`);
    });
  });

  describe('archiveSubject', () => {
    let subject;
    let expectedSubject;
    before(async () => {
      subject = {
        name: 'Silly walks for douchebags'
      };
      expectedSubject = await factory.create('Subject', {}, {
        name: subject.name
      });
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
    });

    it('archives an existing subject', async () => {
      const { id } = expectedSubject;
      const actual = await archiveSubject(id);

      expect(actual.statusCode).toBe(200);
      expect(actual.response.name).toBe(subject.name);
      expect(actual.response.id).toBe(id);
      expect(actual.response.status).toBe(ARCHIVED);
    });

    it('returns an error when subject is not found', async () => {
      const actual = await archiveSubject(687);

      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe('Subject: 687 does not exist');
    });
  });

  describe('assignSubjectToTeacher', () => {
    let subject;
    let expectedSubject;
    let expectedTeacher;
    before(async () => {
      subject = {
        name: 'Silly walks for douchebags'
      };
      expectedSubject = await factory.create('Subject', {}, {
        name: subject.name
      });

      expectedTeacher = await factory.create('Teacher');
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });
    });

    it('assigns teacher to an existing subject', async () => {
      const reqData = { id: expectedSubject.id, teacherId: expectedTeacher.id };
      const actual = await assignSubjectToTeacher(reqData);

      expect(actual.statusCode).toBe(200);
      expect(actual.response.name).toBe(subject.name);
      expect(actual.response.id).toBe(expectedSubject.id);
      expect(actual.response.teacherId).toBe(expectedTeacher.id);
    });

    it('does not assign a teacher to a subject already assigned a teacher', async () => {
      const reqData = { id: expectedSubject.id, teacherId: 645 };
      const actual = await assignSubjectToTeacher(reqData);

      expect(actual.statusCode).toBe(202);
      expect(actual.response.message).toBe(
        `can't assign teacherId: 645 to Subject: ${expectedSubject.id} with teacherId: ${expectedTeacher.id}`
      );
    });

    it('returns an error when subject is not found', async () => {
      const reqData = { id: 6573, teacherId: expectedTeacher.id };
      const actual = await assignSubjectToTeacher(reqData);

      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe('Subject: 6573 does not exist');
    });
  });

  describe('reassignSubjectToTeacher', () => {
    let subject;
    let expectedSubject;
    let expectedTeacher;
    let replacementTeacher;
    before(async () => {
      subject = {
        name: 'Silly walks for douchebags'
      };
      [expectedTeacher, replacementTeacher] = await factory.createMany(
        'Teacher', 2
      );

      expectedSubject = await factory.create('Subject', {}, {
        name: subject.name, teacher: true, teacherId: expectedTeacher.id
      });
    });

    after(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });
    });

    it('reassigns teacher to a an already assigned subject', async () => {
      const reqData = { id: expectedSubject.id, teacherId: replacementTeacher.id };
      const actual = await reassignSubjectToTeacher(reqData);

      expect(actual.statusCode).toBe(200);
      expect(actual.response.name).toBe(subject.name);
      expect(actual.response.id).toBe(expectedSubject.id);
      expect(actual.response.teacherId).toBe(replacementTeacher.id);
    });

    it('returns an error when subject is not found', async () => {
      const reqData = { id: 6573, teacherId: replacementTeacher.id };
      const actual = await reassignSubjectToTeacher(reqData);

      expect(actual.statusCode).toBe(404);
      expect(actual.response.Error).toBe('Subject: 6573 does not exist');
    });
  });

  describe('viewSubject', () => {
    let teacher1;
    let teacher2;
    before(async () => {
      await Subject.destroy({ truncate: true, cascade: true });
      await User.destroy({ truncate: true, cascade: true });

      [teacher1, teacher2] = await factory.createMany(
        'Teacher', 2
      );
      await factory.createMany('Subject', 2, {}, { teacher: true, teacherId: teacher1.id });
      await factory.createMany('Subject', 2);
      await factory.createMany('Subject', 2, {}, {
        teacher: true, teacherId: teacher2.id, status: ARCHIVED
      });
    });

    it('fetches all subject records', async () => {
      const actual = await viewSubject({});
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length).toBe(6);
    });

    it('fetches all subject records with given query limit', async () => {
      const actual = await viewSubject({ limit: 3 });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 3).toBeTruthy();
    });

    it('fetches all subject records with given query - status - LIVE', async () => {
      const actual = await viewSubject({ status: LIVE });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });

    it('fetches all subject records with given query - status - ARCHIVED', async () => {
      const actual = await viewSubject({ status: ARCHIVED });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });

    it('fetches all exam records with given query - pageNo and limit', async () => {
      const actual = await viewSubject({ pageNo: 1, limit: 2 });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });

    it('fetches all exam records with given queryArgs', async () => {
      const actual = await viewSubject({
        limit: 2, status: LIVE, teacherId: teacher1.id
      });
      expect(actual.statusCode).toBe(200);
      expect(actual.response.data.length === 2).toBeTruthy();
    });
  });
});
