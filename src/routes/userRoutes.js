const express = require('express');
const { IsAdmin, VerifyToken } = require('../controllers/Auth');
const {
  createUser, updateUser, deleteUser, signIn
} = require('../controllers/User');

const UserRouter = express.Router();

UserRouter.post('/user', VerifyToken, IsAdmin, createUser);
UserRouter.post('/user/signin', signIn);
UserRouter.put('/user/:id', VerifyToken, IsAdmin, updateUser);
UserRouter.delete('/user/:id', VerifyToken, IsAdmin, deleteUser);

module.exports = UserRouter;
