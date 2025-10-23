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

      // Update queue status to processing (simplified for scaffolding)

      let query = message.content;

      // If audio message, transcribe it first
      if (message.messageType === "audio" && message.mediaUrl) {
        query = await ctx.runAction(api.lib.transcription.transcribeAudio, {
          audioUrl: message.mediaUrl,
        });
        // Note: In production, update message with transcription
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

      // Log agent interaction (simplified for scaffolding)
      const processingTime = Date.now() - startTime;
      
      // Note: In production, log interaction and update queue status

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
      // Note: In production, update queue status to failed
      
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

// Calculate confidence score based on document relevance
// function calculateConfidence(documents: any[]): number {
//   if (documents.length === 0) return 0.3;
//   if (documents.length >= 3) return 0.9;
//   return 0.6;
// }

// Internal mutations for agent processing

export const updateQueueStatus = internalAction({
  args: {
    messageId: v.id("messages"),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (_ctx, _args) => {
    // Simplified for scaffolding - would update queue item in production
  },
});

export const updateMessageContent = internalAction({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (_ctx, _args) => {
    // Simplified for scaffolding - would update message in production
  },
});

export const logInteraction = internalAction({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    query: v.string(),
    retrievedDocuments: v.array(v.id("documents")),
    response: v.string(),
    confidence: v.number(),
    processingTimeMs: v.number(),
  },
  handler: async (_ctx, _args) => {
    // Simplified for scaffolding - would log interaction in production
  },
});

