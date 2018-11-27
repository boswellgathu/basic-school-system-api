/**
 * Created by boswellgathu on 30/03/2017.
 */
const express = require('express');
const {
  createUser, updateUser, deleteUser, signIn
} = require('../controllers/UserController');

const UserRouter = express.Router();

UserRouter.post('/user', createUser);
UserRouter.post('/user/signin', signIn);
UserRouter.put('/user/:id', updateUser);
UserRouter.delete('/user/:id', deleteUser);

module.exports = UserRouter;
