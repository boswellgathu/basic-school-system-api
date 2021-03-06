const express = require('express');
const { IsAdmin, VerifyToken, IsNotStudent } = require('../controllers/Auth');
const {
  createSubject, updateSubject, deleteSubject, assignTeacher, reassignTeacher,
  searchSubject
} = require('../controllers/Subject');

const SubjectRouter = express.Router();

SubjectRouter.post('/subject', VerifyToken, IsAdmin, createSubject);
SubjectRouter.put('/subject/:id', VerifyToken, IsAdmin, updateSubject);
SubjectRouter.put('/subject/archive/:id', VerifyToken, IsAdmin, deleteSubject);
SubjectRouter.put('/subject/assign/:id', VerifyToken, IsAdmin, assignTeacher);
SubjectRouter.put('/subject/reassign/:id', VerifyToken, IsAdmin, reassignTeacher);
SubjectRouter.get('/subject', VerifyToken, IsNotStudent, searchSubject);

module.exports = SubjectRouter;
