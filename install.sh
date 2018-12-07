#!/bin/bash
set -e

if ! [ -x "$(command -v psql)" ]; then
  echo 'Error: psql is not installed.' >&2
  exit -1
fi

# creating db user and both app and test db
psql -c "create user real_pg_user;" -U postgres
psql -c "create database real_pg_db;" -U postgres
psql -c "create database test_pg_db;" -U postgres

if ! [ -x "$(command -v sequelize)" ]; then
    echo "Sequelize is not installed on your system"
    echo "Installing sequelize"
    npm install sequelize-cli -g
fi
if ! [ -x "$(command -v pm2)" ]; then
    echo "pm2 is not installed on your system"
    echo "Installing pm2"
    npm install pm2 -g
fi

# gen public private keys
if ! [ -x "$(command -v openssl)" ]; then
  echo 'Error: Unable to generate public and private key' >&2
  echo 'We need the keys to use jwt for Auth' >&2
  echo 'create the two files using RSA512 and put them in root config folder' >&2
  exit -1
fi
echo "generating private and public key..."
openssl genpkey -algorithm RSA -out ./config/private_key.pem -pkeyopt rsa_keygen_bits:512
openssl rsa -pubout -in ./config/private_key.pem -out ./config/public_key.pem
echo "keys generated."

# final round
yarn install
echo "applying db migrations"
sequelize db:migrate
echo "success..."

# Run tests
yarn test

#putting this here as it is eroring when near db:migrate
echo "finally seeding db ..."
sequelize db:seed:all
# start the app
yarn start

echo "Now that the app is already running using pm2, use 'pm2 stop <id>' to stop it"
