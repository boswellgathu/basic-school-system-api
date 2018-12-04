const { Router } = require('express');
const { IsTeacher, VerifyToken } = require('../controllers/Auth');
const {
  createExam, updateExam, invalidateExam, showExam
} = require('../controllers/Exam');

const ExamRouter = Router();

ExamRouter.post('/exam', VerifyToken, IsTeacher, createExam);
ExamRouter.put('/exam/:id', VerifyToken, IsTeacher, updateExam);
ExamRouter.put('/exam/invalidate/:id', VerifyToken, IsTeacher, invalidateExam);
ExamRouter.get('/exam', VerifyToken, showExam);

module.exports = ExamRouter;
