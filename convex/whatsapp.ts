import { v } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Send WhatsApp message via Evolution API
export const sendMessage = action({
  args: {
    conversationId: v.id("conversations"),
    brokerId: v.id("brokers"),
    recipientPhone: v.string(),
    messageType: v.string(),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    isFromAgent: v.boolean(),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      const evolutionUrl = process.env.VITE_EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY;
      const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

      if (!evolutionUrl || !apiKey || !instanceName) {
        throw new Error("Evolution API credentials not configured");
      }

      // Prepare message payload for Evolution API
      let payload: any = {
        number: args.recipientPhone.replace(/\D/g, ''), // Remove non-numeric chars
      };

      // Set message content (simple format)
      if (args.messageType === "text" && args.content) {
        payload.text = args.content;
      } else if (args.messageType === "image" && args.mediaUrl) {
        payload.mediaMessage = {
          mediatype: "image",
          media: args.mediaUrl,
        };
      } else if (args.messageType === "audio" && args.mediaUrl) {
        payload.mediaMessage = {
          mediatype: "audio",
          media: args.mediaUrl,
        };
      }

      // Send to Evolution API
      const apiUrl = `${evolutionUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apiKey": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Evolution API error: ${response.statusText}`);
      }

      const result = await response.json();

      // Create message record
      const messageId = await ctx.runMutation(api.messages.create, {
        conversationId: args.conversationId,
        brokerId: args.brokerId,
        direction: "outbound",
        messageType: args.messageType,
        content: args.content,
        mediaUrl: args.mediaUrl,
        whatsappMessageId: result.key?.id,
        isFromAgent: args.isFromAgent,
        metadata: { evolutionResponse: result },
      });

      await ctx.runMutation(api.lib.logging.log, {
        level: "info",
        category: "whatsapp",
        message: `Message sent successfully to ${args.recipientPhone}`,
        metadata: { messageId, conversationId: args.conversationId },
      });

      return messageId;
    } catch (error) {
      await ctx.runMutation(api.lib.logging.log, {
        level: "error",
        category: "whatsapp",
        message: `Failed to send WhatsApp message`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          conversationId: args.conversationId,
        },
      });
      throw error;
    }
  },
});

// Process incoming WhatsApp message
export const processIncomingMessage = internalMutation({
  args: {
    fromPhone: v.string(),
    messageType: v.string(),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    whatsappMessageId: v.string(),
    brokerId: v.id("brokers"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get or create conversation
    const conversationId = await ctx.db.insert("conversations", {
      brokerId: args.brokerId,
      clientPhone: args.fromPhone,
      status: "active",
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_client", (q) => q.eq("clientPhone", args.fromPhone))
      .filter((q) => q.eq(q.field("brokerId"), args.brokerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const finalConversationId = existing?._id ?? conversationId;

    // Create message record
    const messageId = await ctx.db.insert("messages", {
      conversationId: finalConversationId,
      brokerId: args.brokerId,
      direction: "inbound",
      messageType: args.messageType,
      content: args.content,
      mediaUrl: args.mediaUrl,
      whatsappMessageId: args.whatsappMessageId,
      status: "delivered",
      isFromAgent: false,
      metadata: args.metadata,
      sentAt: Date.now(),
    });

    // Add to processing queue
    await ctx.db.insert("messageQueue", {
      conversationId: finalConversationId,
      messageId,
      priority: 1,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    });

    // Schedule agent processing
    await ctx.scheduler.runAfter(0, internal.agent.processMessage, {
      messageId,
    });

    return messageId;
  },
});

// Handle message status update from Evolution API (public for HTTP endpoint)
export const updateMessageStatus = mutation({
  args: {
    whatsappMessageId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("messages")
      .withIndex("by_whatsapp_id", (q) => 
        q.eq("whatsappMessageId", args.whatsappMessageId)
      )
      .first();

    if (message) {
      await ctx.db.patch(message._id, {
        status: args.status,
      });
    }

    return message?._id;
  },
});

