import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new property
export const create = mutation({
  args: {
    brokerId: v.id("brokers"),
    title: v.string(),
    description: v.string(),
    address: v.string(),
    price: v.number(),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFeet: v.optional(v.number()),
    propertyType: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const propertyId = await ctx.db.insert("properties", {
      brokerId: args.brokerId,
      title: args.title,
      description: args.description,
      address: args.address,
      price: args.price,
      bedrooms: args.bedrooms,
      bathrooms: args.bathrooms,
      squareFeet: args.squareFeet,
      propertyType: args.propertyType,
      status: "available",
      images: args.images,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return propertyId;
  },
});

// Get property by ID
export const get = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List properties
export const list = query({
  args: {
    brokerId: v.optional(v.id("brokers")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let properties;

    if (args.brokerId) {
      properties = await ctx.db
        .query("properties")
        .withIndex("by_broker", (q) => 
          q.eq("brokerId", args.brokerId!)
        )
        .order("desc")
        .collect();
    } else if (args.status) {
      properties = await ctx.db
        .query("properties")
        .withIndex("by_status", (q) => 
          q.eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      properties = await ctx.db.query("properties").order("desc").collect();
    }
    
    if (args.limit) {
      return properties.slice(0, args.limit);
    }
    
    return properties;
  },
});

// Search properties by title
export const search = query({
  args: {
    searchTerm: v.string(),
    brokerId: v.optional(v.id("brokers")),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("properties")
      .withSearchIndex("search_properties", (q) => {
        let search = q.search("title", args.searchTerm);
        if (args.brokerId) {
          search = search.eq("brokerId", args.brokerId);
        }
        return search;
      })
      .collect();

    return results;
  },
});

// Update property
export const update = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    price: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFeet: v.optional(v.number()),
    propertyType: v.optional(v.string()),
    status: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// Delete property
export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update property status
export const updateStatus = mutation({
  args: {
    id: v.id("properties"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

