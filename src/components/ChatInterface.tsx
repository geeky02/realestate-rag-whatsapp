import { useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Loader2, Bot, User, CheckCheck, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Id } from '../../convex/_generated/dataModel'

interface ChatInterfaceProps {
  conversationId: Id<'conversations'>
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const conversationData = useQuery(api.conversations.getWithMessages, {
    id: conversationId,
    limit: 50,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationData?.messages])

  if (conversationData === undefined) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </Card>
    )
  }

  if (!conversationData) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Conversation not found</p>
      </Card>
    )
  }

  const { conversation, messages } = conversationData

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {conversation.clientName || 'Unknown Client'}
            </CardTitle>
            <p className="text-sm text-gray-500">{conversation.clientPhone}</p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              conversation.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOutbound = message.direction === 'outbound'
              const isFromAgent = message.isFromAgent

              return (
                <div
                  key={message._id}
                  className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} message-bubble`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOutbound
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {isFromAgent && isOutbound && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3" />
                        <span className="text-xs opacity-80">AI Agent</span>
                      </div>
                    )}
                    
                    {!isOutbound && (
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs opacity-70">Client</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap break-words">
                      {message.messageType === 'audio' && message.mediaUrl ? (
                        <div className="space-y-2">
                          <audio 
                            controls 
                            className="w-full max-w-xs"
                            preload="metadata"
                          >
                            <source src={message.mediaUrl} type="audio/ogg" />
                            <source src={message.mediaUrl} type="audio/mpeg" />
                            Your browser does not support audio playback.
                          </audio>
                          {message.content && (
                            <div className="text-sm opacity-90">
                              📝 {message.content}
                            </div>
                          )}
                        </div>
                      ) : message.messageType === 'image' && message.mediaUrl ? (
                        <div className="space-y-2">
                          <img 
                            src={message.mediaUrl} 
                            alt="Shared image"
                            className="max-w-sm rounded-lg"
                          />
                          {message.content && (
                            <div className="text-sm">
                              {message.content}
                            </div>
                          )}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        isOutbound ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      <span>
                        {formatDistanceToNow(message.sentAt, { addSuffix: true })}
                      </span>
                      {isOutbound && (
                        <span className="ml-1">
                          {message.status === 'read' ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 opacity-60" />
                          ) : (
                            <Check className="w-3 h-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <p className="font-medium">📱 WhatsApp Integration Active</p>
          <p className="text-xs mt-1">
            Messages are handled automatically via Evolution API. The AI agent responds
            to client inquiries using RAG search across your property documents.
          </p>
        </div>
      </div>
    </Card>
  )
}

