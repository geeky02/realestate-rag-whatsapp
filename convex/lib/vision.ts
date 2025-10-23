import { action } from "../_generated/server";
import { v } from "convex/values";

export const analyzeImage = action({
  args: {
    imageUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image in the context of real estate. Describe what you see, any text visible (OCR), property features, condition, or relevant details for a real estate agent. Be concise but thorough.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: args.imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI Vision API error: ${error}`);
      }

      const result = await response.json();
      return result.choices[0].message.content as string;
    } catch (error) {
      return `Image received (analysis unavailable: ${error instanceof Error ? error.message : String(error)})`;
    }
  },
});

