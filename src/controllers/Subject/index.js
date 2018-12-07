const Joi = require('joi');
const Qs = require('qs');
const schemas = require('../../services/schemas');
const { validateUserData } = require('../../utils/dataValidateUtils');
const {
  addSubject,
  patchSubject,
  archiveSubject,
  assignSubjectToTeacher,
  reassignSubjectToTeacher,
  viewSubject
} = require('../../services/subject');

async function createSubject(req, res) {
  const sanitizedData = validateUserData(req.body);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await addSubject(sanitizedData);
  return res.status(statusCode).send(response);
}

async function updateSubject(req, res) {
  const subject = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await patchSubject(sanitizedData);
  return res.status(statusCode).send(response);
}

async function deleteSubject(req, res) {
  const subject = { id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await archiveSubject(sanitizedData.id);
  return res.status(statusCode).send(response);
}

async function assignTeacher(req, res) {
  const subject = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await assignSubjectToTeacher(sanitizedData);
  return res.status(statusCode).send(response);
}

async function reassignTeacher(req, res) {
  const subject = { ...req.body, id: req.params.id };
  const sanitizedData = validateUserData(subject);

  if (typeof sanitizedData === 'string') {
    return res.status(400).send({ validationError: sanitizedData });
  }
  const { response, statusCode } = await reassignSubjectToTeacher(sanitizedData);
  return res.status(statusCode).send(response);
}

async function searchSubject(req, res) {
  const { error, value } = Joi.validate(Qs.parse(req.query), schemas.searchSubjectSchema);
  if (error) {
    return res.status(400).send({ validationError: error });
  }
  const { response, statusCode } = await viewSubject(value);
  return res.status(statusCode).send(response);
}

module.exports = {
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacher,
  reassignTeacher,
  searchSubject
};
