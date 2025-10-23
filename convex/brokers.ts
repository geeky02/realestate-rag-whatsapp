import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new broker
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      whatsappNumber: args.whatsappNumber,
      active: true,
      createdAt: Date.now(),
    });

    return brokerId;
  },
});

// Get broker by ID
export const get = query({
  args: { id: v.id("brokers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List all brokers
export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("brokers");
    
    const brokers = await query.collect();
    
    if (args.activeOnly) {
      return brokers.filter(b => b.active);
    }
    
    return brokers;
  },
});

// Get broker by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brokers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get broker by WhatsApp number
export const getByWhatsApp = query({
  args: { whatsappNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brokers")
      .withIndex("by_whatsapp", (q) => q.eq("whatsappNumber", args.whatsappNumber))
      .first();
  },
});

// Update broker
export const update = mutation({
  args: {
    id: v.id("brokers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, updates);
    
    return id;
  },
});

// Deactivate broker
export const deactivate = mutation({
  args: { id: v.id("brokers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: false });
    return args.id;
  },
});

