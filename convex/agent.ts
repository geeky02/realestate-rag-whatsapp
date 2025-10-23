import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

// Process message with RAG agent
export const processMessage = internalAction({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Get message details
      const message = await ctx.runQuery(api.messages.get, { 
        id: args.messageId 
      });

      if (!message) {
        throw new Error("Message not found");
      }

      let query = message.content;

      // If audio message, transcribe it first
      if (message.messageType === "audio" && message.mediaUrl) {
        query = await ctx.runAction(api.lib.transcription.transcribeAudio, {
          audioUrl: message.mediaUrl,
        });
      }

      if (!query) {
        throw new Error("No content to process");
      }

      // Generate embedding for the query
      const queryEmbedding = await ctx.runAction(
        api.lib.openai.generateEmbedding,
        { text: query }
      );

      // Retrieve relevant documents using vector search
      const relevantDocs = await ctx.runQuery(api.documents.vectorSearch, {
        embedding: queryEmbedding,
        brokerId: message.brokerId,
        limit: 5,
      });

      // Get conversation context
      const recentMessages = await ctx.runQuery(
        api.messages.getRecentForContext,
        {
          conversationId: message.conversationId,
          limit: 10,
        }
      );

      // Build context for the agent
      const context = buildContext(recentMessages, relevantDocs);

      // Generate response using OpenAI
      const response = await ctx.runAction(api.lib.openai.generateResponse, {
        query,
        context,
      });

      // Send response via WhatsApp
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

// Helper function to build context from messages and documents
function buildContext(
  messages: any[],
  documents: any[]
): string {
  let context = "";

  // Add conversation history
  if (messages.length > 0) {
    context += "Recent conversation:\n";
    messages.forEach((msg) => {
      const role = msg.isFromAgent ? "Agent" : "Client";
      context += `${role}: ${msg.content}\n`;
    });
    context += "\n";
  }

  // Add relevant document excerpts
  if (documents.length > 0) {
    context += "Relevant property information:\n";
    documents.forEach((doc, idx) => {
      context += `Document ${idx + 1} (${doc.title}):\n`;
      // Use first 500 characters of content
      const excerpt = doc.content?.substring(0, 500) ?? "";
      context += `${excerpt}...\n\n`;
    });
  }

  return context;
}

