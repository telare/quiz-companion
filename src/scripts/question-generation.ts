import { GoogleGenerativeAI } from "@google/generative-ai";

interface Question {
  topicTitle: string;
  difficulty: string;
  questionType: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sentenceExample?: string | null;
  codeSnippet?: string | null;
}

// Extract the domain keys ("language" | "programming")
type DomainType = keyof typeof DOMAINS;

const DOMAINS = {
  language: {
    topics: [
      "Tenses",
      "Articles",
      "Prepositions",
      "Conditionals",
      "Modal Verbs",
      "Passive Voice",
      "Reported Speech",
      "Relative Clauses",
      "Conjunctions",
      "Punctuation",
      "Subject-Verb Agreement",
      "Pronouns",
      "Adjectives and Adverbs",
      "Comparatives and Superlatives",
      "Gerunds and Infinitives",
      "Phrasal Verbs",
      "Collocations",
      "Word Order",
      "Determiners",
      "Countable and Uncountable Nouns",
      "Direct and Indirect Speech",
      "Inversion",
      "Ellipsis",
      "Cleft Sentences",
      "Emphasis",
      "Vocabulary in Context",
    ],
    difficulties: ["junior", "middle", "senior"],
    questionTypes: [
      "fill_in_the_blank",
      "error_correction",
      "multiple_choice",
      "sentence_transformation",
    ],
    difficultyGuide: `
   - junior (A1-A2): basic rules, common patterns, everyday sentences.
   - middle (B1-B2): exceptions, context-dependent rules, common mistakes.
   - senior (C1-C2): nuanced usage, formal/academic register, rare edge cases, native-speaker subtleties.`,
    codeSnippetRule: `3. The "sentenceExample" field must be a single string with a natural example sentence. If purely theoretical, set to null.`,
    codeSnippetField: `"sentenceExample": "A natural example sentence, or null"`,
    optionsRule: `4. The "options" field must be an array of exactly 4 strings. For fill-in-the-blank: word/phrase choices. For error-correction: corrected sentence versions.`,
    role: "Senior English Language Expert and Linguist",
  },

  programming: {
    topics: [
      "Closures",
      "Promises",
      "Event Loop",
      "Hoisting",
      "Prototypes",
      "Scopes",
      "This Keyword",
      "Async/Await",
      "Generators",
      "Garbage Collection",
      "Classes",
      "Currying",
      "Destructuring",
      "Map and Set",
      "WeakMap",
      "Proxy",
      "Reflect",
      "Modules",
      "Strict Mode",
      "Type Coercion",
      "Symbols",
      "Memory Management",
      "Web APIs",
      "DOM API",
      "Design Patterns",
      "Performance",
    ],
    difficulties: ["junior", "middle", "senior"],
    questionTypes: [
      "predict_output",
      "error_correction",
      "multiple_choice",
      "code_completion",
    ],
    difficultyGuide: `
   - junior: syntax basics, common built-ins, simple patterns.
   - middle: edge cases, async behavior, tricky coercion, common bugs.
   - senior: engine internals, performance tradeoffs, spec-level subtleties.`,
    codeSnippetRule: `3. The "codeSnippet" field must be a valid code string with \\n for newlines and escaped quotes. Use single quotes inside code. Set to null if purely theoretical.`,
    codeSnippetField: `"codeSnippet": "code string with \\n newlines, or null"`,
    optionsRule: `4. The "options" field must be an array of exactly 4 strings. For predict_output: the exact console output. For code_completion: the missing code fragment.`,
    role: "Senior Software Engineer and Technical Interviewer",
  },
};
const DIFFICULTIES = ["junior", "middle", "senior"];

const genAI = new GoogleGenerativeAI(process.env.AI_STUDIO || "");
const AI_MODEL = "gemini-1.5-flash";
const RESPONSE_TYPE = "application/json";

function getPromptTemplate(
  domain: DomainType,
  technology: string,
  topic: string,
  difficulty: string,
) {
  const cfg = DOMAINS[domain];
  if (!cfg)
    throw new Error(
      `Unknown domain: "${domain}". Use "language" or "programming".`,
    );

  const topicList = cfg.topics.join(", ");
  const typeList = cfg.questionTypes.map((t) => `"${t}"`).join(" | ");
  const exampleField = cfg.codeSnippetField;

  return `
Act as a ${cfg.role} specializing in ${technology}.
Your task is to generate high-quality quiz questions for a Telegram Quiz Bot.

Generate an array of 10 JSON objects based on the topic: ${topic} at difficulty: ${difficulty}.

TOPIC RESTRICTION: The "topicTitle" field MUST be exactly one of:
[${topicList}]
Map the closest match if needed.

Strict Rules:
1. ONLY output a valid JSON array. No markdown, no extra text.
2. Adapt complexity to the difficulty level:${cfg.difficultyGuide}
${cfg.codeSnippetRule}
${cfg.optionsRule}
5. The "correctOptionIndex" must be an integer (0–3).
6. The "explanation" field MUST be strictly under 200 characters.
7. The "questionType" field MUST be one of: ${typeList}.
8. Use only double quotes "" for all JSON keys and string values.

Each object in the array must follow this structure:
{
  "topicTitle": "Chosen from the restricted list",
  "difficulty": "${difficulty}",
  "questionType": "one of the valid types",
  "questionText": "Question string. For fill-in-the-blank or code_completion, use _____ as the blank.",
  ${exampleField},
  "options": ["A", "B", "C", "D"],
  "correctOptionIndex": 0,
  "explanation": "Brief rule or gotcha explanation < 200 chars"
}
`.trim();
}

