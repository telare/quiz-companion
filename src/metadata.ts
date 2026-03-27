/* eslint-disable */
export default async () => {
  const t = {
    ["./modules/question/entities/question.entity"]:
      await import("./modules/question/entities/question.entity"),
    ["./modules/users/entities/user.entity"]:
      await import("./modules/users/entities/user.entity"),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./modules/question/entities/question.entity"),
          {
            Question: {
              questionText: { required: true, type: () => String },
              topicTitle: { required: true, type: () => Object },
              difficulty: {
                required: true,
                enum: t["./modules/question/entities/question.entity"]
                  .Difficulty,
              },
              category: {
                required: true,
                enum: t["./modules/question/entities/question.entity"].Category,
              },
              codeSnippet: { required: false, type: () => String },
              sentenceExample: { required: false, type: () => String },
              options: { required: true, type: () => [String] },
              correctOptionIndex: { required: true, type: () => Number },
              explanation: { required: true, type: () => String },
            },
          },
        ],
        [
          import("./modules/users/entities/user.entity"),
          {
            User: {
              username: { required: true, type: () => String },
              totalPoints: { required: false, type: () => Number },
              rank: {
                required: false,
                enum: t["./modules/users/entities/user.entity"].UserRank,
              },
            },
          },
        ],
        [
          import("./modules/question/dto/create-question.dto"),
          {
            CreateQuestionDTO: {
              questionText: { required: true, type: () => String },
              topicTitle: { required: true, type: () => Object },
              difficulty: {
                required: true,
                enum: t["./modules/question/entities/question.entity"]
                  .Difficulty,
              },
              category: {
                required: true,
                enum: t["./modules/question/entities/question.entity"].Category,
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
          import("./modules/favorite-question/entities/favorite-question.entity"),
          {
            Favorite: {
              userId: { required: true, type: () => String },
              questionId: { required: true, type: () => String },
              savedAt: { required: true, type: () => Number },
            },
          },
        ],
        [
          import("./modules/favorite-question/dto/update-favorite-question.dto"),
          { UpdateFavoriteQuestionDto: {} },
        ],
        [
          import("./modules/users/dto/create-user.dto"),
          {
            CreateUserDto: {
              username: { required: true, type: () => String },
              totalPoints: { required: true, type: () => Number },
              rank: {
                required: true,
                enum: t["./modules/users/entities/user.entity"].UserRank,
              },
            },
          },
        ],
        [import("./modules/users/dto/update-user.dto"), { UpdateUserDto: {} }],
      ],
      controllers: [
        [
          import("./modules/question/question.controller"),
          {
            QuestionController: {
              getOne: {
                type: t["./modules/question/entities/question.entity"].Question,
              },
              getAll: {
                type: [
                  t["./modules/question/entities/question.entity"].Question,
                ],
              },
              createOne: { type: Object },
              createMany: {
                type: [
                  t["./modules/question/entities/question.entity"].Question,
                ],
              },
              updateOne: { type: Object },
              deleteOne: { type: Object },
            },
          },
        ],
        [
          import("./modules/favorite-question/favorite-question.controller"),
          {
            FavoriteQuestionController: {
              findAll: { type: [Object] },
              createOne: { type: Object },
            },
          },
        ],
        [
          import("./modules/bot/bot.controller"),
          { BotController: { handleWebhook: { type: Object } } },
        ],
        [
          import("./modules/users/user.controller"),
          {
            UserController: {
              findOne: { type: Object },
              findMany: { type: [Object] },
              createOne: { type: Object },
              createMany: { type: [Object] },
              updateOne: {},
              deleteOne: {
                type: t["./modules/users/entities/user.entity"].User,
              },
            },
          },
        ],
      ],
    },
  };
};
