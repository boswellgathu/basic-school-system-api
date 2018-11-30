const { Subject } = require('../../../db/models');
const { LIVE, ARCHIVED } = require('../../../db/constants');
const errorHandlers = require('../../utils/errorHandlers');


/**
 * subjectExists
 *
 * Check if subject with given subjectId exists
 *
 * @param {number} subjectId - id of the subject being checked
 * @returns object | boolean
 */
async function subjectExists(subjectId) {
  try {
    const [err, data] = await errorHandlers.catchErrors(
      Subject.findOne({ where: { id: subjectId }, raw: true })
    );
    if (err) {
      return { statusCode: 500, response: { Error: err.toString() } };
    }
    if (!data) {
      return false;
    }
    return data;
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * addSubject
 *
 * Adds a subject to the db
 *
 * @param {object} subject - contains most of fields required
 * @returns {object} - status code and response - subject | error object
 */
async function addSubject(subject) {
  if (subject.teacherId) {
    subject.status = LIVE;
  }
  try {
    const [err, res] = await errorHandlers.catchErrors(
      Subject.create(subject, { raw: true })
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const subjectData = {
      id: res.id,
      name: res.name,
      teacherId: res.teacherId,
      status: res.status
    };
    return { statusCode: 201, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * patchSubject
 *
 * Updates the name of a subject
 *
 * @param {object} subject - subject name and id
 * @returns {object} - status code and response - subject | error object
 */
async function patchSubject(subject) {
  try {
    const checkSubject = await subjectExists(subject.id);
    if (typeof checkSubject === 'object' && checkSubject.statusCode) {
      return checkSubject;
    }
    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${subject.id} does not exist` }
      };
    }

    const [err, data] = await errorHandlers.catchErrors(
      Subject.update(
        { name: subject.name },
        { where: { id: subject.id }, returning: true, raw: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }

    const res = data[1][0];
    const subjectData = {
      id: res.id,
      name: res.name,
      teacherId: res.teacherId,
      status: res.status
    };
    return { statusCode: 200, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * archiveSubject
 *
 * archives specified subject - to change status to archived
 *
 * @param {number} subjectId - id of specified subject
 * @returns {object} - status code and response - subject | error object
 */
async function archiveSubject(subjectId) {
  try {
    const checkSubject = await subjectExists(subjectId);
    if (typeof checkSubject === 'object' && checkSubject.statusCode) {
      return checkSubject;
    }
    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${subjectId} does not exist` }
      };
    }

    const [err, data] = await errorHandlers.catchErrors(
      Subject.update(
        { status: ARCHIVED },
        { where: { id: subjectId }, returning: true, raw: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data[1][0];
    const subjectData = {
      id: res.id,
      name: res.name,
      teacherId: res.teacherId,
      status: res.status
    };
    return { statusCode: 200, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * assignSubjectToTeacher
 *
 * assigns a validation subject to a teacher and updates staus to live
 *
 * @param {object} reqData - id's of subject and teacher to be assigned
 * @returns {object} - status code and response - subject | error object
 */
async function assignSubjectToTeacher(reqData) {
  try {
    const checkSubject = await subjectExists(reqData.id);
    if (typeof checkSubject === 'object' && checkSubject.statusCode) {
      return checkSubject;
    }
    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${reqData.id} does not exist` }
      };
    }

    if (!checkSubject.teacherId) {
      const [err, data] = await errorHandlers.catchErrors(
        Subject.update(
          { teacherId: reqData.teacherId, status: LIVE },
          { where: { id: reqData.id }, returning: true, raw: true }
        )
      );
      if (err) {
        return { statusCode: 400, response: { Error: err.toString() } };
      }
      const res = data[1][0];
      const subjectData = {
        id: res.id,
        name: res.name,
        teacherId: res.teacherId,
        status: res.status
      };
      return { statusCode: 200, response: subjectData };
    }
    const { teacherId } = checkSubject;
    return {
      statusCode: 202,
      response: {
        message: `can't assign teacherId: ${reqData.teacherId} to Subject: ${reqData.id} with teacherId: ${teacherId}`
      }
    };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * reassignSubjectToTeacher
 *
 * reassigns a subject to another teacher
 *
 * @param {object} reqData - id's of subject and teacher to be assigned
 * @returns {object} - status code and response - subject | error object
 */
async function reassignSubjectToTeacher(reqData) {
  try {
    const checkSubject = await subjectExists(reqData.id);
    if (typeof checkSubject === 'object' && checkSubject.statusCode) {
      return checkSubject;
    }

    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${reqData.id} does not exist` }
      };
    }

    const [err, data] = await errorHandlers.catchErrors(
      Subject.update(
        { teacherId: reqData.teacherId, status: LIVE },
        { where: { id: reqData.id }, returning: true, raw: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data[1][0];
    const subjectData = {
      id: res.id,
      name: res.name,
      teacherId: res.teacherId,
      status: res.status
    };
    return { statusCode: 200, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}


module.exports = {
  addSubject,
  patchSubject,
  archiveSubject,
  assignSubjectToTeacher,
  reassignSubjectToTeacher,
  subjectExists
};
