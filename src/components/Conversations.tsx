import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import ChatInterface from './ChatInterface'
import { MessageSquare, Loader2, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Id } from '../../convex/_generated/dataModel'

export default function Conversations() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<'conversations'> | null>(null)
  
  const conversations = useQuery(api.conversations.list, { limit: 20 })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversation List */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Active Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          {conversations === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversationId(conv._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedConversationId === conv._id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.clientName || conv.clientPhone}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.clientPhone}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        conv.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        {selectedConversationId ? (
          <ChatInterface conversationId={selectedConversationId} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to view messages</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

