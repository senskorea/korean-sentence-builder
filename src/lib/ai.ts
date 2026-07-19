/// <reference types="vite/client" />
import OpenAI from 'openai';
import { Word } from '../types';

let openaiClient: OpenAI | null = null;

function getAIClient() {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_NVIDIA_NIM_API_KEY;
    if (!apiKey) {
      throw new Error("Missing VITE_NVIDIA_NIM_API_KEY environment variable. Please add it to your .env file.");
    }
    openaiClient = new OpenAI({
      apiKey,
      baseURL: '/api/nim',
      dangerouslyAllowBrowser: true
    });
  }
  return openaiClient;
}

export interface GeneratedVocab {
  subjects: Word[];
  objects: Word[];
  verbs: Word[];
}

export async function generateVocabForTopic(topic: string): Promise<GeneratedVocab> {
  const prompt = `Generate a Korean vocabulary list for the topic: "${topic}".
Include exactly 6 subjects, 6 objects, and 6 verbs relevant to this topic.
Ensure the "type" matches ("subject", "object", "verb") and "id" is unique (e.g. "sub_name", "obj_name", "verb_name").
Set "hasBatchim" accurately (true if the final syllable ends in a consonant, false otherwise).
For verbs, "stem" must be the dictionary form minus "다" (e.g., "가다" -> "가").
Provide emojis for each.
Do not provide conjugations.

You must reply with a raw JSON object only containing the keys: "subjects", "objects", and "verbs".`;

  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response text received from NIM');
  }

  return JSON.parse(content) as GeneratedVocab;
}

export interface SentenceAnalysis {
  isCorrect: boolean;
  correctedSentence?: string;
  explanation: string;
  grammarPoint: {
    title: string;
    description: string;
  };
}

export async function analyzeSentence(korean: string, english: string): Promise<SentenceAnalysis> {
  const prompt = `Analyze the following Korean sentence that a learner built:
Korean: "${korean}"
Intended English Meaning: "${english}"

Determine if it is grammatically correct and natural. If not, provide a corrected sentence.
Provide a brief, encouraging explanation (1-2 sentences).
Also provide a key grammar point related to this sentence.

You must reply with a raw JSON object containing exactly the following keys:
- "isCorrect": boolean
- "correctedSentence": string (optional, omit if correct)
- "explanation": string
- "grammarPoint": object with "title" (string) and "description" (string)`;

  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response text received from NIM for analysis');
  }

  return JSON.parse(content) as SentenceAnalysis;
}
