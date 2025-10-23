import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const log = mutation({
  args: {
    level: v.string(),
    category: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("systemLogs", {
      level: args.level,
      category: args.category,
      message: args.message,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    console.log(`[${args.level.toUpperCase()}] [${args.category}] ${args.message}`);

    return logId;
  },
});

export const getRecent = query({
  args: {
    level: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    if (args.level) {
      logs = await ctx.db
        .query("systemLogs")
        .withIndex("by_level", (q) => q.eq("level", args.level!))
        .order("desc")
        .take(args.limit ?? 50);
    } else if (args.category) {
      logs = await ctx.db
        .query("systemLogs")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      logs = await ctx.db
        .query("systemLogs")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit ?? 50);
    }

    return logs;
  },
});

export const clearOld = mutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldLogs = await ctx.db
      .query("systemLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
      .collect();

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    return oldLogs.length;
  },
});

