import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { Category } from '../modules/question/entities/question.entity';

type DomainType = keyof typeof DOMAINS;

interface Question {
  codeSnippet?: null | string;
  correctOptionIndex: number;
  difficulty: string;
  explanation: string;
  options: string[];
  questionText: string;
  sentenceExample?: null | string;
  topicTitle: string;
}

const AI_STUDIO_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;
const QUIZ_API_ENDPOINT = process.env.QUIZ_API_ENDPOINT;
if (!AI_STUDIO_KEY || !QUIZ_API_ENDPOINT)
  throw new Error('Misssing env variables');

const AI_MODEL = 'gemini-2.5-flash';
const RESPONSE_TYPE = 'application/json';
const QUESTION_EXPLANATION_FIELD_CHAR_LIMIT = 230;
const QUESTIONS_PER_BATCH = 2;

const DIFFICULTIES = ['junior', 'middle', 'senior'];
const DOMAINS = {
  language: {
    topics: [
      'Tenses',
      'Articles',
      'Prepositions',
      'Conditionals',
      'Modal Verbs',
      'Passive Voice',
      'Reported Speech',
      'Relative Clauses',
      'Conjunctions',
      'Punctuation',
      'Pronouns',
      'Adjectives and Adverbs',
      'Comparatives and Superlatives',
      'Collocations',
      'Word Order',
      'Determiners',
      'Countable and Uncountable Nouns',
      'Cleft Sentences',
      'Vocabulary in Context',
    ],
    difficulties: DIFFICULTIES,
    difficultyGuide: `
    - junior (A1-A2): basic rules, common patterns, everyday sentences.
    - middle (B1-B2): exceptions, context-dependent rules, common mistakes.
    - senior (C1-C2): nuanced usage, formal/academic register, rare edge cases, native-speaker subtleties.`,
    optionsRule: `The "options" field must be an array of exactly 4 strings. For fill-in-the-blank: word/phrase choices. For error-correction: corrected sentence versions.`,
    role: 'Senior English Language Expert and Linguist',
  },

  programming: {
    topics: [
      'Closures',
      'Promises',
      'Event Loop',
      'Hoisting',
      'Prototypes',
      'Scopes',
      'This Keyword',
      'Async/Await',
      'Generators',
      'Garbage Collection',
      'Classes',
      'Destructuring',
      'Map and Set',
      'WeakMap',
      'Proxy',
      'Reflect',
      'Modules',
      'Strict Mode',
      'Type Coercion',
      'Symbols',
      'Memory Management',
      'Web APIs',
      'DOM API',
      'Design Patterns',
      'Performance',
    ],
    difficulties: DIFFICULTIES,
    difficultyGuide: `
    - junior: syntax basics, common built-ins, simple patterns.
    - middle: edge cases, async behavior, tricky coercion, common bugs.
    - senior: engine internals, performance tradeoffs, spec-level subtleties.`,
    optionsRule: `The "options" field must be an array of exactly 4 strings. For predict_output: the exact console output. For code_completion: the missing code fragment.`,
    role: 'Senior Software Engineer and Technical Interviewer',
  },
};

const genAI = new GoogleGenerativeAI(AI_STUDIO_KEY);

async function generateQuestion(
  domain: DomainType,
  category: Category,
  topic: string,
  difficulty: string,
) {
  try {
    const prompt = getPrompt(domain, category, topic, difficulty);

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: { responseMimeType: RESPONSE_TYPE },
    });

    const result = await model.generateContent(prompt);

    const response = result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const generatedQuestions = JSON.parse(responseText) as Question[];

    return {
      questions: generatedQuestions,
      domain,
    };
  } catch (error: unknown) {
    console.error(`Failed to generate question: ${(error as Error).message}`);
    throw error;
  }
}

function getCombos(category: Category, domain: DomainType) {
  const combos: {
    category: Category;
    difficulty: string;
    domain: DomainType;
    topic: string;
  }[] = [];
  const topics = DOMAINS[domain].topics;
  for (let i = 0; i < 3; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty =
      DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
    combos.push({ category, topic, difficulty, domain });
  }
  return combos;
}

