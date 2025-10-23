import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import DocumentUpload from './components/DocumentUpload'
import Conversations from './components/Conversations'
import { FileText, MessageSquare } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('conversations')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            WhatsApp AI Agent - Real Estate
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Intelligent property assistance powered by AI
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            <Conversations />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

