const Joi = require('joi');
const Qs = require('qs');
const schemas = require('../../services/schemas');
const { validateUserData } = require('../../utils/dataValidateUtils');
const { addExam, patchExam, cancelExam, viewExam } = require('../../services/exam');

async function createExam(req, res) {
  const sanitizedData = validateUserData(
    { ...req.body, createdBy: req.decoded.id }
  );

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }

  const { error, value } = Joi.validate(sanitizedData, schemas.examSchema);

  if (error) {
    return res.status(400).send({ validationError: error.toString() });
  }
  const { response, statusCode } = await addExam(value);
  return res.status(statusCode).send(response);
}

async function updateExam(req, res) {
  const exam = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(exam);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { error, value } = Joi.validate(sanitizedData, schemas.patchExamSchema);
  if (error) {
    return res.status(400).send({ validationError: error.toString() });
  }
  const { response, statusCode } = await patchExam(
    { ...value, teacherId: req.decoded.id }
  );
  return res.status(statusCode).send(response);
}

async function invalidateExam(req, res) {
  const exam = { id: req.params.id };
  let sanitizedData = validateUserData(exam);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  sanitizedData = { ...sanitizedData, teacherId: req.decoded.id };
  const { response, statusCode } = await cancelExam(sanitizedData);
  return res.status(statusCode).send(response);
}

async function showExam(req, res) {
  const { error, value } = Joi.validate(Qs.parse(req.query), schemas.searchExamSchema);
  if (error) {
    return res.status(400).send({ validationError: error });
  }
  const queryParams = { ...value, userId: req.decoded.id };
  const { response, statusCode } = await viewExam(queryParams);
  return res.status(statusCode).send(response);
}

module.exports = {
  createExam,
  updateExam,
  invalidateExam,
  showExam
};
