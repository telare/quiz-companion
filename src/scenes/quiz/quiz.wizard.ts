import { Logger, UseGuards } from '@nestjs/common';
import {
  Wizard,
  WizardStep,
  Context,
  Action,
  Ctx,
  Hears,
} from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import type { WizardSceenContext } from '../wizard-scene.context';

import { AuthGuard } from '../../common/guards';
import {
  DIFFICULTY_MULTIPLIERS,
  getErrorMessage,
  REPLY_KEYBOARD_BUTTONS_TEXT,
  WIZARD_KEYS,
} from '../../common/utils';
import { BotService } from '../../modules/bot/bot.service';
import { FavoriteQuestionService } from '../../modules/favorite-question/favorite-question.service';
import {
  Category,
  Difficulty,
} from '../../modules/question/entities/question.entity';
import { QuestionService } from '../../modules/question/question.service';
import { UserRank } from '../../modules/users/entities/user.entity';
import { UserService } from '../../modules/users/user.service';
import { MyWizardState, TopicTitle } from '../wizard-state.interface';

/* 
Core workflow logic:
- step 1 - 4 - set up, fetch question ids
- step 5 - log question
- step 6 - proccess the answer, check index if current < length - 1 ? increment index and set(5) : next()
- step 7 - read score, write into db, log to user
*/

