import { Wizard, WizardStep, Context, Action, Ctx } from "nestjs-telegraf";
import type { WizardSceenContext } from "../wizard-scene.context";
import { ServiceUnavailableException, UseGuards } from "@nestjs/common";
import { getErrorMessage } from "../../utils";
import { QuestionService } from "../../question/question.service";
import { BotService } from "../../bot/bot.service";
import { UserService } from "../../users/user.service";
import { Markup } from "telegraf";
import { AuthGuard } from "../../auth.guard";
import { MyWizardState } from "../wizard-state.interface";
import { FavoriteQuestionService } from "../../favorite-question/favorite-question.service";
import { Difficulty } from "../../schemas/question.schema";

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
      console.error("missing question by id", current);
      return;
    }
    const userId = state.userId;
    if (!userId) {
      console.error("missing userId in the wizard's state", userId);
      return;
    }
    const { fullMessage, keyboard } = await this.questionService.buildQuestion(
      userId,
      questionData,
    );
    await ctx.reply(fullMessage, {
      parse_mode: "HTML",
      ...keyboard,
    });
  }

  @WizardStep(1)
  async onEnter(@Context() ctx: WizardSceenContext) {
    await ctx.reply("Welcome!");
    try {
      const topics = await this.questionService.countQuestionsByTopic();

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
      state.score = 0;
      state.userName = userName;
      state.runStatistic = {
        correct: 0,
        incorrect: 0,
      };

      const keyboard = this.botService.createInlineKeyboard(keyboardData);
      await ctx.reply("Pick any topic from the list below:", {
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
    ctx.wizard.next();
  }

  @WizardStep(2)
  @Action(/selectedTopic:(.+)/)
  async onTopicPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const state = ctx.wizard.state as MyWizardState;

    const [, topicName] = cbQuery.data.split(":");
    state.topic = topicName;

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

  @WizardStep(3)
  @Action(/difficulty:(.+)/)
  async onDifficultyPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;

    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const state = ctx.wizard.state as MyWizardState;
    const [, difficulty] = cbQuery.data.split(":");
    state.difficulty = difficulty;

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

  @WizardStep(4)
  @Action(/quizLength:(.+)/)
  async onLengthPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const state = ctx.wizard.state as MyWizardState;
    const [, quizLength] = cbQuery.data.split(":");
    state.quizLength = Number(quizLength);
    const topic = state.topic;
    const difficulty = state.difficulty;
    if (!topic || !difficulty) {
      throw new Error("Missing topic or difficulty in the wizard's state");
    }

    const questionData = await this.questionService.findManyCustomized(
      topic,
      difficulty,
    );
    if (!questionData || questionData.length === 0) {
      throw new ServiceUnavailableException("Service failed to find questions");
    }
    state.questionIds = questionData.map((q) => q._id.toString());
    state.currentIndex = 0;
    await this.logOneQuestion(ctx);
    ctx.wizard.next();
  }

  @WizardStep(5)
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
      const state = ctx.wizard.state as MyWizardState;

      const userId = state.userId;
      const runStatistic = state.runStatistic;
      if (!userId || !runStatistic) {
        throw new Error("Missing userId or runStatistic in the wizard's state");
      }

      let userScore = state.score;
      if (userScore === undefined) {
        throw new Error("Missing userScore in the wizard's state");
      }
      if (result.isCorrect) {
        userScore += 1;
        runStatistic.correct++;
      } else {
        userScore = userScore > 0 ? --userScore : 0;
        runStatistic.incorrect++;
      }

      const statusEmoji = result.isCorrect ? "✅" : "❌";
      const statusText = result.isCorrect
        ? `<b>Correct!</b> You've gained 1 point.`
        : `<b>Incorrect.</b> You've lost 1 point.`;

      const feedback = [
        `\n— — — — — — — — — — — —`,
        `${statusEmoji} ${statusText}`,
        `<b>Correct answer:</b> <code>${result.correctAnswer}</code>`,
        `\n<b>Explanation:</b>`,
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
      const { fullMessage } = await this.questionService.buildQuestion(
        userId,
        question,
      );

      await ctx.editMessageText(fullMessage + feedback, {
        parse_mode: "HTML",
        ...keyboard,
      });
      state.score = userScore;

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
        console.log(currentIndex, quizLength - 1);
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

  @WizardStep(6)
  async onResults(@Ctx() ctx: WizardSceenContext) {
    const state = ctx.wizard.state as MyWizardState;
    const {
      score,
      runStatistic: { correct, incorrect },
      difficulty,
      topic,
      quizLength,
    } = state;

    const percentage = Math.round((correct / (quizLength || 1)) * 100);
    let rank = "🥉 Keep practicing!";
    if (percentage >= 80) rank = "🥇 Interview Ready!";
    else if (percentage >= 50) rank = "🥈 Getting there!";

    const header = `<b>🏁 Quiz Completed!</b>\n\n`;

    const details = [
      `<b>Topic:</b> ${topic}`,
      `<b>Level:</b> ${difficulty}`,
      `— — — — — — — — — — — —\n`,
    ].join("\n");

    const stats = [
      `✅ <b>Correct:</b> <code>${correct}</code>`,
      `❌ <b>Incorrect:</b> <code>${incorrect}</code>`,
      `📊 <b>Accuracy:</b> <code>${percentage}%</code>`,
      `— — — — — — — — — — — —\n`,
    ].join("\n");

    const footer = [
      `🏆 <b>Result:</b> ${rank}`,
      `✨ <b>Points Gained:</b> <code>+${score}</code>`,
      `✨ <b>Points Lost:</b> <code>-${incorrect}</code>`,
      `\n<i>Type /quiz to start a new session!</i>`,
    ].join("\n");

    const fullMessage = header + details + stats + footer;

    const userName = ctx.from?.username;
    if (userName && score) {
      await this.userService.incrementPoints(userName, score);
    }

    const shareText = `I scored ${correct}/${quizLength} on the ${topic} interview quiz! 🚀`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.switchToChat("Share my result ↗️", shareText)],
      // [Markup.button.callback("🔄 Try Again", "restart_quiz")],
    ]);

    await ctx.reply(fullMessage, {
      parse_mode: "HTML",
      ...keyboard,
    });
    await ctx.scene.leave();
  }
}
