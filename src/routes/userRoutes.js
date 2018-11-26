/**
 * Created by boswellgathu on 30/03/2017.
 */
const express = require('express');
const { CreateUser } = require('../controllers/userController');

const UserRouter = express.Router();

UserRouter.post('/user', CreateUser);

module.exports = UserRouter;
