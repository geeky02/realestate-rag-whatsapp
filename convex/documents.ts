import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Generate URL for file upload
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create document record after upload
export const create = mutation({
  args: {
    brokerId: v.id("brokers"),
    propertyId: v.optional(v.id("properties")),
    title: v.string(),
    storageId: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      brokerId: args.brokerId,
      propertyId: args.propertyId,
      title: args.title,
      storageId: args.storageId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      metadata: args.metadata,
      uploadedAt: Date.now(),
    });

    // Schedule processing for text extraction and embedding
    await ctx.scheduler.runAfter(0, api.documents.processDocument, {
      documentId,
    });

    return documentId;
  },
});

// Process document: extract text and generate embeddings
export const processDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.runQuery(api.documents.get, { 
      id: args.documentId 
    });

    if (!document) {
      throw new Error("Document not found");
    }

    try {
      // Get file URL from storage
      const url = await ctx.storage.getUrl(document.storageId);
      
      if (!url) {
        throw new Error("Could not get document URL");
      }

      // Extract text content (simplified - in production use proper parsers)
      let content = "";
      
      // For PDFs and DOCX, you'd use libraries like pdf-parse or mammoth
      // For now, we'll handle text files directly
      if (document.fileType === "txt" || document.fileType === "text") {
        const response = await fetch(url);
        content = await response.text();
      }

      // Generate embedding using OpenAI
      const embedding = await ctx.runAction(api.lib.openai.generateEmbedding, {
        text: content,
      });

      // Update document with content and embedding
      await ctx.runMutation(api.documents.updateProcessed, {
        documentId: args.documentId,
        content,
        embedding,
      });

      await ctx.runMutation(api.lib.logging.log, {
        level: "info",
        category: "storage",
        message: `Document processed successfully: ${document.title}`,
        metadata: { documentId: args.documentId },
      });
    } catch (error) {
      await ctx.runMutation(api.lib.logging.log, {
        level: "error",
        category: "storage",
        message: `Failed to process document: ${document.title}`,
        metadata: { 
          documentId: args.documentId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  },
});

// Update document with processed content
export const updateProcessed = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      content: args.content,
      embedding: args.embedding,
    });

    return args.documentId;
  },
});

// Get document by ID
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List documents
export const list = query({
  args: {
    brokerId: v.optional(v.id("brokers")),
    propertyId: v.optional(v.id("properties")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let documents;

    if (args.brokerId) {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_broker", (q) => 
          q.eq("brokerId", args.brokerId!)
        )
        .order("desc")
        .collect();
    } else if (args.propertyId) {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_property", (q) => 
          q.eq("propertyId", args.propertyId)
        )
        .order("desc")
        .collect();
    } else {
      documents = await ctx.db.query("documents").order("desc").collect();
    }
    
    if (args.limit) {
      return documents.slice(0, args.limit);
    }
    
    return documents;
  },
});

// Get document download URL
export const getDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete document
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from storage
    await ctx.storage.delete(document.storageId);
    
    // Delete from database
    await ctx.db.delete(args.id);
    
    return args.id;
  },
});

// Vector search for relevant documents
export const vectorSearch = query({
  args: {
    embedding: v.array(v.number()),
    brokerId: v.optional(v.id("brokers")),
    propertyId: v.optional(v.id("properties")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let documents = await ctx.db.query("documents").collect();
    
    // Filter by brokerId if provided
    if (args.brokerId) {
      documents = documents.filter(doc => doc.brokerId === args.brokerId);
    }
    
    // Filter by propertyId if provided
    if (args.propertyId) {
      documents = documents.filter(doc => doc.propertyId === args.propertyId);
    }
    
    // Filter only documents with embeddings
    documents = documents.filter(doc => doc.embedding);
    
    return documents.slice(0, args.limit ?? 5);
  },
});

