# AI-Powered Quiz Telegram Bot

A modular **NestJS** backend for a Telegram bot that generates dynamic, AI-powered quizzes for developers and English learners. The project leverages **Google Gemini AI** for on-the-fly content generation and **MongoDB** for persistence.

---

## Key Features

- **AI Question Generation:** Creates unique questions on technical topics (React, NestJS, etc.) and English grammar using the Gemini API.
- **Persistent Storage:** Saves every generated question in MongoDB to ensure reliable answer verification and analytics.
- **Interactive UX:** Uses Telegram's `Inline Keyboards` and `@Action` decorators for seamless, real-time answer processing.
- **Scalable Architecture:** Built with a modular NestJS structure, separating AI logic, database management, and Telegram interactions.
- **Automatic Registration:** "Find or Create" logic to track users and their progress.

---

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Bot Engine:** [Telegraf](https://telegraf.js.org/) with `@nestjs-telegraf`
- **Database:** [MongoDB](https://www.mongodb.com/) via Mongoose
- **AI Integration:** [Google Gemini AI](https://ai.google.dev/)
- **Language:** TypeScript

## License

This project is licensed under the MIT License.
