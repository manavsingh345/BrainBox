import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_RAG_KEY || "";
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const generateOpenAiResponse = async (message: string) => {
  if (!ai) {
    return "AI provider is not configured.";
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent(message);
    return result.response.text() || "No response generated.";
  } catch (e) {
    console.error(e);
    return "Unable to generate response right now.";
  }
};

export default generateOpenAiResponse;
