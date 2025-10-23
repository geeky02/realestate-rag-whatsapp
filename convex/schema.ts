import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Brokers/Agents managing the conversations
  brokers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    whatsappNumber: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_whatsapp", ["whatsappNumber"]),

  // Properties being marketed
  properties: defineTable({
    brokerId: v.id("brokers"),
    title: v.string(),
    description: v.string(),
    address: v.string(),
    price: v.number(),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFeet: v.optional(v.number()),
    propertyType: v.string(), // "house", "apartment", "condo", "land"
    status: v.string(), // "available", "pending", "sold"
    images: v.optional(v.array(v.string())), // Storage IDs
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_broker", ["brokerId"])
    .index("by_status", ["status"])
    .searchIndex("search_properties", {
      searchField: "title",
      filterFields: ["brokerId", "status"]
    }),

  // Documents uploaded for properties (vectorized for RAG)
  documents: defineTable({
    brokerId: v.id("brokers"),
    propertyId: v.optional(v.id("properties")),
    title: v.string(),
    storageId: v.string(), // Convex Storage ID
    fileType: v.string(), // "pdf", "docx", "txt"
    fileSize: v.number(),
    content: v.optional(v.string()), // Extracted text content
    embedding: v.optional(v.array(v.number())), // Vector embedding
    metadata: v.optional(v.any()),
    uploadedAt: v.number(),
  }).index("by_broker", ["brokerId"])
    .index("by_property", ["propertyId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI ada-002 embeddings
      filterFields: ["brokerId", "propertyId"]
    }),

  // WhatsApp conversations
  conversations: defineTable({
    brokerId: v.id("brokers"),
    propertyId: v.optional(v.id("properties")),
    clientPhone: v.string(),
    clientName: v.optional(v.string()),
    status: v.string(), // "active", "closed", "pending"
    lastMessageAt: v.number(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_broker", ["brokerId"])
    .index("by_client", ["clientPhone"])
    .index("by_status", ["status"])
    .index("by_last_message", ["lastMessageAt"]),

  // Individual messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    brokerId: v.id("brokers"),
    direction: v.string(), // "inbound", "outbound"
    messageType: v.string(), // "text", "audio", "image", "document"
    content: v.optional(v.string()), // Text content or transcription
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.string()), // For media files
    whatsappMessageId: v.optional(v.string()),
    status: v.string(), // "sent", "delivered", "read", "failed"
    isFromAgent: v.boolean(), // AI agent or human
    metadata: v.optional(v.any()),
    sentAt: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_broker", ["brokerId"])
    .index("by_whatsapp_id", ["whatsappMessageId"])
    .index("by_sent_at", ["sentAt"]),

  // Message queue for processing
  messageQueue: defineTable({
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    priority: v.number(), // Higher = more urgent
    status: v.string(), // "pending", "processing", "completed", "failed"
    retryCount: v.number(),
    errorMessage: v.optional(v.string()),
    processingStartedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_message", ["messageId"]),

  // Agent interactions and context
  agentInteractions: defineTable({
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    query: v.string(),
    retrievedDocuments: v.array(v.id("documents")),
    response: v.string(),
    confidence: v.number(),
    processingTimeMs: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_message", ["messageId"]),

  // System logs and audit trail
  systemLogs: defineTable({
    level: v.string(), // "info", "warning", "error"
    category: v.string(), // "whatsapp", "agent", "storage", "transcription"
    message: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_level", ["level"])
    .index("by_category", ["category"])
    .index("by_timestamp", ["timestamp"]),
});

