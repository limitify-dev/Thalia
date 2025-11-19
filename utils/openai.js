// openai.js
import OpenAI from "openai";
import { OPENAI } from "./config";
export const openai = new OpenAI({
  apiKey: OPENAI,
  dangerouslyAllowBrowser: true, // needed for React Native
});
