# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.5](https://github.com/telare/quiz-companion/compare/v0.0.4...v0.0.5) (2026-04-11)


### Features

* add path logging in server startup messages ([cf3e2bc](https://github.com/telare/quiz-companion/commit/cf3e2bcb9288f214532800207affbae813da9610))
* add perfectionist eslint plugin and set up sorting ([a9d9a62](https://github.com/telare/quiz-companion/commit/a9d9a62402bb15037812a9310382299c40accc05))
* add terminus health check module ([e0bc5be](https://github.com/telare/quiz-companion/commit/e0bc5be4600967fbbd0533d39b0b6ef52975644f))
* add throttling functionality with @nestjs/throttler and swagger-ui-express ([0fcee9c](https://github.com/telare/quiz-companion/commit/0fcee9c936e4051b1784bc8c1054a4473cd2885c))
* code style changes ([59baf4f](https://github.com/telare/quiz-companion/commit/59baf4f97b23ed725cd3ba65cd1cfa80324a694c))
* enhance bot functionality with new commands and keyboard replies ([9eccc99](https://github.com/telare/quiz-companion/commit/9eccc99d6602ee515e28b959e4c5ab867bbf6143))
* enhance quiz functionality with popular mode, improve UX in error handling ([0fb71d4](https://github.com/telare/quiz-companion/commit/0fb71d46b27d6afb306af1c7f8bd0b3090a76991))
* enhance swagger API documentation ([c1b051b](https://github.com/telare/quiz-companion/commit/c1b051b9b159fea6c3efcd9043f5500fd1b1c24b))
* Enhanced Error Handling & Question Generation Logic ([f813fa8](https://github.com/telare/quiz-companion/commit/f813fa8636f363b3fe36ebcdb4d9fd7a4dac2e8e))
* implement global exception filter and update related imports ([5c8f183](https://github.com/telare/quiz-companion/commit/5c8f183cff0f0d1559753c3dc7ce58da4fa36544))
* implement tests for User, enhance error handling and response structure across application ([e4f6dcd](https://github.com/telare/quiz-companion/commit/e4f6dcd86d326e02f2819832b9c3c9836224a58c))
* implement user CRUD operations ([f96a118](https://github.com/telare/quiz-companion/commit/f96a1188aa1a53c69af3e7bc2a75adfd58c371a1))
* update eslint, ts configurations ([8e282f2](https://github.com/telare/quiz-companion/commit/8e282f23d6a2e57d18721134e268bce5cf89289e))


### Bug Fixes

* enhance logging interceptor and update question generation rules ([8707ee5](https://github.com/telare/quiz-companion/commit/8707ee591355e3e9ba5d16b410070abee1c2596c))
* question DTO structure & generation script ([7f5c6c5](https://github.com/telare/quiz-companion/commit/7f5c6c50d1454a565ca83fa178998ed166c0a097))
* refine question generation rules and update prompt template ([129dca7](https://github.com/telare/quiz-companion/commit/129dca71b8b599c4718672e9bf1980643fe120dd))
* typo in utils ([dc93eef](https://github.com/telare/quiz-companion/commit/dc93eeff4ac996a9cb8a94c00e6bf653b8b65991))
* update import paths ([c34eb0a](https://github.com/telare/quiz-companion/commit/c34eb0abc1ea2eeae057f3d2baeeafa10a0b4e5a))
* update vercel configuration to include swagger-ui-dist files ([c364e1d](https://github.com/telare/quiz-companion/commit/c364e1dabcbd031f1a7ea8c31cad9a7c1de32807))

### [0.0.4](https://github.com/telare/quiz-companion/compare/v0.0.3...v0.0.4) (2026-03-20)

### Features

- add GitHub Actions workflow for release automation ([e9521af](https://github.com/telare/quiz-companion/commit/e9521af7831d8b1060887d5b0e5c4deeebaba675))
- improve service methods ([53768b5](https://github.com/telare/quiz-companion/commit/53768b545897f486404d069e3d811b35f2cc34a3))
- **user:** add ranking system ([f6cd7a1](https://github.com/telare/quiz-companion/commit/f6cd7a17e3829c438b1cd73db912b56992d6f5b0))

### 0.0.3 (2026-03-19)

### Features

- add cron workflow & script to generate questions ([5d71faf](https://github.com/telare/quiz-companion/commit/5d71faf3284c58fe9aedab4e0693c63d8240595f))
- add quiz wizard v1 ([e2f64fd](https://github.com/telare/quiz-companion/commit/e2f64fde5c0cf9a55b12643169b29ddf4106db02))
- **bot.update:** improve functionality of /random command ([510d8af](https://github.com/telare/quiz-companion/commit/510d8af3969c034b89992899ed4c1b04f73cc0fa))
- **bot/commands:** add /ranking command to display user rankings ([3b82c58](https://github.com/telare/quiz-companion/commit/3b82c580e7e4056368db72f6b878a48f0e7f5072))
- **bot/commands:** improve UX by adding better reply messsage for answer ([28065ad](https://github.com/telare/quiz-companion/commit/28065ad51a7f9a16315d68f3533301ce30ef5dfa))
- enhance bot responses with improved messaging and formatting ([9079615](https://github.com/telare/quiz-companion/commit/9079615e8dc812cd961ebc3eed69930f5f311663))
- **husky:** add pre-commit hook to run lint and test ([ac0b1bf](https://github.com/telare/quiz-companion/commit/ac0b1bfc4507bce7234e91c585db757b617cc183))
- improve error handling and utilities ([234da5d](https://github.com/telare/quiz-companion/commit/234da5d8448c4c4cee3c3440dce60aae31a76f7e))
- initial commit ([10c9ffa](https://github.com/telare/quiz-companion/commit/10c9ffa01bc321f297f51869bb80cbe2da8f4c86))
- **logger:** add logger middleware ([3ca9ce5](https://github.com/telare/quiz-companion/commit/3ca9ce5429eb5617f37061ecbdca1656846af68f))
- migrate to javascript interview questions ([f60ff6a](https://github.com/telare/quiz-companion/commit/f60ff6a12d3ba4b9607a66a179c93faedcb319e5))
- **modules:** add question and user modules ([c98723c](https://github.com/telare/quiz-companion/commit/c98723c7c29f2abc40d8be69a1ca56b3aaed2d93))
- **modules:** integrate Google AI Studio module ([7cc506e](https://github.com/telare/quiz-companion/commit/7cc506e91316f9989198e7fd4d2ddd32c7c27ba4))
- **question:** add controller and update service with methods for POST ([f5ad99b](https://github.com/telare/quiz-companion/commit/f5ad99b47e4e8bccb6e8107a008548501337f9e8))
- **question:** add question count badge to UI ([f18ae6c](https://github.com/telare/quiz-companion/commit/f18ae6cba9b634972987e3690c87707a108d55be))
- **question:** add sort by total questions for topics ([f15fa44](https://github.com/telare/quiz-companion/commit/f15fa44e1bcdd7afdc6625e1003f70e6ffc24e3c))
- **question:** implement favorite questions and update quiz bot logic ([f093f0b](https://github.com/telare/quiz-companion/commit/f093f0baf3b8d75b6c8d65eadcb2e991c94d4792))
- **quiz.update:** improve quiz feedback UI ([0edac97](https://github.com/telare/quiz-companion/commit/0edac97f763c296179369ff910824386c95d93f9))
- **quiz:** add user auth guard to reduce code repetition ([1be515b](https://github.com/telare/quiz-companion/commit/1be515b4625b1f7dce680fb0902994bc714c8898))
- **quiz:** enhance quiz functionality with category selection and refactor wizard state ([aec85ef](https://github.com/telare/quiz-companion/commit/aec85ef77619bdadac44027d8b7d7d2334c01de1))
- **quiz:** improve question formatting ([426f04a](https://github.com/telare/quiz-companion/commit/426f04a27143ac448550df52b9f98c01ada6c6b9))
- **quiz:** update quiz schema and add handlers logic for random question by topic ([dd38f8a](https://github.com/telare/quiz-companion/commit/dd38f8a0831d8b303f21ddd4bdef1f339a279710))
- update path alias in tsconfig.json ([cfa0ec5](https://github.com/telare/quiz-companion/commit/cfa0ec5164f89e9a8d54710d1c3106e744fe0e12))

### Bug Fixes

- **bot.module.ts:** add missed injected service ([ca113f9](https://github.com/telare/quiz-companion/commit/ca113f9b9d44a9882695833d5db3b339070f48bb))
- **bot.update:** update the logic of handleRandomQuestionAnswer to improve UX, fix type mismatch issue ([393cb1d](https://github.com/telare/quiz-companion/commit/393cb1d705935b00207fc9216b8e38f28af0d3b7))
- fix incorrect varible using ([7ca1b6a](https://github.com/telare/quiz-companion/commit/7ca1b6a883fd53b525ead9dd6ec002e50adf3ff1))
- **main.ts:** update function logic for prod and improve environment handling ([c4de863](https://github.com/telare/quiz-companion/commit/c4de8636c8866171132d3fee1bf452d277eb8512))
- **quiz:** fix the "save question" button logic ([230a20c](https://github.com/telare/quiz-companion/commit/230a20c2a88cb3c6e804494352591dc76460d19b))
- replace /src aliases with relative paths ([04ade85](https://github.com/telare/quiz-companion/commit/04ade8521c611be74ba70455147c95fb9e8f1c9a))
- update import paths ([af5c39d](https://github.com/telare/quiz-companion/commit/af5c39df96c88442aa81782187e7de9b9717b2c2))
- **worflow:** change AI_MODEL ([bb292c2](https://github.com/telare/quiz-companion/commit/bb292c24a0aad5b2c0f6f072ff7f2acd34ce4687))
- **worflow:** replace early return with simple skipping of invalidated questions ([0138e58](https://github.com/telare/quiz-companion/commit/0138e5875d6789ee312bb1ea45317bcefb62d602))
- **worflows:** fix directory ([60778e8](https://github.com/telare/quiz-companion/commit/60778e8b79cfee20b68117c5401ab1095aa14b01))
- **workflows:** fix working directory bug ([8bc7dbc](https://github.com/telare/quiz-companion/commit/8bc7dbc8f4e9ae46ac321190f452737177616c48))

### 0.0.2 (2026-03-07)

### Features

- **bot.update:** improve functionality of /random command ([510d8af](https://github.com/telare/quiz-companion/commit/510d8af3969c034b89992899ed4c1b04f73cc0fa))
- **bot/commands:** add /ranking command to display user rankings ([3b82c58](https://github.com/telare/quiz-companion/commit/3b82c580e7e4056368db72f6b878a48f0e7f5072))
- **bot/commands:** improve UX by adding better reply messsage for answer ([28065ad](https://github.com/telare/quiz-companion/commit/28065ad51a7f9a16315d68f3533301ce30ef5dfa))
- **husky:** add pre-commit hook to run lint and test ([ac0b1bf](https://github.com/telare/quiz-companion/commit/ac0b1bfc4507bce7234e91c585db757b617cc183))
- improve error handling and utilities ([234da5d](https://github.com/telare/quiz-companion/commit/234da5d8448c4c4cee3c3440dce60aae31a76f7e))
- initial commit ([10c9ffa](https://github.com/telare/quiz-companion/commit/10c9ffa01bc321f297f51869bb80cbe2da8f4c86))
- **logger:** add logger middleware ([3ca9ce5](https://github.com/telare/quiz-companion/commit/3ca9ce5429eb5617f37061ecbdca1656846af68f))
- migrate to javascript interview questions ([f60ff6a](https://github.com/telare/quiz-companion/commit/f60ff6a12d3ba4b9607a66a179c93faedcb319e5))
- **modules:** add question and user modules ([c98723c](https://github.com/telare/quiz-companion/commit/c98723c7c29f2abc40d8be69a1ca56b3aaed2d93))
- **modules:** integrate Google AI Studio module ([7cc506e](https://github.com/telare/quiz-companion/commit/7cc506e91316f9989198e7fd4d2ddd32c7c27ba4))
- **question:** add controller and update service with methods for POST ([f5ad99b](https://github.com/telare/quiz-companion/commit/f5ad99b47e4e8bccb6e8107a008548501337f9e8))
- **question:** implement favorite questions and update quiz bot logic ([f093f0b](https://github.com/telare/quiz-companion/commit/f093f0baf3b8d75b6c8d65eadcb2e991c94d4792))
- **quiz.update:** improve quiz feedback UI ([0edac97](https://github.com/telare/quiz-companion/commit/0edac97f763c296179369ff910824386c95d93f9))
- **quiz:** update quiz schema and add handlers logic for random question by topic ([dd38f8a](https://github.com/telare/quiz-companion/commit/dd38f8a0831d8b303f21ddd4bdef1f339a279710))
- update path alias in tsconfig.json ([cfa0ec5](https://github.com/telare/quiz-companion/commit/cfa0ec5164f89e9a8d54710d1c3106e744fe0e12))

### Bug Fixes

- **bot.module.ts:** add missed injected service ([ca113f9](https://github.com/telare/quiz-companion/commit/ca113f9b9d44a9882695833d5db3b339070f48bb))
- **bot.update:** update the logic of handleRandomQuestionAnswer to improve UX, fix type mismatch issue ([393cb1d](https://github.com/telare/quiz-companion/commit/393cb1d705935b00207fc9216b8e38f28af0d3b7))
- fix incorrect varible using ([7ca1b6a](https://github.com/telare/quiz-companion/commit/7ca1b6a883fd53b525ead9dd6ec002e50adf3ff1))
- **main.ts:** update function logic for prod and improve environment handling ([c4de863](https://github.com/telare/quiz-companion/commit/c4de8636c8866171132d3fee1bf452d277eb8512))
