import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export enum Category {
  ENGLISH = 'english',
  JS = 'javascript',
}

export enum Difficulty {
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SERNIOR = 'senior',
}

export enum ENGLISH_TopicTitle {
  ADJECTIVES_AND_ADVERBS = 'Adjectives and Adverbs',
  ARTICLES = 'Articles',
  CLEFT_SENTENCES = 'Cleft Sentences',
  COLLOCATIONS = 'Collocations',
  COMPARATIVES_AND_SUPERLATIVES = 'Comparatives and Superlatives',
  CONDITIONALS = 'Conditionals',
  CONJUNCTIONS = 'Conjunctions',
  COUNTABLE_AND_UNCOUNTABLE_NOUNS = 'Countable and Uncountable Nouns',
  DETERMINERS = 'Determiners',
  DIRECT_AND_INDIRECT_SPEECH = 'Direct and Indirect Speech',
  ELLIPSIS = 'Ellipsis',
  EMPHASIS = 'Emphasis',
  GERUNDS_AND_INFINITIVES = 'Gerunds and Infinitives',
  INVERSION = 'Inversion',
  MODAL_VERBS = 'Modal Verbs',
  PASSIVE_VOICE = 'Passive Voice',
  PHRASAL_VERBS = 'Phrasal Verbs',
  PREPOSITIONS = 'Prepositions',
  PRONOUNS = 'Pronouns',
  PUNCTUATION = 'Punctuation',
  RELATIVE_CLAUSES = 'Relative Clauses',
  REPORTED_SPEECH = 'Reported Speech',
  SUBJECT_VERB_AGREEMENT = 'Subject-Verb Agreement',
  TENSES = 'Tenses',
  VOCABULARY_IN_CONTEXT = 'Vocabulary in Context',
  WORD_ORDER = 'Word Order',
}

export enum JS_TopicTitle {
  ASYNC_AWAIT = 'Async/Await',
  CLASSES = 'Classes',
  CLOSURES = 'Closures',
  CURRYING = 'Currying',
  DESIGN_PATTERNS = 'Design patterns',
  DESTRUCTURING = 'Destructuring',
  DOM_API = 'DOM API',
  EVENT_LOOP = 'Event loop',
  GARBAGE_COLLECTION = 'Garbage collection',
  GENERATORS = 'Generators',
  HOISTING = 'Hoisting',
  MAP_AND_SET = 'Map and Set',
  MEMORY_MANAGEMENT = 'Memory management',
  MODULES = 'Modules',
  OTHER = 'Other',
  PERFORMANCE = 'Performance',
  PROMISES = 'Promises',
  PROTOTYPES = 'Prototypes',
  PROXY = 'Proxy',
  REFLECT = 'Reflect',
  SCOPES = 'Scopes',
  STRICT_MODE = 'Strict mode',
  SYMBOLS = 'Symbols',
  THIS_KEYWORD = 'This keyword',
  TYPE_COERCION = 'Type coercion',
  WEAK_MAP = 'WeakMap',
  WEB_APIS = 'Web APIs',
}
@Schema()
export class Question {
  @Prop({ required: true, unique: true })
  questionText: string;

  @Prop({
    required: true,
    type: String,
    enum: [
      ...Object.values(JS_TopicTitle),
      ...Object.values(ENGLISH_TopicTitle),
    ],
    default: JS_TopicTitle.OTHER,
  })
  topicTitle: ENGLISH_TopicTitle | JS_TopicTitle;

  @Prop({
    required: true,
    enum: Difficulty,
    default: Difficulty.MIDDLE,
  })
  difficulty: Difficulty;

  @Prop({
    required: true,
    enum: Category,
    default: Category.JS,
  })
  category: Category;

  @Prop({ required: false })
  codeSnippet?: string;

  @Prop({ required: false })
  sentenceExample?: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correctOptionIndex: number;

  @Prop({ required: true })
  explanation: string;

  @Prop({ required: false })
  isPopular?: boolean;
}

export type QuestionDocument = Document & Question;

export const QuestionSchema = SchemaFactory.createForClass(Question);
