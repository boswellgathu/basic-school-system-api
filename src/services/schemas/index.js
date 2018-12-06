const Joi = require('joi');
const {
  VALID, CANCELLED, LIVE, ARCHIVED, VALIDATION
} = require('../../../db/constants');

const examSchema = Joi.object().keys({
  examDate: Joi.date().required(),
  grade: Joi.string().valid(['A', 'B', 'C', 'D', 'E']).required(),
  subjectId: Joi.number().integer().required(),
  studentId: Joi.number().integer().required(),
  createdBy: Joi.number().integer().required(),
  status: Joi.string().valid([VALID, CANCELLED])
});

const userSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string(),
  email: Joi.string().email().required(),
  roleId: Joi.number().integer().required(),
});

const subjectSchema = Joi.object().keys({
  name: Joi.string().required(),
  teacherId: Joi.number().integer(),
  status: Joi.string().valid([LIVE, ARCHIVED, VALIDATION])
}).with('status', 'teacherId');

const patchExamSchema = Joi.object().keys({
  id: Joi.number().integer().required(),
  grade: Joi.string().valid(['A', 'B', 'C', 'D', 'E']).required()
});

const searchExamSchema = Joi.object().keys({
  pageNo: Joi.number().integer(),
  limit: Joi.number().integer(),
  status: Joi.string().valid([VALID, CANCELLED]),
  createdBy: Joi.number().integer(),
  subjectId: Joi.number().integer(),
  studentId: Joi.number().integer(),
  grade: Joi.string().valid(['A', 'B', 'C', 'D', 'E'])
}).with('pageNo', 'limit');

const searchSubjectSchema = Joi.object().keys({
  pageNo: Joi.number().integer(),
  limit: Joi.number().integer(),
  name: Joi.string(),
  status: Joi.string().valid([LIVE, ARCHIVED, VALIDATION]),
  teacherId: Joi.number().integer(),
}).with('pageNo', 'limit');

module.exports = {
  examSchema,
  userSchema,
  subjectSchema,
  patchExamSchema,
  searchExamSchema,
  searchSubjectSchema
};
