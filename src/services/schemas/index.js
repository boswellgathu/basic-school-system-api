const joi = require('joi');
const {
  VALID, CANCELLED, LIVE, ARCHIVED, VALIDATION
} = require('../../../db/constants');

const examSchema = joi.object().keys({
  examDate: joi.date().required(),
  grade: joi
    .string()
    .valid(['A', 'B', 'C', 'D', 'E'])
    .required(),
  subjectId: joi.number().integer().required(),
  studentId: joi.number().integer().required(),
  createdBy: joi.number().integer().required(),
  status: joi.string().valid([VALID, CANCELLED])
});

const userSchema = joi.object().keys({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  email: joi.string().email().required(),
  roleId: joi.number().integer().required(),
});

const subjectSchema = joi.object().keys({
  name: joi.string().required(),
  teacherId: joi.number().integer().optional(),
  status: joi
    .string()
    .when('teacherId', {
      is: joi.number().integer().required(),
      then: joi.string().valid([LIVE, ARCHIVED, VALIDATION])
    })
});

exports.default = {
  examSchema,
  userSchema,
  subjectSchema
};
