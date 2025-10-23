import { action } from "../_generated/server";
import { v } from "convex/values";

export const transcribeAudio = action({
  args: {
    audioUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    try {
      // Download audio file
      const audioResponse = await fetch(args.audioUrl);
      if (!audioResponse.ok) {
        throw new Error("Failed to download audio file");
      }

      const audioBlob = await audioResponse.blob();
      
      // Create form data for Whisper API
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.ogg");
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      // Call Whisper API
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Whisper API error: ${error}`);
      }

      const result = await response.json();
      return result.text as string;
    } catch (error) {
      throw new Error(
        `Transcription failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});

