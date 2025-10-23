import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

export const processMessage = internalAction({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      const message = await ctx.runQuery(api.messages.get, { 
        id: args.messageId 
      });

      if (!message) {
        throw new Error("Message not found");
      }

      let query = message.content;

      if (message.messageType === "audio" && message.mediaUrl) {
        query = await ctx.runAction(api.lib.transcription.transcribeAudio, {
          audioUrl: message.mediaUrl,
        });

        await ctx.runMutation(api.messages.updateContent, {
          messageId: message._id,
          content: query,
        });
      } else if (message.messageType === "image" && message.mediaUrl) {
        const imageAnalysis = await ctx.runAction(api.lib.vision.analyzeImage, {
          imageUrl: message.mediaUrl,
        });

        query = `${message.content || ""} [Image: ${imageAnalysis}]`.trim();
      }

      if (!query) {
        throw new Error("No content to process");
      }

      const queryEmbedding = await ctx.runAction(
        api.lib.openai.generateEmbedding,
        { text: query }
      );

      const relevantDocs = await ctx.runQuery(api.documents.vectorSearch, {
        embedding: queryEmbedding,
        brokerId: message.brokerId,
        limit: 5,
      });

      const recentMessages = await ctx.runQuery(
        api.messages.getRecentForContext,
        {
          conversationId: message.conversationId,
          limit: 10,
        }
      );

      const context = buildAgentContext(recentMessages, relevantDocs, query);

      const response = await ctx.runAction(api.lib.openai.generateAgentResponse, {
        query,
        context,
        conversationHistory: recentMessages,
      });

      const conversation = await ctx.runQuery(api.conversations.get, {
        id: message.conversationId,
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      await ctx.runAction(api.whatsapp.sendMessage, {
        conversationId: message.conversationId,
        brokerId: message.brokerId,
        recipientPhone: conversation.clientPhone,
        messageType: "text",
        content: response,
        isFromAgent: true,
      });

      const processingTime = Date.now() - startTime;

      await ctx.runMutation(api.lib.logging.log, {
        level: "info",
        category: "agent",
        message: `Successfully processed message`,
        metadata: { 
          messageId: args.messageId,
          processingTimeMs: processingTime,
        },
      });
    } catch (error) {
      await ctx.runMutation(api.lib.logging.log, {
        level: "error",
        category: "agent",
        message: `Failed to process message`,
        metadata: {
          messageId: args.messageId,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  },
});

function buildAgentContext(
  messages: any[],
  documents: any[],
  currentQuery: string
): string {
  let context = "";

  context += "=== AGENT SYSTEM CONTEXT ===\n\n";

  if (documents.length > 0) {
    context += "📄 RETRIEVED DOCUMENTS (RAG):\n";
    documents.forEach((doc, idx) => {
      context += `\nDocument ${idx + 1}: ${doc.title}\n`;
      const excerpt = doc.content?.substring(0, 600) ?? "";
      context += `${excerpt}...\n`;
    });
    context += "\n";
  }

  if (messages.length > 0) {
    context += "💬 CONVERSATION HISTORY:\n";
    messages.slice(-6).forEach((msg) => {
      const role = msg.isFromAgent ? "Agent" : "Client";
      context += `${role}: ${msg.content}\n`;
    });
    context += "\n";
  }

  context += `🎯 CURRENT QUERY: ${currentQuery}\n`;

  return context;
}