@UseGuards(AuthGuard)
@Wizard(WIZARD_KEYS.quiz)
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
      await ctx.reply(
        "🛠️ INTERNAL ERROR: Missing questionIds in the wizard's state.\n\nPlease, contact the developer.",
      );
      return;
    }
    if (questionIds.length === 0) {
      await ctx.reply(
        "🛠️ INTERNAL ERROR: Missing questionIds.length in the wizard's state.\n\nPlease, contact the developer.",
      );
      return;
    }
    if (currentIndex === undefined) {
      await ctx.reply(
        "🛠️ INTERNAL ERROR: Missing currentIndex in the wizard's state.\n\nPlease, contact the developer.",
      );
      return;
    }

    const current = questionIds[currentIndex];
    state.current = current;
    const questionData = await this.questionService.findById(current);
    if (!questionData) {
      this.logger.error(
        '🛠️ INTERNAL ERROR: Missing question by id.\n\nPlease, contact the developer.',
        current,
      );
      return;
    }
    const userId = state.userId;
    if (!userId) {
      this.logger.error(
        "🛠️ INTERNAL ERROR: Missing userId in the wizard's state.\n\nPlease, contact the developer.",
        userId,
      );
      return;
    }
    const { fullMessage, keyboard } = await this.questionService.buildQuestion({
      userId,
      questionData,
    });
    await ctx.reply(fullMessage, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  }

  private getRank(totalPoints: number): UserRank {
    if (totalPoints >= 0 && totalPoints <= 30) {
      return UserRank.Iron;
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
    await ctx.reply('Welcome!');
    await this.botService.replyWithQuizKeyboard(ctx);
    try {
      const state = ctx.wizard.state as MyWizardState;
      const userName = ctx.from?.username;
      if (!userName) {
        await ctx.reply(
          'No username provided. Please set a username in Telegram settings to use the quiz.',
        );
        return;
      }
      const userInDb = await this.userService.findByName(userName);
      if (!userInDb) {
        await ctx.reply('Please sign in.');
        return;
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
        await ctx.reply(
          '🛠️ INTERNAL ERROR: Service failed to retrieve technologies.\n\nPlease, contact the developer.',
        );
        return await ctx.scene.leave();
      }
      const keyboardData = categories.map((cat) => ({
        buttonText: `${cat.category}`,
        callbackData: `category:${cat._id}`,
      }));
      const keyboard = this.botService.createInlineKeyboard(keyboardData);
      await ctx.reply('Pick any quiz category from suggested:', {
        ...keyboard,
      });
      ctx.wizard.next();
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
      return await ctx.scene.leave();
    }
  }

  @Hears(REPLY_KEYBOARD_BUTTONS_TEXT.CancelQuiz)
  async onQuizCancel(@Ctx() ctx: WizardSceenContext) {
    ctx.wizard.selectStep(7);
    return await this.onResults(ctx);
  }

  @Action(/category:(.+)/)
  @WizardStep(2)
  async onCategoryPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !('data' in cbQuery)) {
      return await ctx.scene.leave();
    }
    const state = ctx.wizard.state as MyWizardState;
    const [, category] = cbQuery.data.split(':');
    state.category = category as Category;

    // early exit for popular quiz mode, skips topic selection and goes directly to difficulty selection

    if (state.mode && state.mode === 'popular') {
      ctx.wizard.selectStep(2);
      return await this.onTopicPick(ctx);
    }
    const topics = await this.questionService.countQuestionsByTopic(
      state.category,
    );

    if (!topics) {
      await ctx.reply(
        '🛠️ INTERNAL ERROR: Service failed to retrieve question topics.\n\nPlease, contact the developer.',
      );
      return await ctx.scene.leave();
    }
    const descSortedTopics = topics.sort(
      (a, b) => b.totalByTopic - a.totalByTopic,
    );
    const keyboardData = descSortedTopics.map((topic) => ({
      buttonText: `${topic._id} [${topic.totalByTopic}]`,
      callbackData: `selectedTopic:${topic._id}`,
    }));
    const keyboard = this.botService.createInlineKeyboard(keyboardData);
    await ctx.editMessageText('Pick any topic from the list below:', {
      ...keyboard,
    });

    ctx.wizard.next();
  }

  @Action(/selectedTopic:(.+)/)
  @WizardStep(3)
  async onTopicPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !('data' in cbQuery)) {
      return await ctx.scene.leave();
    }
    const state = ctx.wizard.state as MyWizardState;

    // if it is not popular mode, we need to set topic based on user's pick, otherwise we skip this step
    if (!(state.mode && state.mode === 'popular')) {
      const [, topicName] = cbQuery.data.split(':');
      state.topic = topicName as TopicTitle;
    }

    const difficultyLevelKeyboardData = Object.values(Difficulty).map(
      (difficulty) => ({
        buttonText: difficulty,
        callbackData: `difficulty:${difficulty.toLowerCase()}`,
      }),
    );
    const keyboard = this.botService.createInlineKeyboard(
      difficultyLevelKeyboardData,
    );
    await ctx.editMessageText('Pick difficulty level from the list below:', {
      ...keyboard,
    });
    ctx.wizard.next();
  }

  @Action(/difficulty:(.+)/)
  @WizardStep(4)
  async onDifficultyPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;

    if (!cbQuery || !('data' in cbQuery)) {
      return await ctx.scene.leave();
    }

    const state = ctx.wizard.state as MyWizardState;
    const [, difficulty] = cbQuery.data.split(':');
    state.difficulty = difficulty as Difficulty;

    const quizLengthKeyboardData = ['1', '5', '10'].map((qlength) => ({
      buttonText: qlength,
      callbackData: `quizLength:${qlength}`,
    }));
    const keyboard = this.botService.createInlineKeyboard(
      quizLengthKeyboardData,
    );
    await ctx.editMessageText('Pick quiz length from the list below:', {
      ...keyboard,
    });
    ctx.wizard.next();
  }

  @Action(/quizLength:(.+)/)
  @WizardStep(5)
  async onLengthPick(@Ctx() ctx: WizardSceenContext) {
    const cbQuery = ctx.callbackQuery;
    if (!cbQuery || !('data' in cbQuery)) {
      return;
    }

    // removes the loading spinner on the button
    await ctx.answerCbQuery();

    // removes the inline buttons
    await ctx.editMessageReplyMarkup(undefined);

    const state = ctx.wizard.state as MyWizardState;
    const [, quizLength] = cbQuery.data.split(':');

    state.quizLength = Number(quizLength);
    const topic = state.topic;
    const difficulty = state.difficulty;
    const category = state.category;

    // throw error if no topic/difficulty/category selected & mode is !popular
    // in popular skip topic check, throw error if no difficulty/category selected

    if (state.mode && state.mode === 'popular') {
      if (!difficulty || !category) {
        console.error(
          'Missing difficulty/category selection in popular quiz mode',
          state,
        );
        await ctx.reply(
          '🛠️ INTERNAL ERROR: Quiz ended.\nMissing difficulty/category selection.\n\nPlease, contact the developer.',
        );

        return ctx.scene.leave();
      }
    } else {
      if (!topic || !difficulty || !category) {
        await ctx.reply(
          '🛠️ INTERNAL ERROR: Quiz ended.\nMissing topic/difficulty/category selection.\n\nPlease, contact the developer.',
        );
        return ctx.scene.leave();
      }
    }
    let questionData;

    if (state.mode && state.mode === 'popular') {
      questionData =
        await this.questionService.findManyPopularQuestionsByCategory(
          category,
          difficulty,
          state.quizLength,
        );
    } else {
      questionData = await this.questionService.findManyCustomized(
        // fix type assertion
        topic!,
        category,
        difficulty,
        state.quizLength,
      );
    }
    if (!questionData || questionData.length === 0) {
      await ctx.reply(
        'Quiz ended. \nNo questions found for this topic/difficulty.\n\nPlease, contact the developer.',
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

  @Action(/^quiz:/)
  @WizardStep(6)
  async onAnswer(@Ctx() ctx: WizardSceenContext) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !('data' in cbQuery)) {
        return;
      }

      const [, questionId, choice] = cbQuery.data.split(':');

      const question = await this.questionService.findById(questionId);
      if (!question) return;

      const result = await this.questionService.checkQuestion(
        questionId,
        parseInt(choice),
      );
      if (!result) {
        await ctx.reply(
          '🛠️ INTERNAL ERROR: Something went wrong while checking the question.\n\nPlease, contact the developer.',
        );
        return ctx.scene.leave();
      }
      const state = ctx.wizard.state as MyWizardState;

      const userId = state.userId;
      const runStatistic = state.runStatistic;
      if (!userId || !runStatistic) {
        await ctx.reply(
          "🛠️ INTERNAL ERROR: Missing userId or runStatistic in the wizard's state.\n\nPlease, contact the developer.",
        );
        return ctx.scene.leave();
      }

      if (result.isCorrect) {
        runStatistic.correct++;
      } else {
        runStatistic.incorrect++;
      }

      const statusEmoji = result.isCorrect ? '✅' : '❌';
      const statusText = result.isCorrect
        ? `<b>Correct!</b> You've gained 1 point.`
        : `<b>Incorrect.</b> You've lost 1 point.`;

      const feedback = [
        `\n— — — — — — — — — — — —`,
        `${statusEmoji} ${statusText}`,
        `<b>💡 Correct answer:</b> <code>${result.correctAnswer}</code>`,
        `\n<b>📖 Explanation:</b>`,
        `<i>${result.explanation}</i>`,
      ].join('\n');
      const isAlreadySaved = await this.favoriteService.findOne({
        userId,
        questionId,
      });
      const saveQuestionButton = {
        buttonText: '⭐ Save question',
        callbackData: `save:${questionId}`,
      };
      const unSaveButton = {
        buttonText: '🗑 Remove from saved',
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
        parse_mode: 'HTML',
        ...keyboard,
      });

      let currentIndex = state.currentIndex;
      const quizLength = state.quizLength;
      if (
        currentIndex === undefined ||
        quizLength === undefined ||
        quizLength === 0
      ) {
        await ctx.reply(
          "🛠️ INTERNAL ERROR: Missing currentIndex or quizLength in the wizard's state.\n\nPlease, contact the developer.",
        );
        return ctx.scene.leave();
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
      userId,
    } = state;

    const percentage = Math.round((correct / (quizLength || 1)) * 100);

    const header = `<b>🏁 Quiz Completed!</b>\n\n`;
    const difficultyMultiplier = difficulty
      ? DIFFICULTY_MULTIPLIERS[difficulty]
      : 1;
    const details = [
      `<b>Topic:</b> ${topic || ''}`,
      `<b>Level:</b> ${difficulty || ''}`,
      `<b>Level Multiplier:</b> x${difficultyMultiplier}`,
      `— — — — — — — — — — — —\n`,
    ].join('\n');

    const stats = [
      `✅ <b>Correct:</b> <code>${correct}</code>`,
      `❌ <b>Incorrect:</b> <code>${incorrect}</code>`,
      `📊 <b>Accuracy:</b> <code>${percentage}%</code>`,
      `— — — — — — — — — — — —\n`,
    ].join('\n');

    const finalScore = (correct - incorrect) * difficultyMultiplier;
    const newRank = this.getRank(totalPoints ?? 0);
    const footer = [
      `🏆 <b>Rank before:</b> ${rank}`,
      `🏆 <b>Ranl after:</b> ${newRank}`,
      `✨ <b>Final score:</b> <code>${finalScore > 0 ? '+' : ''}${finalScore}</code>`,
      `\n<i>Type /quiz to start a new session!</i>`,
    ]
      .filter(Boolean)
      .join('\n');

    const fullMessage = header + details + stats + footer;

    if (userId) {
      await Promise.all([
        this.userService.incrementPoints(userId, finalScore),
        this.userService.updateOne(userId, { rank: newRank }),
      ]);
    }

    const shareText = `\n\n🎯 Just completed a ${topic} interview quiz!\n\n✅ Correct: ${correct}/${quizLength}\n📊 Accuracy: ${percentage}%\n🏆 Rank: ${newRank}\n\n💻 Think you can beat my score? Try it yourself!`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.switchToChat('Share my result ↗️', shareText)],
      // [Markup.button.callback("🔄 Try Again", "restart_quiz")],
    ]);

    await ctx.reply(fullMessage, {
      parse_mode: 'HTML',
      ...keyboard,
    });
    await this.botService.replyWithStandardKeyboard(ctx);
    await ctx.scene.leave();
  }
}
