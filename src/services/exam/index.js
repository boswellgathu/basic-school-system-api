const { Exam, Subject, User } = require('../../../db/models');
const { LIVE, ARCHIVED } = require('../../../db/constants');
const errorHandlers = require('../../utils/errorHandlers');


/**
 * fetchSubjectByTeacherId
 *
 * gets a subject by the teacherId attribute of the subject
 *
 * @param {number} id - teacherId of the subject being fetched
 * @returns object | boolean
 */
async function fetchSubjectByTeacherId(teacherId) {
  try {
    const [err, data] = await errorHandlers.catchErrors(
      Subject.findAll(
        {
          where: { teacherId },
          attributes: ['id'],
          raw: true
        }
      )
    );
    if (err) {
      return { statusCode: 500, response: { Error: err.toString() } };
    }
    if (data.length === 0) {
      return false;
    }

    const subjects = [];
    data.map((subject) => {
      subjects.push(subject.id);
    });

    return subjects;
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * examExists
 *
 * Check if subject with given subjectId exists
 *
 * @param {number} subjectId - id of the subject being checked
 * @returns object | boolean
 */
async function examExists(examId) {
  try {
    const [err, data] = await errorHandlers.catchErrors(
      Exam.findOne(
        {
          where: { id: examId },
          include: [
            { model: Subject }
          ]
        }
      )
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
 * addExam
 *
 * Adds an exam to the db
 *
 * @param {object} subject - contains most of fields required
 * @returns {object} - status code and response - subject | error object
 */
async function addExam(exam) {
  try {
    const subjects = await fetchSubjectByTeacherId(exam.createdBy);
    if (!subjects) {
      return {
        statusCode: 404,
        response: {
          Error: `Subject with teacherId: ${exam.createdBy} not found`
        }
      };
    }
    if (!subjects.includes(exam.subjectId)) {
      return {
        statusCode: 403,
        response: {
          Error: `Not allowed. Only teacher teaching subjectId: ${exam.subjectId} is allowed to add an exam record`
        }
      };
    }
    const [err, res] = await errorHandlers.catchErrors(
      Exam.create(exam, { raw: true })
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const examData = {
      id: res.id,
      examDate: res.examDate,
      grade: res.grade,
      subjectId: res.subjectId,
      studentId: res.studentId,
      createdBy: res.createdBy
    };
    return { statusCode: 201, response: examData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * patchExam
 *
 * Updates the name of a exam
 *
 * @param {object} subject - exam data
 * @returns {object} - status code and response - subject | error object
 */
async function patchExam(exam) {
  try {
    const checkExam = await examExists(exam.id);
    if (typeof checkExam === 'object' && checkExam.statusCode) {
      return checkExam;
    }
    if (!checkExam) {
      return {
        statusCode: 404,
        response: { Error: `Exam: ${exam.id} does not exist` }
      };
    }

    const [err, data] = await errorHandlers.catchErrors(
      Exam.update(
        exam,
        { where: { id: exam.id }, returning: true, raw: true }
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
async function cancelExam(subjectId) {
  try {
    const checkExam = await examExists(subjectId);
    if (typeof checkExam === 'object' && checkExam.statusCode) {
      return checkExam;
    }
    if (!checkExam) {
      return {
        statusCode: 404,
        response: { Error: `Exam: ${subjectId} does not exist` }
      };
    }

    const [err, data] = await errorHandlers.catchErrors(
      Exam.update(
        { status: ARCHIVED, teacherId: null },
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
 * viewExam
 *
 * assigns a validation subject to a teacher and updates staus to live
 *
 * @param {object} reqData - id's of subject and teacher to be assigned
 * @returns {object} - status code and response - subject | error object
 */
async function viewExam(reqData) {
  try {
    const checkExam = await examExists(reqData.id);
    if (typeof checkExam === 'object' && checkExam.statusCode) {
      return checkExam;
    }
    if (!checkExam) {
      return {
        statusCode: 404,
        response: { Error: `Exam: ${reqData.id} does not exist` }
      };
    }

    if (!checkExam.teacherId) {
      const [err, data] = await errorHandlers.catchErrors(
        Exam.update(
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
    const { teacherId } = checkExam;
    return {
      statusCode: 202,
      response: {
        message: `can't assign teacherId: ${reqData.teacherId} to Exam: ${reqData.id} with teacherId: ${teacherId}`
      }
    };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

module.exports = {
  addExam,
  patchExam,
  cancelExam,
  viewExam,
  examExists,
  fetchSubjectByTeacherId
};
