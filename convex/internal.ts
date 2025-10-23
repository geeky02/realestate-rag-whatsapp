import { internalQuery, query } from "./_generated/server";

// Internal query to get first broker (for webhook routing)
export const getFirstBroker = internalQuery({
  args: {},
  handler: async (ctx) => {
    const brokers = await ctx.db
      .query("brokers")
      .filter((q) => q.eq(q.field("active"), true))
      .take(1);
    
    return brokers;
  },
});

// Public query version for HTTP endpoints
export const getFirstBrokerPublic = query({
  args: {},
  handler: async (ctx) => {
    const brokers = await ctx.db
      .query("brokers")
      .filter((q) => q.eq(q.field("active"), true))
      .take(1);
    
    return brokers;
  },
});

