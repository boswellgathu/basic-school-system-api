// const chokidar = require('chokidar');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const Routes = require('./src/routes');
const config = require('./config');

const { port } = config;
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.use('/api', Routes.userRouter);

app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome, How are you?, feeling good? coolbeans yo!',
}));

app.listen(port);
// eslint-disable-next-line no-console
console.log(`go to http://localhost:${port}`);

module.exports = app;
