"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  Zap, 
  Play, 
  History, 
  Copy, 
  Download,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { testWebhook } from "../lib/studio-utils"
import type { WebhookTest } from "../types/studio"

interface WebhookTesterProps {
  presetWebhooks?: { name: string; url: string; payload?: any }[]
}

interface WebhookHistory {
  id: string
  timestamp: Date
  test: WebhookTest
}

export function WebhookTester({ presetWebhooks = [] }: WebhookTesterProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [method, setMethod] = useState("POST")
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}')
  const [payload, setPayload] = useState('{\n  "test": "data",\n  "timestamp": "{{timestamp}}",\n  "source": "studio-dashboard"\n}')
  const [response, setResponse] = useState<WebhookTest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<WebhookHistory[]>([])
  const [savedWebhooks, setSavedWebhooks] = useState(presetWebhooks)

  const processPayload = (payload: string): any => {
    try {
      // Replace template variables
      const processed = payload
        .replace(/\{\{timestamp\}\}/g, new Date().toISOString())
        .replace(/\{\{random\}\}/g, Math.random().toString(36).substring(7))
        .replace(/\{\{uuid\}\}/g, crypto.randomUUID())
      
      return JSON.parse(processed)
    } catch (error) {
      throw new Error("Invalid JSON payload")
    }
  }

  const runWebhookTest = async () => {
    if (!webhookUrl) return
    
    setIsLoading(true)
    try {
      const processedPayload = method !== "GET" ? processPayload(payload) : undefined
      const result = await testWebhook(webhookUrl, method, processedPayload)
      
      setResponse(result)
      
      // Add to history
      const historyEntry: WebhookHistory = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        test: result
      }
      setHistory(prev => [historyEntry, ...prev].slice(0, 10)) // Keep last 10
      
    } catch (error) {
      setResponse({
        url: webhookUrl,
        method: method as any,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveWebhook = () => {
    if (!webhookUrl) return
    
    const name = prompt("Enter a name for this webhook:")
    if (!name) return
    
    const newWebhook = {
      name,
      url: webhookUrl,
      payload: method !== "GET" ? JSON.parse(payload) : undefined
    }
    
    setSavedWebhooks(prev => [...prev, newWebhook])
  }

  const loadWebhook = (webhook: { name: string; url: string; payload?: any }) => {
    setWebhookUrl(webhook.url)
    if (webhook.payload) {
      setPayload(JSON.stringify(webhook.payload, null, 2))
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    }
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `webhook-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (test: WebhookTest) => {
    if (test.error) return <XCircle className="h-4 w-4 text-red-500" />
    if (test.response?.status && test.response.status < 400) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (test: WebhookTest) => {
    if (test.error) return "bg-red-100 text-red-800 border-red-200"
    if (test.response?.status) {
      if (test.response.status < 300) return "bg-green-100 text-green-800 border-green-200"
      if (test.response.status < 400) return "bg-yellow-100 text-yellow-800 border-yellow-200"
      return "bg-red-100 text-red-800 border-red-200"
    }
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          N8N Webhook Tester
        </CardTitle>
        <CardDescription>
          Test webhooks, APIs, and automation endpoints with custom payloads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="space-y-4">
          <TabsList>
            <TabsTrigger value="test">Test Webhook</TabsTrigger>
            <TabsTrigger value="presets">Saved Webhooks</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/..."
                  />
                </div>

                <div>
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>

                {method !== "GET" && (
                  <div>
                    <Label htmlFor="payload">Payload (JSON)</Label>
                    <Textarea
                      id="payload"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      rows={8}
                      className="font-mono text-xs"
                      placeholder="JSON payload with template variables like {{timestamp}}, {{random}}, {{uuid}}"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Available templates: {{timestamp}}, {{random}}, {{uuid}}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={runWebhookTest}
                    disabled={isLoading || !webhookUrl}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Test'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={saveWebhook}
                    disabled={!webhookUrl}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Response</Label>
                  {response ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(response)}
                        <Badge className={getStatusColor(response)}>
                          {response.error ? 'Error' : `${response.response?.status || 'Unknown'}`}
                        </Badge>
                        {response.response?.timing && (
                          <span className="text-xs text-gray-500">
                            {response.response.timing}ms
                          </span>
                        )}
                        <Button size="sm" variant="outline" onClick={copyResponse}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded border max-h-96 overflow-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(response.error ? { error: response.error } : response.response?.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 rounded border text-center text-gray-500">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <div className="text-sm">No response yet</div>
                      <div className="text-xs">Send a test to see the response</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Saved Webhooks</h3>
              <Button size="sm" variant="outline" onClick={() => setSavedWebhooks([])}>
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {savedWebhooks.map((webhook, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-sm">{webhook.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-md">
                      {webhook.url}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadWebhook(webhook)}>
                      Load
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSavedWebhooks(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {savedWebhooks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved webhooks</div>
                  <div className="text-xs">Save frequently used webhooks for quick access</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Test History</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportHistory} disabled={history.length === 0}>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => setHistory([])}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {history.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(entry.test)}
                    <div>
                      <div className="font-medium text-sm truncate max-w-md">
                        {entry.test.url}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {entry.timestamp.toLocaleString()}
                        {entry.test.response?.timing && (
                          <span>• {entry.test.response.timing}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(entry.test)}>
                    {entry.test.error ? 'Error' : entry.test.response?.status || 'Unknown'}
                  </Badge>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No test history</div>
                  <div className="text-xs">Your webhook tests will appear here</div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}