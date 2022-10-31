<p align="center">
  <a href="https://givemechoice.com" target="blank"><img src="https://givemechoice.com/img/GMC_logo.svg" width="320" alt="GMC Logo" /></a>
</p>

  <h1 align="center">The Planet is <span style="border:1px black solid;border-radius:7px;padding:0px 5px">F***ed.</span></h1>

## Description

The [Give Me Choice](http://givemechoice.com) Backend Monorepo.

## Installation

```bash
$ npm install
```

## Run Scripts

```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

## Database Scripts

```bash
# delete & (re)create gmc_db container
$ db:reset

# start gmc_db container
$ db:start

# connect to gmc_db container with psql
$ db:connect

# generate seed migration file
$ db:seed

# execute all new migrations
$ db:migrate

# revert latest migration
$ db:revert

# 1- execute all new migrations;
# 2- generate new "sync" migration covering any db changes in app;
# 3- execute the "sync" migration;
$ db:sync
```

**NOTE**:

- For all generated migrations, the following line must be manually appended to the end of both `up()` and `down()`:
  ```js
  await queryRunner.commitTransaction();
  ```
- Generated migrations involving enum type columns will **always** recreate the enum type.

<hr>

## RabbitMQ Scripts

```bash
# delete & (re)create gmc_rabbitmq container
$ rabbitmq:reset

# start rabbitmq container
$ rabbitmq:start
```
