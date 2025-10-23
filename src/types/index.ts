import { Id } from '../../convex/_generated/dataModel'

export interface Broker {
  _id: Id<'brokers'>
  name: string
  email: string
  phone: string
  whatsappNumber?: string
  active: boolean
  createdAt: number
}

export interface Property {
  _id: Id<'properties'>
  brokerId: Id<'brokers'>
  title: string
  description: string
  address: string
  price: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  propertyType: string
  status: string
  images?: string[]
  createdAt: number
  updatedAt: number
}

export interface Document {
  _id: Id<'documents'>
  brokerId: Id<'brokers'>
  propertyId?: Id<'properties'>
  title: string
  storageId: string
  fileType: string
  fileSize: number
  content?: string
  embedding?: number[]
  metadata?: any
  uploadedAt: number
}

export interface Conversation {
  _id: Id<'conversations'>
  brokerId: Id<'brokers'>
  propertyId?: Id<'properties'>
  clientPhone: string
  clientName?: string
  status: string
  lastMessageAt: number
  createdAt: number
  metadata?: any
}

export interface Message {
  _id: Id<'messages'>
  conversationId: Id<'conversations'>
  brokerId: Id<'brokers'>
  direction: 'inbound' | 'outbound'
  messageType: string
  content?: string
  mediaUrl?: string
  storageId?: string
  whatsappMessageId?: string
  status: string
  isFromAgent: boolean
  metadata?: any
  sentAt: number
}

