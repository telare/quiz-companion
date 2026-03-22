import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
export enum Difficulty {
  JUNIOR = "junior",
  MIDDLE = "middle",
  SERNIOR = "senior",
}

export enum JS_TopicTitle {
  CLOSURES = "Closures",
  PROMISES = "Promises",
  EVENT_LOOP = "Event loop",
  HOISTING = "Hoisting",
  PROTOTYPES = "Prototypes",
  SCOPES = "Scopes",
  THIS_KEYWORD = "This keyword",
  ASYNC_AWAIT = "Async/Await",
  GENERATORS = "Generators",
  GARBAGE_COLLECTION = "Garbage collection",
  CLASSES = "Classes",
  CURRYING = "Currying",
  DESTRUCTURING = "Destructuring",
  MAP_AND_SET = "Map and Set",
  WEAK_MAP = "WeakMap",
  PROXY = "Proxy",
  REFLECT = "Reflect",
  MODULES = "Modules",
  STRICT_MODE = "Strict mode",
  TYPE_COERCION = "Type coercion",
  SYMBOLS = "Symbols",
  MEMORY_MANAGEMENT = "Memory management",
  WEB_APIS = "Web APIs",
  DOM_API = "DOM API",
  DESIGN_PATTERNS = "Design patterns",
  PERFORMANCE = "Performance",
  OTHER = "Other",
}

export enum ENGLISH_TopicTitle {
  TENSES = "Tenses",
  ARTICLES = "Articles",
  PREPOSITIONS = "Prepositions",
  CONDITIONALS = "Conditionals",
  MODAL_VERBS = "Modal Verbs",
  PASSIVE_VOICE = "Passive Voice",
  REPORTED_SPEECH = "Reported Speech",
  RELATIVE_CLAUSES = "Relative Clauses",
  CONJUNCTIONS = "Conjunctions",
  PUNCTUATION = "Punctuation",
  SUBJECT_VERB_AGREEMENT = "Subject-Verb Agreement",
  PRONOUNS = "Pronouns",
  ADJECTIVES_AND_ADVERBS = "Adjectives and Adverbs",
  COMPARATIVES_AND_SUPERLATIVES = "Comparatives and Superlatives",
  GERUNDS_AND_INFINITIVES = "Gerunds and Infinitives",
  PHRASAL_VERBS = "Phrasal Verbs",
  COLLOCATIONS = "Collocations",
  WORD_ORDER = "Word Order",
  DETERMINERS = "Determiners",
  COUNTABLE_AND_UNCOUNTABLE_NOUNS = "Countable and Uncountable Nouns",
  DIRECT_AND_INDIRECT_SPEECH = "Direct and Indirect Speech",
  INVERSION = "Inversion",
  ELLIPSIS = "Ellipsis",
  CLEFT_SENTENCES = "Cleft Sentences",
  EMPHASIS = "Emphasis",
  VOCABULARY_IN_CONTEXT = "Vocabulary in Context",
}

export enum Category {
  JS = "javascript",
  ENGLISH = "english",
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
  topicTitle: JS_TopicTitle | ENGLISH_TopicTitle;

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
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