async function generateQuestion(
  domain: DomainType,
  technology: string,
  topic: string,
  difficulty: string,
) {
  try {
    const prompt = getPromptTemplate(domain, technology, topic, difficulty);

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: { responseMimeType: RESPONSE_TYPE },
    });

    const result = await model.generateContent(prompt);

    const response = result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini");
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

async function postToEndpoint(question: Question): Promise<Question> {
  const res = await fetch(process.env.QUIZ_API_ENDPOINT || "", {
    method: "POST",
    body: JSON.stringify(question),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const posted = (await res.json()) as Question;
  return posted;
}

function validateQuestion(q: Question, domain: DomainType) {
  const cfg = DOMAINS[domain];
  if (!cfg) throw new Error(`Unknown domain: "${domain}"`);

  const required = [
    "topicTitle",
    "difficulty",
    "questionType",
    "questionText",
    "options",
    "correctOptionIndex",
    "explanation",
  ];

  for (const key of required) {
    if (!(key in q)) throw new Error(`Missing field: ${key}`);
  }

  if (!cfg.topics.includes(q.topicTitle))
    throw new Error(`Invalid topicTitle: "${q.topicTitle}"`);

  if (!cfg.difficulties.includes(q.difficulty))
    throw new Error(`Invalid difficulty: "${q.difficulty}"`);

  if (!cfg.questionTypes.includes(q.questionType))
    throw new Error(`Invalid questionType: "${q.questionType}"`);

  if (!Array.isArray(q.options) || q.options.length !== 4)
    throw new Error("options must be an array of exactly 4 strings");

  if (!q.options.every((o) => typeof o === "string"))
    throw new Error("All options must be strings");

  if (
    !Number.isInteger(q.correctOptionIndex) ||
    q.correctOptionIndex < 0 ||
    q.correctOptionIndex > 3
  )
    throw new Error(`Invalid correctOptionIndex: ${q.correctOptionIndex}`);

  if (typeof q.explanation !== "string" || q.explanation.length >= 200)
    throw new Error("explanation must be a string under 200 chars");
}

function getCombos(technology: "Javascript" | "English", domain: DomainType) {
  const combos: {
    technology: "Javascript" | "English";
    topic: string;
    difficulty: string;
    domain: DomainType;
  }[] = [];
  const topics = DOMAINS[domain].topics;
  for (let i = 0; i < 3; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty =
      DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
    combos.push({ technology, topic, difficulty, domain });
  }
  return combos;
}

async function main() {
  const englishCombos = getCombos("English", "language");
  const jsCombos = getCombos("Javascript", "programming");

  console.log(
    `🚀 Starting generation for English: ${englishCombos.length} and JS: ${jsCombos.length} batches...`,
  );
  const combos = [...englishCombos, ...jsCombos];

  const aiResults = await Promise.allSettled(
    combos.map((c) =>
      generateQuestion(c.domain, c.technology, c.topic, c.difficulty),
    ),
  );
  const allQuestions = aiResults
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);
  console.log(
    `✅ Generated ${allQuestions.length} total questions. Validating...`,
  );

  const validQuestions: Question[] = [];
  for (const q of allQuestions) {
    try {
      q.questions.forEach((ques) => {
        validateQuestion(ques, q.domain);
        validQuestions.push(ques);
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.warn(`❌ Validation failed for a question: ${err.message}`);
        return;
      }
      console.log("Unhanled js!", err);
    }
  }

  console.log(`📤 Posting ${validQuestions.length} valid questions to DB...`);

  const postResults = await Promise.allSettled(
    validQuestions.map((v) => postToEndpoint(v)),
  );

  const successful = postResults.filter((r) => r.status === "fulfilled").length;
  const failed = postResults.filter((r) => r.status === "rejected").length;

  console.log(`--- Finished ---`);
  console.log(`Successfully Posted: ${successful}`);
  console.log(`Failed to Post: ${failed}`);
}

main()
  .then(() => {})
  .catch((err: unknown) => console.log(err));
