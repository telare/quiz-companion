import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
export enum Difficulty {
  JUNIOR = "junior",
  MIDDLE = "middle",
  SERNIOR = "senior",
}

enum TopicTitle {
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
@Schema()
export class Question {
  @Prop({ required: true, unique: true })
  questionText: string;

  @Prop({
    required: true,
    enum: TopicTitle,
    default: TopicTitle.OTHER,
  })
  topicTitle: string;

  @Prop({
    required: true,
    enum: Difficulty,
    default: Difficulty.MIDDLE,
  })
  difficulty: string;

  @Prop({
    type: String,
    default: null,
  })
  codeSnippet: string | null;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correctOptionIndex: number;

  @Prop({ required: true })
  explanation: string;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
