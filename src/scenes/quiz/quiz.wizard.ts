import {
  Wizard,
  WizardStep,
  Context,
  Action,
  Ctx,
  Hears,
} from "nestjs-telegraf";
import type { WizardSceenContext } from "../wizard-scene.context";
import { Logger, ServiceUnavailableException, UseGuards } from "@nestjs/common";
import { DIFFICULTY_MULTIPLIERS, getErrorMessage } from "../../common/utils";
import { BotService } from "../../modules/bot/bot.service";
import { Markup } from "telegraf";
import { MyWizardState, TopicTitle } from "../wizard-state.interface";
import {
  Category,
  Difficulty,
} from "../../modules/question/entities/question.entity";
import { AuthGuard } from "../../common/guards";
import { QuestionService } from "../../modules/question/question.service";
import { FavoriteQuestionService } from "../../modules/favorite-question/favorite-question.service";
import { UserService } from "../../modules/users/user.service";
import { UserRank } from "../../modules/users/entities/user.entity";

/* 
Core workflow logic:
- step 1 - 4 - set up, fetch question ids
- step 5 - log question
- step 6 - proccess the answer, check index if current < length - 1 ? increment index and set(5) : next()
- step 7 - read score, write into db, log to user
*/

@UseGuards(AuthGuard)
@Wizard("QUIZ_WIZARD")
export class QuizWizard {
  private readonly logger = new Logger(QuizWizard.name);
  constructor(
    private readonly questionService: QuestionService,
    private readonly botService: BotService,
    private readonly favoriteService: FavoriteQuestionService,
    private readonly userService: UserService,
  ) {}
  private async logOneQuestion(@Ctx() ctx: WizardSceenContext) {
    const state = ctx.wizard.state as MyWizardState;
    const questionIds = state.questionIds;
    const currentIndex = state.currentIndex;
    if (!questionIds) {
      throw new Error("Missing questionIds in the wizard's state");
    }
    if (questionIds.length === 0) {
      throw new Error("Missing questionIds.length in the wizard's state");
    }
    if (currentIndex === undefined) {
      throw new Error("Missing currentIndex in the wizard's state");
    }

    const current = questionIds[currentIndex];
    state.current = current;
    const questionData = await this.questionService.findById(current);
    if (!questionData) {
      this.logger.error("missing question by id", current);
      return;
    }
    const userId = state.userId;
    if (!userId) {
      this.logger.error("missing userId in the wizard's state", userId);
      return;
    }
    const { fullMessage, keyboard } = await this.questionService.buildQuestion({
      userId,
      questionData,
    });
    await ctx.reply(fullMessage, {
      parse_mode: "HTML",
      ...keyboard,
    });
  }

  private getRank(totalPoints: number): UserRank {
    if (totalPoints >= 0 && totalPoints <= 30) {
      return UserRank.Iron;
      // make as const in constants like Silver_USER_RANK = 51
    } else if (totalPoints <= 50) {
      return UserRank.Bronze;
    } else if (totalPoints <= 80) {
      return UserRank.Silver;
    } else if (totalPoints <= 105) {
      return UserRank.Gold;
    } else if (totalPoints <= 130) {
      return UserRank.Platinum;
    } else if (totalPoints <= 170) {
      return UserRank.Diamond;
    }
    return UserRank.Master;
  }

  @WizardStep(1)
  async onEnter(@Context() ctx: WizardSceenContext) {
    await ctx.reply("Welcome!");
    await this.botService.replyWithQuizKeyboard(ctx);
    try {
      const state = ctx.wizard.state as MyWizardState;
      const userName = ctx.from?.username;
      if (!userName) {
        throw new Error("No username during wizard step 1");
      }
      const userInDb = await this.userService.findByName(userName);
      if (!userInDb) {
        throw new Error("Please sign in");
      }
      state.userId = userInDb._id.toString();
      state.userName = userName;
      state.runStatistic = {
        correct: 0,
        incorrect: 0,
      };
      state.rank = userInDb.rank;
      state.totalPoints = userInDb.totalPoints;

      const categories = await this.questionService.getCategories();

      if (!categories) {
        throw new ServiceUnavailableException(
          "Service failed to retrieve technologies",
        );
      }
      const keyboardData = categories.map((cat) => ({
        buttonText: `${cat.category}`,
        callbackData: `category:${cat._id}`,
      }));
      const keyboard = this.botService.createInlineKeyboard(keyboardData);
      await ctx.reply("Pick any quiz category from suggested:", {
        ...keyboard,
      });
      ctx.wizard.next();
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }
  @WizardStep(2)
  @Action(/category:(.+)/)
  async onCategoryPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const state = ctx.wizard.state as MyWizardState;

    const [, category] = cbQuery.data.split(":");
    state.category = category as Category;

    const topics = await this.questionService.countQuestionsByTopic(
      state.category,
    );

    if (!topics) {
      throw new ServiceUnavailableException(
        "Service failed to retrieve question topics",
      );
    }
    const descSortedTopics = topics.sort(
      (a, b) => b.totalByTopic - a.totalByTopic,
    );
    const keyboardData = descSortedTopics.map((topic) => ({
      buttonText: `${topic._id} [${topic.totalByTopic}]`,
      callbackData: `selectedTopic:${topic._id}`,
    }));
    const keyboard = this.botService.createInlineKeyboard(keyboardData);
    await ctx.editMessageText("Pick any topic from the list below:", {
      ...keyboard,
    });
    ctx.wizard.next();
  }

