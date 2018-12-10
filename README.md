[![Build Status](https://travis-ci.org/boswellgathu/simple-school-system-api.svg?branch=master)](https://travis-ci.org/boswellgathu/pren_test_staff)
[![codecov](https://codecov.io/gh/boswellgathu/pren_test_staff/branch/master/graph/badge.svg)](https://codecov.io/gh/boswellgathu/pren_test_staff)

Simple school system api

### Installation
* Clone this repo `git git@github.com:boswellgathu/simple-school-system-api.git`
* Navigate to the folder `cd simple-school-system-api`
* create a .env - (check env.sample) file and add key values for:
    - PORT - which to run your app on - required.
    - NODE_ENV - development || production - required.
    - ADMINLOGIN - password to use for the default seeded admin - required.
* Run `yarn setup-app`  to use the setup script to setup - the script will
    - create both local and test databases named real_pg_db and test_pg_db
    - check if you have sequelize-cli, pm2 and if not install it
    - generate RSA key pair to use for jwt
    - run database migrations and seed db with initial data like Admin user and roles
    - run tests and finally,
    - start the app.


# API

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/5dd06a9ec49d8c04cafa)

### End Points

Please note only an admin can do all the below actions except signin. Any user can signin

## Users [`/api/users`]

| Method     | Endpoint                                 | Description         |
| :-------   | :--------------------------------------  | :-------------      |
|POST        |/api/users                                |create a user        |
|GET         |/api/users                                |list all users       |
|GET         | /users/?limit={integer}&offset={integer} |Paginated users      |
|POST        |/api/users/signin                         |login a user         |
|GET         |/api/users/:id                            |get a specific user   |
|PUT         |/api/users/:id                            |update a user        |
|DELETE      |/api/users/:id                            |delete a user        |


## Subjects [`/api/subjects`]

| Method     | Endpoint                                        | Description         |
| :-------   | :--------------------------------------------   | :-------------      |
|POST        |/api/subject                                     |create  a subject    |
|GET         |/api/subject                                     |list subjects        |
|GET         |/api/subject/?limit={integer}&offset={integer}   |Paginated subjects   |
|GET         |/api/subject/:id                                 |get a subject        |
|PUT         |/api/subject/:id                                 |update a subject     |
|PUT         |/api/subject/archive/:id                         |archive a subject    |
|PUT         |/api/subject/assign/:id                          |assign to a teacher  |
|PUT         |/api/subject/reassign/:id                        |reassign to a teacher|

The exams actions can be done by a user with teacher role except the GET endpoints which can be done by any user and depending on their role, they will get different results.
## Exams [`/api/exam`]

| Method     | Endpoint                                        | Description         |
| :-------   | :--------------------------------------------   | :-------------      |
|POST        |/api/exam                                        |create an exam       |
|GET         |/api/exam                                        |list exams           |
|GET         |/api/exam/?limit={integer}&offset={integer}      |Paginated exams      |
|GET         |/api/exam/:id                                    |get an exam          |
|PUT         |/api/exam/:id                                    |update a exam        |
|PUT         |/api/exam/invalidate:id                          |invalidate an exam   |

### Dependencies
* postgresql
* NodeJs
* openssl
* sequelize-cli
* yarn
