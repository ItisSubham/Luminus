import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error(
    "Google API key is not configured. Please set NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables."
  );
}

const ai = new GoogleGenerativeAI(apiKey);

export default ai;