function getPrompt(
  domain: DomainType,
  category: Category,
  topic: string,
  difficulty: string,
) {
  const cfg = DOMAINS[domain];
  if (!cfg)
    throw new Error(
      `Unknown domain: "${domain}". Use "language" or "programming".`,
    );
  const exclusivityRule =
    category === Category.JS
      ? `RULE: You may use "codeSnippet" (if needed). You are FORBIDDEN from using "sentenceExample".`
      : `RULE: You may use "sentenceExample" (if needed). You are FORBIDDEN from using "codeSnippet".`;
  const topicList = cfg.topics.join(', ');

  return `
Act as a ${cfg.role} specializing in ${category}.
Your task is to generate high-quality quiz questions for a Telegram Quiz Bot.

Generate an array of ${QUESTIONS_PER_BATCH} JSON objects based on the topic: ${topic} at difficulty: ${difficulty}.

TOPIC RESTRICTION: The "topicTitle" field MUST be exactly one of:
[${topicList}]
Map the closest match if needed.

Strict Rules:
1. ONLY output a valid JSON array. No markdown, no extra text.
2. Adapt complexity to the difficulty level:${cfg.difficultyGuide}
${exclusivityRule}
3. The "codeSnippet" field must be a valid code string with \\n for newlines and escaped quotes. Use single quotes inside code. Omit the field if purely theoretical.
5. The "sentenceExample" field must be a single string with a natural example sentence. If purely theoretical, omit the field
6. ${cfg.optionsRule}
7. The "correctOptionIndex" must be an integer (0–3).
8. The "explanation" field MUST be strictly under ${QUESTION_EXPLANATION_FIELD_CHAR_LIMIT} characters.
9. Use ONLY double quotes ("") for all JSON keys and string values. Single quotes ('') are strictly forbidden for JSON structure.
10. INTERNAL QUOTES: If a string value (like questionText or explanation) contains a quote, you MUST escape it with a backslash to prevent breaking the JSON format.
11. Ensure no trailing commas after the last property in an object or the last object in the array.
12. CRITICAL: The 'topicTitle' must match the character casing (uppercase/lowercase) of the restricted list EXACTLY. For example, use 'Event loop' instead of 'Event Loop'.

Each object must follow this structure:
{
  "topicTitle": "Chosen from the restricted list",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "questionText": "Question string. For fill-in-the-blank or code_completion, use _____ as the blank.",
  "options": ["A", "B", "C", "D"],
  "correctOptionIndex": 0,
  "explanation": ""
}
`.trim();
}

async function main() {
  const englishCombos = getCombos(Category.ENGLISH, 'language');
  const jsCombos = getCombos(Category.JS, 'programming');

  console.log(
    `🚀 Starting generation for English: ${englishCombos.length} and JS: ${jsCombos.length} batches...`,
  );
  const combos = [...englishCombos, ...jsCombos];
  console.log(combos);
  const aiResults = await Promise.allSettled(
    combos.map((c) =>
      generateQuestion(c.domain, c.category, c.topic, c.difficulty),
    ),
  );
  console.log(aiResults);
  const allQuestions = aiResults
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
  console.log(allQuestions);
  console.log(
    `✅ Generated ${allQuestions.length * Number(QUESTIONS_PER_BATCH)} total questions. Validating...`,
  );

  const validQuestions: Question[] = [];
  for (const q of allQuestions) {
    try {
      q.questions.forEach((ques) => {
        console.log(ques);
        validateQuestion(ques, q.domain);
        validQuestions.push(ques);
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.warn(`❌ Skipping invalid question: ${err.message}`);
      }
      console.log('Unhanled js!', err);
    }
  }

  console.log(
    `📤 Posting ${validQuestions.length} valid questions to ${QUIZ_API_ENDPOINT}...`,
  );
  const questionPostArr: Promise<Question>[] = validQuestions.map((v) =>
    postToEndpoint(v),
  );
  const postResults = await Promise.allSettled(questionPostArr);

  const successful = postResults.filter((r) => r.status === 'fulfilled').length;
  console.log(postResults.filter((r) => r.status === 'rejected'));
  const failed = postResults.filter((r) => r.status === 'rejected').length;

  console.log(`--- Finished ---`);
  console.log(`Successfully Posted: ${successful}`);
  console.log(`Failed to Post: ${failed}`);
}

async function postToEndpoint(question: Question): Promise<Question> {
  const body = JSON.stringify(question);
  console.log('[POST ENDPOINT FNC] request body:', body);

  const res = await fetch(QUIZ_API_ENDPOINT || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const posted = (await res.json()) as Question;
  return posted;
}

function validateQuestion(q: Question, domain: DomainType) {
  const cfg = DOMAINS[domain];
  if (!cfg) throw new Error(`Unknown domain: "${domain}"`);

  const required = [
    'questionText',
    'topicTitle',
    'difficulty',
    'category',
    'options',
    'correctOptionIndex',
    'explanation',
  ];

  for (const key of required) {
    if (!(key in q)) throw new Error(`Missing field: ${key}`);
  }

  if (!cfg.topics.includes(q.topicTitle))
    throw new Error(`Invalid topicTitle: "${q.topicTitle}"`);

  if (!cfg.difficulties.includes(q.difficulty))
    throw new Error(`Invalid difficulty: "${q.difficulty}"`);

  if (!Array.isArray(q.options) || q.options.length !== 4)
    throw new Error('options must be an array of exactly 4 strings');

  if (!q.options.every((o) => typeof o === 'string'))
    throw new Error('All options must be strings');

  if (
    !Number.isInteger(q.correctOptionIndex) ||
    q.correctOptionIndex < 0 ||
    q.correctOptionIndex > 3
  )
    throw new Error(`Invalid correctOptionIndex: ${q.correctOptionIndex}`);

  if (
    typeof q.explanation !== 'string' ||
    q.explanation.length >= QUESTION_EXPLANATION_FIELD_CHAR_LIMIT
  )
    throw new Error(
      `explanation must be a string under ${QUESTION_EXPLANATION_FIELD_CHAR_LIMIT} chars`,
    );
}

main()
  .then(() => {})
  .catch((err: unknown) => console.log(err));
