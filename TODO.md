# TODO: Project Roadmap

## 1. Robust Telegram-Specific Error Handling

##   2. Internationalization (i18n).

##  3. Rate Limiting & Spam Protection
  Observation: There is no mechanism to prevent a single user from flooding your bot with commands, which could exhaust
  your AI credits or database resources.
  Improvement: Integrate telegraf-ratelimit.

   1 // Add as a middleware in TelegrafModule.forRootAsync
   2 const rateLimitConfig = {
   3   window: 3000, // 3 seconds
   4   limit: 1,
   5   onLimitExceeded: (ctx) => ctx.reply('Slow down! Please wait a few seconds.'),
   6 };
   7 // Use in middlewares array

 ## 4. Enhanced Type Safety & Context Fixes
  Observation: I noticed a typo in src/scenes/wizard-scene.context.ts (spelled "Sceen"). Also, your BotContext is very
  minimal.
  Improvement:
   * Fix the typo: Rename WizardSceenContext to WizardSceneContext.
   * Expand BotContext to include properly typed sessions and scene states to avoid using any in your code.

##  5. Production Logging & Telemetry
  Observation: You use standard console.log and basic NestJS logging.
  Improvement:
   * Structured Logging: Use a logger like Winston or Pino to output logs in JSON format for easier ingestion by
     monitoring tools (Logflare, Datadog, etc.).
   * Telemetry: Add "Events" for key actions (e.g., quiz_started, quiz_completed, ai_generation_failed). This is vital
     for understanding bot performance and user retention.

 ## 6. Graceful Shutdown
  Observation: Your main.ts doesn't explicitly handle the shutdown process.
  Improvement: Ensure your bot disconnects cleanly to avoid session corruption.
   1 // src/main.ts
   2 app.enableShutdownHooks(); // Ensures Mongoose and Telegraf close properly

 ## 7. Automated Testing (The Missing Piece)
  Observation: There are currently no tests in the project.
  Improvement: Production code must be tested.
   * Unit Tests: Test your QuestionService and UserService logic.
   * E2E Tests: Use @nestjs/testing and a mock Telegraf context to simulate user flows (e.g., the Quiz Wizard steps).

 ## 8. Environment Variable Validation
  Observation: You use a custom getEnvValue helper, but it doesn't enforce that required variables exist on startup.
  Improvement: Use the NestJS ConfigModule with a validation schema (using Joi) to ensure the app fails immediately if
  TELEGRAM_BOT_TOKEN or mongoURI is missing.

 ### Summary of Recommended Next Steps:
   1. Fix Typos & Refactor Context: Correct WizardSceenContext and improve typing.
   2. Add Telegraf Error Filter: Stop the bot from crashing on unhandled update errors.
   3. Add Basic Unit Tests: Start with UserService to ensure data persistence works as expected.
   4. Implement Rate Limiting: Protect your AI and DB from abuse.