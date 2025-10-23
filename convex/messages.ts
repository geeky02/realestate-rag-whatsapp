import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new message
export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    brokerId: v.id("brokers"),
    direction: v.string(),
    messageType: v.string(),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.string()),
    whatsappMessageId: v.optional(v.string()),
    isFromAgent: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      brokerId: args.brokerId,
      direction: args.direction,
      messageType: args.messageType,
      content: args.content,
      mediaUrl: args.mediaUrl,
      storageId: args.storageId,
      whatsappMessageId: args.whatsappMessageId,
      status: "sent",
      isFromAgent: args.isFromAgent,
      metadata: args.metadata,
      sentAt: Date.now(),
    });

    // Update conversation's last message timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

// Get message by ID
export const get = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List messages for a conversation
export const listByConversation = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("asc");

    const messages = await query.collect();
    
    if (args.limit) {
      return messages.slice(-args.limit);
    }
    
    return messages;
  },
});

// Update message status
export const updateStatus = mutation({
  args: {
    id: v.id("messages"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
    
    return args.id;
  },
});

// Get message by WhatsApp ID
export const getByWhatsAppId = query({
  args: { whatsappMessageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_whatsapp_id", (q) => 
        q.eq("whatsappMessageId", args.whatsappMessageId)
      )
      .first();
  },
});

// Get recent messages for context
export const getRecentForContext = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit);

    return messages.reverse();
  },
});

// Add message to queue for processing
export const addToQueue = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const queueId = await ctx.db.insert("messageQueue", {
      conversationId: args.conversationId,
      messageId: args.messageId,
      priority: args.priority ?? 1,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    });

    return queueId;
  },
});

