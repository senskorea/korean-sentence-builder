/// <reference types="vite/client" />
import { GoogleGenAI, Type } from '@google/genai';
import { Word } from '../types';

let ai: GoogleGenAI | null = null;

function getAIClient() {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing VITE_GEMINI_API_KEY environment variable");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
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
Do not provide conjugations, we will handle them dynamically.`;

  const client = getAIClient();
  const response = await client.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                korean: { type: Type.STRING },
                english: { type: Type.STRING },
                emoji: { type: Type.STRING },
                type: { type: Type.STRING },
                hasBatchim: { type: Type.BOOLEAN }
              },
              required: ["id", "korean", "english", "emoji", "type", "hasBatchim"]
            }
          },
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                korean: { type: Type.STRING },
                english: { type: Type.STRING },
                emoji: { type: Type.STRING },
                type: { type: Type.STRING },
                hasBatchim: { type: Type.BOOLEAN }
              },
              required: ["id", "korean", "english", "emoji", "type", "hasBatchim"]
            }
          },
          verbs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                korean: { type: Type.STRING },
                english: { type: Type.STRING },
                emoji: { type: Type.STRING },
                type: { type: Type.STRING },
                hasBatchim: { type: Type.BOOLEAN },
                stem: { type: Type.STRING }
              },
              required: ["id", "korean", "english", "emoji", "type", "hasBatchim", "stem"]
            }
          }
        },
        required: ["subjects", "objects", "verbs"]
      }
    }
  });

  if (!response.text) {
    throw new Error('No response text received from Gemini');
  }

  return JSON.parse(response.text);
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
Always return JSON matching the schema.`;

  const client = getAIClient();
  const response = await client.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          correctedSentence: { type: Type.STRING },
          explanation: { type: Type.STRING },
          grammarPoint: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        },
        required: ["isCorrect", "explanation", "grammarPoint"]
      }
    }
  });

  if (!response.text) {
    throw new Error('No response text received from Gemini for analysis');
  }

  return JSON.parse(response.text);
}
