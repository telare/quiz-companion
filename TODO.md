# TODO: Project Roadmap
1. Backend Architecture & Code Quality
   * User Identification (Critical): Currently, the system uses username as the primary key. In Telegram, users can
     change their username or not have one at all. This will break your database relations.
       * Fix: Migrate to telegramId (a unique numeric ID) as the primary identifier.
   * Type Safety in Webhooks: BotController currently uses any for request and response objects. This bypasses NestJS's
     strongest feature: type safety.
       * Fix: Define DTOs for Telegram updates or use types from the telegraf library.
   * Prompt Engineering: The AiService contains a hardcoded, complex string prompt. This makes it difficult to version,
     test, or swap models.
       * Fix: Move prompts to a dedicated configuration layer or template files.
   * Validation Pipe: While class-validator is in package.json, it isn't being used to validate the JSON structure
     returned by the AI.
       * Fix: Implement a validation step after the AI returns a question to ensure it strictly follows your schema
         before saving to MongoDB.

2. User Experience (UX) Improvements
   * Navigation & Discovery: The bot relies heavily on commands (/quiz, /my). Users often forget these.
       * Improvement: Implement a Persistent Reply Keyboard (bottom menu) with buttons like "🚀 Start Quiz", "📊 My
         Profile", and "🏆 Ranking".
   * Wizard Flow Resilience: If a user gets stuck in the QuizWizard, there is no "Cancel" or "Back" button.
       * Improvement: Add a Cancel button to every step of the wizard to allow users to exit the state gracefully.
   * Visual Feedback: The feedback after an answer is text-heavy.
       * Improvement: Use better visual hierarchy (bolding, code blocks for answers) and perhaps "Success/Failure"
         stickers or distinct emojis to make results instantly scannable.
   * Latency Transparency: AI generation takes time.
       * Improvement: Use ctx.sendChatAction('typing') while the AI is thinking so the user knows the bot hasn't
         crashed.

3. Production Readiness
   * Global Exception Filter: Currently, errors are handled locally or just logged. If the AI fails, the user might just
     see a spinning wheel.
       * Fix: Create a TelegrafExceptionFilter to catch all errors and send a "Friendly" error message to the user
         (e.g., "Oops! My brain is a bit foggy, try again in a moment").
   * Logging & Observability: You have a LoggerMiddleware, but it's basic.
       * Fix: Integrate a professional logger (like Winston or Pino) and log specific business events (e.g., "Quiz
         started", "Question generated", "Error in AI response").
   * Testing Strategy: The repository has zero tests.
       * Fix: Start with Unit Tests for UserService and AiService. Use @nestjs/testing for E2E tests to simulate a bot
         update.