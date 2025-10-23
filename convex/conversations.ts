import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get existing conversation
export const getOrCreate = mutation({
  args: {
    brokerId: v.id("brokers"),
    clientPhone: v.string(),
    clientName: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    // Check if conversation exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_client", (q) => q.eq("clientPhone", args.clientPhone))
      .filter((q) => q.eq(q.field("brokerId"), args.brokerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      brokerId: args.brokerId,
      propertyId: args.propertyId,
      clientPhone: args.clientPhone,
      clientName: args.clientName,
      status: "active",
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Get conversation by ID
export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List conversations
export const list = query({
  args: {
    brokerId: v.optional(v.id("brokers")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let conversations;

    if (args.brokerId) {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_broker", (q) => 
          q.eq("brokerId", args.brokerId!)
        )
        .order("desc")
        .collect();
    } else if (args.status) {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_status", (q) => 
          q.eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_last_message")
        .order("desc")
        .collect();
    }
    
    if (args.limit) {
      return conversations.slice(0, args.limit);
    }
    
    return conversations;
  },
});

// Update conversation
export const update = mutation({
  args: {
    id: v.id("conversations"),
    clientName: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, updates);
    
    return id;
  },
});

// Update last message timestamp
export const updateLastMessage = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastMessageAt: Date.now(),
    });
    
    return args.id;
  },
});

// Close conversation
export const close = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "closed",
    });
    
    return args.id;
  },
});

// Get conversation with messages
export const getWithMessages = query({
  args: { 
    id: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    
    if (!conversation) {
      return null;
    }

    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.id)
      )
      .order("desc");

    const messages = await messagesQuery.collect();
    
    const limitedMessages = args.limit 
      ? messages.slice(0, args.limit)
      : messages;

    return {
      conversation,
      messages: limitedMessages.reverse(),
    };
  },
});

