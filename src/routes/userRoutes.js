const express = require('express');
const { IsAdmin, VerifyToken, attachRole } = require('../controllers/Auth');
const {
  createUser, updateUser, deleteUser, signIn, showUser
} = require('../controllers/User');

const UserRouter = express.Router();

UserRouter.post('/user', VerifyToken, IsAdmin, createUser);
UserRouter.post('/user/signin', signIn);
UserRouter.put('/user/:id', VerifyToken, IsAdmin, updateUser);
UserRouter.delete('/user/:id', VerifyToken, IsAdmin, deleteUser);
UserRouter.get('/user', VerifyToken, attachRole, showUser);

module.exports = UserRouter;
