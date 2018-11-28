const { Subject } = require('../../../db/models');
const { LIVE, ARCHIVED } = require('../../../db/constants')
const { catchErrors } = require('../../utils/errorHandlers');


/**
 * Check if subject with given subjectId exists
 *
 * @param {number} subjectId - id of the subject being checked
 * @returns object | boolean
 */
async function subjectExists(subjectId) {
  try {
    const [err, data] = await catchErrors(
      Subject.findOne({ where: { id: subjectId } })
    );
    if (err) {
      return { statusCode: 500, response: { Error: err.toString() } };
    }
    if (!data) {
      return false;
    }
    return data.toJSON();
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 *
 * @param {*} subject
 */
async function addSubject(subject) {
  if (subject.teacherId) {
    subject.status = LIVE;
  }

  try {
    const [err, data] = await catchErrors(Subject.create({ subject }));
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data.toJSON();
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
 *
 *
 * @param {*} subject
 */
async function patchSubject(subject) {
  try {
    const checkSubject = await subjectExists(subject.id);
    if (typeof checkSubject === 'object') {
      return checkSubject;
    }
    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${subject.id} does not exist` }
      };
    }

    const [err, data] = await catchErrors(
      Subject.update(
        { name: subject.name },
        { where: { id: subject.id }, returning: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data.toJSON();
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
 *
 *
 * @param {*} subjectId
 */
async function archiveSubject(subjectId) {
  try {
    const checkSubject = await subjectExists(subjectId);
    if (typeof checkSubject === 'object') {
      return checkSubject;
    }
    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${subjectId} does not exist` }
      };
    }

    const [err, data] = await catchErrors(
      Subject.update(
        { status: ARCHIVED },
        { where: { id: subjectId }, returning: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data.toJSON();
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
 *
 *
 * @param {*} reqData
 */
async function assignSubjectToTeacher(reqData) {
  try {
    const checkSubject = await subjectExists(reqData.id);
    if (typeof checkSubject === 'object') {
      return checkSubject;
    }

    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${reqData.id} does not exist` }
      };
    }

    if (!checkSubject.teacherId) {
      const [err, data] = await catchErrors(
        Subject.update(
          { teacherId: reqData.teacherId, status: LIVE },
          { where: { id: reqData.id }, returning: true }
        )
      );
      if (err) {
        return { statusCode: 400, response: { Error: err.toString() } };
      }
      const res = data.toJSON();
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
        message: `Subject: ${reqData.id} has a teacherId: ${teacherId} already`
      }
    };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 *
 *
 * @param {*} reqData
 */
async function reassignSubjectToTeacher(reqData) {
  try {
    const checkSubject = await subjectExists(reqData.id);
    if (typeof checkSubject === 'object') {
      return checkSubject;
    }

    if (!checkSubject) {
      return {
        statusCode: 404,
        response: { Error: `Subject: ${reqData.id} does not exist` }
      };
    }

    const [err, data] = await catchErrors(
      Subject.update(
        { teacherId: reqData.teacherId, status: LIVE },
        { where: { id: reqData.id }, returning: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data.toJSON();
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
  reassignSubjectToTeacher
};
