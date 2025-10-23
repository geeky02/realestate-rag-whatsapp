import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const storeMedia = action({
  args: {
    mediaUrl: v.string(),
    messageId: v.id("messages"),
    mediaType: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    try {
      const response = await fetch(args.mediaUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download media: ${response.statusText}`);
      }

      const blob: Blob = await response.blob();
      
      const uploadUrl: string = await ctx.runMutation(api.documents.generateUploadUrl);
      
      const uploadResponse: Response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to Convex Storage");
      }

      const result = await uploadResponse.json();
      const storageId: string = result.storageId;
      
      const fileUrl: string | null = await ctx.storage.getUrl(storageId);
      
      if (fileUrl) {
        await ctx.runMutation(api.messages.updateMediaUrl, {
          messageId: args.messageId,
          mediaUrl: fileUrl,
        });
        return fileUrl;
      }

      return args.mediaUrl;
    } catch (error) {
      await ctx.runMutation(api.lib.logging.log, {
        level: "error",
        category: "storage",
        message: "Failed to store media in Convex Storage",
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          messageId: args.messageId,
        },
      });
      
      return args.mediaUrl;
    }
  },
});

