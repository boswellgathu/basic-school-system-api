const joi = require('joi');
const { examSchema, userSchema, subjectSchema } = require('../../services/schemas');
const { validateUserData } = require('../../utils/dataValidateUtils');
const { addExam, patchExam, cancelExam, viewExam } = require('../../services/exam');

async function createExam(req, res) {
  const sanitizedData = validateUserData(
    { ...req.body, createdBy: req.decoded.id }
  );

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { err, value } = await joi.validate(sanitizedData, examSchema);
  if (err) {
    return res.status(400).send({ validationError: err });
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
  const { response, statusCode } = await patchExam(sanitizedData);
  return res.status(statusCode).send(response);
}

async function invalidateExam(req, res) {
  const subject = { id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await cancelExam(sanitizedData.id);
  return res.status(statusCode).send(response);
}

async function showExam(req, res) {
  const subject = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await viewExam(sanitizedData);
  return res.status(statusCode).send(response);
}

module.exports = {
  createExam,
  updateExam,
  invalidateExam,
  showExam
};
