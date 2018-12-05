const { Exam, Subject, User, Role } = require('../../../db/models');
const { CANCELLED, STUDENT } = require('../../../db/constants');
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
      createdBy: res.createdBy,
      status: res.status
    };
    return { statusCode: 201, response: examData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * patchExam
 *
 * Updates the grade of an exam
 *
 * @param {object} exam - exam data
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
    const subjectTeacherIds = [checkExam.Subject.teacherId, checkExam.createdBy];
    if (subjectTeacherIds.every(id => id !== exam.teacherId)) {
      return {
        statusCode: 403,
        response: {
          Error: `Not allowed. Only teacher teaching subjectId: ${checkExam.subjectId} is allowed to update that exam record`
        }
      };
    }
    const [err, data] = await errorHandlers.catchErrors(
      Exam.update(
        { grade: exam.grade },
        { where: { id: exam.id }, returning: true, raw: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }

    const res = data[1][0];
    const subjectData = {
      id: res.id,
      grade: res.grade
    };
    return { statusCode: 200, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

/**
 * cancelExam
 *
 * cancel an existing exam - change status to cancelled
 *
 * @param {object} exam - { examId, teacherUpdating } - id of specified exam
 * @returns {object} - status code and response - subject | error object
 */
async function cancelExam(exam) {
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
    const subjectTeacherIds = [checkExam.Subject.teacherId, checkExam.createdBy];
    if (subjectTeacherIds.every(id => id !== exam.teacherId)) {
      return {
        statusCode: 403,
        response: {
          Error: `Not allowed. Only teacher teaching subjectId: ${checkExam.subjectId} is allowed to update that exam record`
        }
      };
    }
    const [err, data] = await errorHandlers.catchErrors(
      Exam.update(
        { status: CANCELLED },
        { where: { id: exam.id }, returning: true, raw: true }
      )
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }
    const res = data[1][0];
    const subjectData = {
      id: res.id,
      status: res.status
    };
    return { statusCode: 200, response: subjectData };
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}

function getOptions(queryData) {
  const expectedKeywords = [
    'pageNo', 'limit', 'status',
    'createdBy', 'subjectId',
    'studentId', 'examDate', 'grade'
  ];
  let validQueryArgs = Object.entries(queryData).reduce((acc, [key, value]) => {
    if (expectedKeywords.includes(key)) {
      return { ...acc, [key]: value };
    }
    return { ...acc };
  }, {});

  if (['limit', 'pageNo'].every(arg => arg in validQueryArgs)) {
    if (validQueryArgs.pageNo === 0) validQueryArgs.pageNo += 1;
    validQueryArgs.offset = validQueryArgs.limit * (validQueryArgs.pageNo - 1);
    delete validQueryArgs.pageNo;
  } else if ('pageNo' in validQueryArgs) {
    delete validQueryArgs.pageNo;
  }
  const where = {};
  const args = ['status', 'createdBy', 'subjectId', 'studentId', 'examDate', 'grade'];
  args.map((arg) => {
    if (arg in validQueryArgs) {
      where[arg] = validQueryArgs[arg];
      delete validQueryArgs[arg];
    }
  });
  validQueryArgs = { ...validQueryArgs, where };
  return validQueryArgs;
}

async function isStudent(userId) {
  try {
    let [err, data] = await errorHandlers.catchErrors(
      User.findOne(
        {
          where: { id: userId },
          include: [{ model: Role, attributes: ['name'] }],
        }
      )
    );
    if (err) {
      return { statusCode: 500, response: { Error: err.toString() } };
    }
    data = data.toJSON();
    if (!data) {
      return false;
    }

    return data.Role.name === STUDENT;
  } catch (err) {
    return { statusCode: 400, response: { Error: { [err.name]: err.message } } };
  }
}
/**
 * viewExam
 *
 * loads exams and filters on search params
 *
 * @param {object} reqData - data to filter on ?
 * @returns {object} - status code and response - subject | error object
 */
async function viewExam(reqData) {
  try {
    const options = getOptions(reqData);
    const checkIfStudent = await isStudent(reqData.userId);

    if (typeof checkIfStudent === 'object' && checkIfStudent.statusCode) {
      return checkIfStudent;
    }

    if (checkIfStudent) {
      options.where.studentId = reqData.userId;
    }

    if (!options.limit) options.limit = 30;
    options.raw = true;
    const [err, data] = await errorHandlers.catchErrors(
      Exam.findAndCountAll(options)
    );
    if (err) {
      return { statusCode: 400, response: { Error: err.toString() } };
    }

    return { statusCode: 200, response: { data: data.rows } };
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
  fetchSubjectByTeacherId,
  getOptions,
  isStudent
};
