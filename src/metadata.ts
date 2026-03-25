export default async () => {
  const t = {
    ["./schemas/question.schema"]:
      await import("./modules/question/entities/question.entity"),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./modules/question/dto/create-question.dto"),
          {
            CreateQuestionDTO: {
              questionText: { required: true, type: () => String },
              topicTitle: { required: true, type: () => Object },
              difficulty: {
                required: true,
                enum: t["./schemas/question.schema"].Difficulty,
              },
              category: {
                required: true,
                enum: t["./schemas/question.schema"].Category,
              },
              codeSnippet: { required: false, type: () => String },
              sentenceExample: { required: false, type: () => String },
              options: {
                required: true,
                type: () => [String],
                minItems: 1,
                minItems: 3,
              },
              correctOptionIndex: { required: true, type: () => Number },
              explanation: { required: true, type: () => String },
            },
          },
        ],
        [
          import("./modules/question/dto/update-question.dto"),
          { UpdateQuestionDto: {} },
        ],
        [
          import("./modules/favorite-question/dto/create-favorite-question.dto"),
          {
            CreateFavoriteQuestionDto: {
              userId: { required: true, type: () => String },
              questionId: { required: true, type: () => String },
              savedAt: { required: false, type: () => Number },
            },
          },
        ],
        [
          import("./modules/favorite-question/dto/update-favorite-question.dto"),
          { UpdateFavoriteQuestionDto: {} },
        ],
        [
          import("./modules/favorite-question/entities/favorite-question.entity"),
          { FavoriteQuestion: {} },
        ],
      ],
      controllers: [
        [
          import("./modules/question/question.controller"),
          {
            QuestionController: {
              getOne: { type: t["./schemas/question.schema"].Question },
              getAll: { type: [t["./schemas/question.schema"].Question] },
              createOne: { type: Object },
              createMany: { type: [t["./schemas/question.schema"].Question] },
              updateOne: { type: Object },
            },
          },
        ],
        [
          import("./modules/favorite-question/favorite-question.controller"),
          {
            FavoriteQuestionController: {
              findAll: { type: [Object] },
              save: { type: Object },
            },
          },
        ],
        [
          import("./modules/bot/bot.controller"),
          { BotController: { handleWebhook: { type: Object } } },
        ],
      ],
    },
  };
};