  @WizardStep(3)
  @Action(/selectedTopic:(.+)/)
  async onTopicPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const state = ctx.wizard.state as MyWizardState;

    const [, topicName] = cbQuery.data.split(":");
    state.topic = topicName as TopicTitle;

    const difficultyLevelKeyboardData = Object.values(Difficulty).map(
      (difficulty) => ({
        buttonText: difficulty,
        callbackData: `difficulty:${difficulty.toLowerCase()}`,
      }),
    );
    const keyboard = this.botService.createInlineKeyboard(
      difficultyLevelKeyboardData,
    );
    await ctx.editMessageText("Pick difficulty level from the list below:", {
      ...keyboard,
    });
    ctx.wizard.next();
  }

  @WizardStep(4)
  @Action(/difficulty:(.+)/)
  async onDifficultyPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;

    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }

    const state = ctx.wizard.state as MyWizardState;
    const [, difficulty] = cbQuery.data.split(":");
    state.difficulty = difficulty as Difficulty;

    const quizLengthKeyboardData = ["1", "5", "10"].map((qlength) => ({
      buttonText: qlength,
      callbackData: `quizLength:${qlength}`,
    }));
    const keyboard = this.botService.createInlineKeyboard(
      quizLengthKeyboardData,
    );
    await ctx.editMessageText("Pick quiz length from the list below:", {
      ...keyboard,
    });
    ctx.wizard.next();
  }

  @WizardStep(5)
  @Action(/quizLength:(.+)/)
  async onLengthPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }

    // removes the loading spinner on the button
    await ctx.answerCbQuery();

    // removes the inline buttons
    await ctx.editMessageReplyMarkup(undefined);

    const state = ctx.wizard.state as MyWizardState;
    const [, quizLength] = cbQuery.data.split(":");
    state.quizLength = Number(quizLength);
    const topic = state.topic;
    const difficulty = state.difficulty;
    const category = state.category;
    if (!topic || !difficulty || !category) {
      throw new Error(
        "Missing topic | difficulty | category in the wizard's state",
      );
    }

    const questionData = await this.questionService.findManyCustomized(
      topic,
      category,
      difficulty,
      state.quizLength,
    );
    if (!questionData || questionData.length === 0) {
      await ctx.reply(
        "Quiz ended. \nNo questions found for this topic/difficulty. Please try again.",
      );
      return ctx.scene.leave();
    }

    if (questionData.length < state.quizLength) {
      state.quizLength = questionData.length;
      await ctx.reply(
        `⚠️ Only ${questionData.length} questions available. Adjusting quiz length.`,
      );
    }
    state.questionIds = questionData.map((q) => q._id.toString());
    state.currentIndex = 0;
    await this.logOneQuestion(ctx);
    ctx.wizard.next();
  }

  @WizardStep(6)
  @Action(/^quiz:/)
  async onAnswer(@Ctx() ctx: WizardSceenContext) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId, choice] = cbQuery.data.split(":");

      const question = await this.questionService.findById(questionId);
      if (!question) return;

      const result = await this.questionService.checkQuestion(
        questionId,
        parseInt(choice),
      );
      if (!result) {
        await ctx.reply("Something went wrong while checking the question.");
        return;
      }
      const state = ctx.wizard.state as MyWizardState;

      const userId = state.userId;
      const runStatistic = state.runStatistic;
      if (!userId || !runStatistic) {
        throw new Error("Missing userId or runStatistic in the wizard's state");
      }

      if (result.isCorrect) {
        runStatistic.correct++;
      } else {
        runStatistic.incorrect++;
      }

      const statusEmoji = result.isCorrect ? "✅" : "❌";
      const statusText = result.isCorrect
        ? `<b>Correct!</b> You've gained 1 point.`
        : `<b>Incorrect.</b> You've lost 1 point.`;

      const feedback = [
        `\n— — — — — — — — — — — —`,
        `${statusEmoji} ${statusText}`,
        `<b>💡 Correct answer:</b> <code>${result.correctAnswer}</code>`,
        `\n<b>📖 Explanation:</b>`,
        `<i>${result.explanation}</i>`,
      ].join("\n");
      const isAlreadySaved = await this.favoriteService.findOne({
        userId,
        questionId,
      });
      const saveQuestionButton = {
        buttonText: "⭐ Save question",
        callbackData: `save:${questionId}`,
      };
      const unSaveButton = {
        buttonText: "🗑 Remove from saved",
        callbackData: `unsave:${questionId}`,
      };
      const keyboard = this.botService.createInlineKeyboard([
        isAlreadySaved ? unSaveButton : saveQuestionButton,
      ]);
      const { fullMessage } = await this.questionService.buildQuestion({
        userId,
        questionData: question,
      });

      await ctx.editMessageText(fullMessage + feedback, {
        parse_mode: "HTML",
        ...keyboard,
      });

      let currentIndex = state.currentIndex;
      const quizLength = state.quizLength;
      if (
        currentIndex === undefined ||
        quizLength === undefined ||
        quizLength === 0
      ) {
        throw new Error(
          "Missing currentIndex or quizLength in the wizard's state",
        );
      }
      if (currentIndex < quizLength - 1) {
        this.logger.log(currentIndex, quizLength - 1);
        currentIndex = currentIndex + 1;
        state.currentIndex = currentIndex;
        return await this.logOneQuestion(ctx);
      } else {
        ctx.wizard.next();
        return await this.onResults(ctx);
      }
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Hears("🚫 Cancel Quiz")
  async onQuizCancel(@Ctx() ctx: WizardSceenContext) {
    ctx.wizard.selectStep(7);
    return await this.onResults(ctx);
  }

  @WizardStep(7)
  async onResults(@Ctx() ctx: WizardSceenContext) {
    const state = ctx.wizard.state as MyWizardState;
    const {
      runStatistic: { correct, incorrect },
      difficulty,
      topic,
      quizLength,
      totalPoints,
      rank,
    } = state;

    const percentage = Math.round((correct / (quizLength || 1)) * 100);

    const header = `<b>🏁 Quiz Completed!</b>\n\n`;
    const difficultyMultiplier = difficulty
      ? DIFFICULTY_MULTIPLIERS[difficulty]
      : 1;
    const details = [
      `<b>Topic:</b> ${topic || ""}`,
      `<b>Level:</b> ${difficulty || ""}`,
      `<b>Level Multiplier:</b> x${difficultyMultiplier}`,
      `— — — — — — — — — — — —\n`,
    ].join("\n");

    const stats = [
      `✅ <b>Correct:</b> <code>${correct}</code>`,
      `❌ <b>Incorrect:</b> <code>${incorrect}</code>`,
      `📊 <b>Accuracy:</b> <code>${percentage}%</code>`,
      `— — — — — — — — — — — —\n`,
    ].join("\n");

    const finalScore = (correct - incorrect) * difficultyMultiplier;
    const newRank = this.getRank(totalPoints ?? 0);
    const footer = [
      `🏆 <b>Rank before:</b> ${rank}`,
      `🏆 <b>Ranl after:</b> ${newRank}`,
      `✨ <b>Final score:</b> <code>${finalScore > 0 ? "+" : ""}${finalScore}</code>`,
      `\n<i>Type /quiz to start a new session!</i>`,
    ]
      .filter(Boolean)
      .join("\n");

    const fullMessage = header + details + stats + footer;

    const userName = ctx.from?.username;
    if (userName) {
      await this.userService.incrementPoints(userName, finalScore);
      await this.userService.updateOne(userName, { rank: newRank });
    }

    const shareText = `\n\n🎯 Just completed a ${topic} interview quiz!\n\n✅ Correct: ${correct}/${quizLength}\n📊 Accuracy: ${percentage}%\n🏆 Rank: ${newRank}\n\n💻 Think you can beat my score? Try it yourself!`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.switchToChat("Share my result ↗️", shareText)],
      // [Markup.button.callback("🔄 Try Again", "restart_quiz")],
    ]);

    await ctx.reply(fullMessage, {
      parse_mode: "HTML",
      ...keyboard,
    });
    await this.botService.replyWithStandardKeyboard(ctx);
    await ctx.scene.leave();
  }
}
