#!/bin/bash
set -e

if ! [ -x "$(command -v psql)" ]; then
  echo 'Error: git is not installed.' >&2
  exit -1
fi

# creating db user and both app and test db
psql -c "create database real_db;" -U postgres
psql -c "create user real_user;" -U postgres
psql -c "create database test_db;" -U postgres

if ! [ -x "$(command -v sequelize)" ]; then
    echo "Sequelize is not installed on your system"
    echo "Installing sequelize"
    npm install sequelize-cli -g
fi
if ! [ -x "$(command -v pm2)" ]; then
    echo "Sequelize is not installed on your system"
    echo "Installing sequelize"
    npm install pm2 -g
fi

# gen public private keys
if ! [ -x "$(command -v openssl)" ]; then
  echo 'Error: Unable to generate public and private key' >&2
  echo 'We need the keys to use jwt for Auth' >&2
  echo 'create the two files using RSA512 and put them in root config folder' >&2
  exit -1
fi
openssl genpkey -algorithm RSA -out ./config/private_key.pem -pkeyopt rsa_keygen_bits:512
openssl rsa -pubout -in ./config/private_key.pem -out ./config/public_key.pem

# final round
yarn install
sequelize db:migrate:all
sequelize db:seed:all

# Run tests
yarn test

# start the app
yarn start
