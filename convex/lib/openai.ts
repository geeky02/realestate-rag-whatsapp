import { action } from "../_generated/server";
import { v } from "convex/values";

// Generate text embedding using OpenAI
export const generateEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: args.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    return result.data[0].embedding as number[];
  },
});

// Generate response using OpenAI Chat Completions
export const generateResponse = action({
  args: {
    query: v.string(),
    context: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `You are a helpful AI assistant for a real estate brokerage. 
You help clients learn about properties, schedule viewings, and answer questions.
Use the provided context to give accurate, helpful responses.
Be professional, friendly, and concise.
If you don't know something, say so - don't make up information.`;

    const userPrompt = `Context:\n${args.context}\n\nClient question: ${args.query}\n\nProvide a helpful response:`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    return result.choices[0].message.content as string;
  },
});

