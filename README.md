<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Famatch Backend API

The Famatch Backend API is a NestJS-based backend service for the Famatch project. It offers a set of RESTful endpoints to manage users, notifications, and other app functionalities.

## Table of Contents

- [Famatch Backend API](#famatch-backend-api)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [License](#license)
  - [Running the app](#running-the-app)
  - [Test](#test)
  - [Support](#support)
  - [Stay in touch](#stay-in-touch)
  - [License](#license-1)

## Requirements

- [Node.js](https://nodejs.org/)
- [Yarn](https://classic.yarnpkg.com/)
- [Docker](https://www.docker.com/)

## Getting Started

To clone and set up the project, follow these steps:

1. Clone the repository:

```bash

git clone https://github.com/username/famatch-backend-api.git
cd famatch-backend-api

```

2. Install the dependencies:

```

yarn

```

## Development Workflow

Follow these steps to start the development environment:

1. Make sure Docker is running and start the local PostgreSQL instance:

```

yarn db:start

```

2. Apply the database migrations:

```

yarn prisma:migrate

```

3. Generate the Prisma schema and Prisma client:

```

yarn prisma:generate

```

4. Start the NestJS development server:

```

yarn start:dev

```

5. (Optional) Start Prisma Studio for exploring and debugging the PostgreSQL database data:

```

yarn prisma:studio

```

The NestJS development server should now be running alongside a PostgreSQL instance, with Prisma Client available to interact with the database. You can begin developing new features or fixing bugs in the codebase using this environment.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
