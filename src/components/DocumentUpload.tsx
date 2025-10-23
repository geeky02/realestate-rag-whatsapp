import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { Input } from './ui/Input'
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'

export default function DocumentUpload() {
  const [selectedBrokerId, setSelectedBrokerId] = useState<Id<'brokers'> | ''>('')
  const [selectedPropertyId, setSelectedPropertyId] = useState<Id<'properties'> | ''>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const brokers = useQuery(api.brokers.list, { activeOnly: true })
  const properties = useQuery(
    api.properties.list,
    selectedBrokerId ? { brokerId: selectedBrokerId as Id<'brokers'> } : 'skip'
  )
  const documents = useQuery(
    api.documents.list,
    selectedBrokerId ? { brokerId: selectedBrokerId as Id<'brokers'>, limit: 10 } : 'skip'
  )

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const createDocument = useMutation(api.documents.create)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedBrokerId) {
      return
    }

    setUploading(true)
    setUploadStatus('idle')

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      })

      const { storageId } = await result.json()

      // Create document record
      const fileType = selectedFile.name.split('.').pop() || 'unknown'
      
      await createDocument({
        brokerId: selectedBrokerId as Id<'brokers'>,
        propertyId: selectedPropertyId ? (selectedPropertyId as Id<'properties'>) : undefined,
        title: selectedFile.name,
        storageId,
        fileType,
        fileSize: selectedFile.size,
      })

      setUploadStatus('success')
      setSelectedFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Broker"
            value={selectedBrokerId}
            onChange={(e) => setSelectedBrokerId(e.target.value as Id<'brokers'> | '')}
            options={
              brokers?.map((b) => ({
                value: b._id,
                label: b.name,
              })) || []
            }
          />

          {selectedBrokerId && (
            <Select
              label="Property (Optional)"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value as Id<'properties'> | '')}
              options={
                properties?.map((p) => ({
                  value: p._id,
                  label: p.title,
                })) || []
              }
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document File
            </label>
            <div className="mt-1 flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                disabled={!selectedBrokerId}
              />
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedBrokerId || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Document uploaded successfully!
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              Upload failed. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBrokerId ? (
            <p className="text-gray-500 text-sm">Select a broker to view documents</p>
          ) : documents === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()} •{' '}
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  {doc.embedding && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Processed
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

