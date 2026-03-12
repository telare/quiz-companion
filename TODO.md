# TODO: Project Roadmap

## Phase 1: Critical Fixes (Core Infrastructure)

- [ ] **Fix User Identification**: Migrate from `username` to `telegram_id` as primary identifier in `UserService` and `StartCommand`.
- [ ] **Type Safety in BotController**: Replace `any` types with proper interfaces/DTOs for Telegram Webhook updates.
- [ ] **Global Error Handling**: Implement a NestJS Exception Filter to capture errors and send user-friendly feedback via Telegram.
- [ ] **AI Model Version Fix**: Verify and correct the Gemini model name (change `gemini-2.5-flash` to `gemini-1.5-flash` or `gemini-2.0-flash`).

## Phase 2: Refactoring & Maintainability

- [ ] **AI Prompt Management**: Move logic for generating prompts out of `AiService.ts` and into a dedicated `prompts` directory or config file.
- [ ] **DTO Validation**: Use `class-validator` and `class-transformer` to validate AI responses before storing them in the database.
- [ ] **Centralized Constants**: Extract hardcoded strings (topics, difficulties, error messages) to a `src/common/constants.ts` file.
- [ ] **Improve Webhook Response**: Ensure `BotController` returns proper status codes (200 OK) promptly to avoid Telegram update retries.

## Phase 3: Features & Logic

- [ ] **Favorite Questions Logic**: Complete the implementation of the `favorite-question` module and integrate it with the Bot's UI.
- [ ] **Feedback UI**: Improve the user interface for quiz feedback (use better emojis, formatting, and interactive buttons).
- [ ] **Topic Selection**: Allow users to choose specific topics for the quiz instead of hardcoded "promises".

## Phase 4: Quality & Testing

- [ ] **Unit Tests**: Implement unit tests for `AiService`, `UserService`, and `BotService`.
- [ ] **E2E Tests**: Add end-to-end tests for the main quiz flow using `@nestjs/testing`.
- [ ] **CI/CD Integration**: Add a GitHub Action or similar to run linting and tests on every push.

## Ongoing

- [ ] **Documentation**: Maintain `README.md` and keep this `TODO.md` updated.
- [ ] **Logger Improvements**: Expand `LoggerMiddleware` to log more detailed information about Bot interactions.
