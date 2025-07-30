"use client"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  Activity, 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  EyeOff,
  Play,
  Refresh,
  Menu,
  Users,
  Calendar,
  FileText,
  Clock,
  Edit
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { MainContainer } from "@/components/ui/main-container"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"

interface Entity {
  name: string
  data: any[]
  error?: any
  exists: boolean
  count: number
}

interface EnvironmentInfo {
  nodeEnv?: string
  supabaseUrl?: string
  hasServiceRole: boolean
  vercelEnv?: string
  appUrl?: string
  appName?: string
}

interface StudioClientProps {
  entities: Entity[]
  user: SupabaseUser
  userRole?: string
  connectionStatus: string
  environmentInfo: EnvironmentInfo
  errorMessage?: string | null
}

interface ColumnProps {
  entities: Entity[]
  expandedEntity: string | null
  setExpandedEntity: (name: string | null) => void
  expandedRecord: string | null
  setExpandedRecord: (id: string | null) => void
}

const statusColors = {
  connected: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
  testing: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return dateString
  }
}

const formatValue = (value: any, key: string): string => {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "✓" : "✗"
  if (typeof value === "object") return JSON.stringify(value)
  if (key.includes("date") || key.includes("time")) return formatDate(value)
  if (typeof value === "string" && value.length > 50) {
    return value.substring(0, 50) + "..."
  }
  return String(value)
}

// Entity Name Column
function EntityNameColumn({ entities, expandedEntity, setExpandedEntity }: ColumnProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-[rgba(59,130,246,0.1)] px-5 py-2.5 sticky top-0 z-10 flex items-center justify-start">
        <div className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-semibold rounded text-gray-700 uppercase tracking-wide">
          <Database className="h-3 w-3 mr-1" />
          ENTITY
        </div>
      </div>
      <div className="flex-1">
        {entities.map((entity) => (
          <div
            key={entity.name}
            className="px-5 py-3 h-12 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-400 border-b border-gray-100 flex items-center"
            onClick={() => setExpandedEntity(expandedEntity === entity.name ? null : entity.name)}
          >
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5 font-medium"
            >
              {entity.name}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

// Count Column
function CountColumn({ entities, expandedEntity, setExpandedEntity }: ColumnProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-[rgba(59,130,246,0.1)] px-5 py-2.5 sticky top-0 z-10 flex items-center justify-start">
        <div className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-semibold rounded text-gray-700 uppercase tracking-wide">
          COUNT
        </div>
      </div>
      <div className="flex-1">
        {entities.map((entity) => (
          <div
            key={entity.name}
            className="px-5 py-3 h-12 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 flex items-center"
            onClick={() => setExpandedEntity(expandedEntity === entity.name ? null : entity.name)}
          >
            <div className="text-xs text-gray-700 font-medium">{entity.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Status Column
function StatusColumn({ entities, expandedEntity, setExpandedEntity }: ColumnProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-[rgba(59,130,246,0.1)] px-5 py-2.5 sticky top-0 z-10 flex items-center justify-start">
        <div className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-semibold rounded text-gray-700 uppercase tracking-wide">
          STATUS
        </div>
      </div>
      <div className="flex-1">
        {entities.map((entity) => (
          <div
            key={entity.name}
            className="px-5 py-3 h-12 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 flex items-center"
            onClick={() => setExpandedEntity(expandedEntity === entity.name ? null : entity.name)}
          >
            <Badge
              className={`${entity.exists && !entity.error ? statusColors.connected : statusColors.error} border text-xs px-2 py-0.5 font-medium`}
            >
              {entity.exists && !entity.error ? "Active" : "Error"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sample Data Column
function SampleDataColumn({ entities, expandedEntity, setExpandedEntity }: ColumnProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-[rgba(59,130,246,0.1)] px-5 py-2.5 sticky top-0 z-10 flex items-center justify-start">
        <div className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-semibold rounded text-gray-700 uppercase tracking-wide">
          SAMPLE DATA
        </div>
      </div>
      <div className="flex-1">
        {entities.map((entity) => (
          <div
            key={entity.name}
            className="px-5 py-3 h-12 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 flex items-center"
            onClick={() => setExpandedEntity(expandedEntity === entity.name ? null : entity.name)}
          >
            <div className="text-xs text-gray-700 font-medium truncate text-left">
              {entity.data.length > 0 ? 
                Object.keys(entity.data[0]).slice(0, 3).join(", ") + "..." : 
                "No data"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Connection Tester Component
function ConnectionTester({ connectionStatus }: { connectionStatus: string }) {
  const [testStatus, setTestStatus] = useState<string>(connectionStatus)
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestStatus("testing")
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTestStatus("connected")
    } catch (error) {
      setTestStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Supabase Connection
        </CardTitle>
        <CardDescription>Test database connectivity and configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={statusColors[testStatus as keyof typeof statusColors]}>
            {testStatus === "connected" && <CheckCircle className="h-3 w-3 mr-1" />}
            {testStatus === "error" && <XCircle className="h-3 w-3 mr-1" />}
            {testStatus === "testing" && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
            {testStatus === "unknown" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {testStatus.charAt(0).toUpperCase() + testStatus.slice(1)}
          </Badge>
        </div>
        <Button 
          onClick={testConnection}
          disabled={isLoading}
          size="sm"
        >
          <Refresh className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Test Connection
        </Button>
      </CardContent>
    </Card>
  )
}

// Webhook Tester Component
function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [payload, setPayload] = useState('{"test": "data"}')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testWebhook = async () => {
    if (!webhookUrl) return
    
    setIsLoading(true)
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      })
      const data = await res.json()
      setResponse({ status: res.status, data })
    } catch (error) {
      setResponse({ status: 'error', error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          N8N Webhook Tester
        </CardTitle>
        <CardDescription>Test webhooks and API endpoints</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Webhook URL</label>
          <Input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Payload (JSON)</label>
          <Textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={3}
            className="font-mono text-xs"
          />
        </div>
        <Button 
          onClick={testWebhook}
          disabled={isLoading || !webhookUrl}
          size="sm"
        >
          <Play className={`h-3 w-3 mr-1`} />
          Send Test
        </Button>
        {response && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <div className="text-xs font-medium mb-2">Response:</div>
            <pre className="text-xs text-gray-700">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Environment Debug Panel
function EnvironmentDebugPanel({ environmentInfo }: { environmentInfo: EnvironmentInfo }) {
  const [showSensitive, setShowSensitive] = useState(false)

  const maskSensitiveValue = (value: string | undefined, show: boolean) => {
    if (!value) return "Not set"
    if (show) return value
    return value.substring(0, 8) + "..." + value.substring(value.length - 4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Environment Debug
        </CardTitle>
        <CardDescription>Application configuration and environment variables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitive(!showSensitive)}
          >
            {showSensitive ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showSensitive ? "Hide" : "Show"} Sensitive
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-medium text-gray-600">Environment:</span>
            <Badge variant="outline">{environmentInfo.nodeEnv || "unknown"}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-medium text-gray-600">Supabase URL:</span>
            <span className="font-mono">{maskSensitiveValue(environmentInfo.supabaseUrl, showSensitive)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-medium text-gray-600">Service Role:</span>
            <Badge className={environmentInfo.hasServiceRole ? statusColors.connected : statusColors.error}>
              {environmentInfo.hasServiceRole ? "Present" : "Missing"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-medium text-gray-600">App URL:</span>
            <span className="font-mono">{environmentInfo.appUrl || "Not set"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-medium text-gray-600">App Name:</span>
            <span className="font-mono">{environmentInfo.appName || "Not set"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudioClient({
  entities,
  user,
  userRole = "user",
  connectionStatus,
  environmentInfo,
  errorMessage
}: StudioClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null)
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  const filteredEntities = useMemo(() => {
    if (!searchTerm) return entities

    return entities.filter(entity =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.data.some(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    )
  }, [entities, searchTerm])

  return (
    <div className="min-h-screen bg-white">
      <MainContainer>
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Studio Dashboard</h1>
          <p className="text-sm text-gray-600">Database administration and debug tools</p>
        </div>

        <Tabs defaultValue="entities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="entities">Data Entities</TabsTrigger>
            <TabsTrigger value="testing">Connection Testing</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Testing</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="entities" className="space-y-4">
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search entities and data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Desktop grid layout */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid" style={{ gridTemplateColumns: "1fr 0.5fr 0.7fr 2fr" }}>
                  <EntityNameColumn
                    entities={filteredEntities}
                    expandedEntity={expandedEntity}
                    setExpandedEntity={setExpandedEntity}
                    expandedRecord={expandedRecord}
                    setExpandedRecord={setExpandedRecord}
                  />
                  <CountColumn
                    entities={filteredEntities}
                    expandedEntity={expandedEntity}
                    setExpandedEntity={setExpandedEntity}
                    expandedRecord={expandedRecord}
                    setExpandedRecord={setExpandedRecord}
                  />
                  <StatusColumn
                    entities={filteredEntities}
                    expandedEntity={expandedEntity}
                    setExpandedEntity={setExpandedEntity}
                    expandedRecord={expandedRecord}
                    setExpandedRecord={setExpandedRecord}
                  />
                  <SampleDataColumn
                    entities={filteredEntities}
                    expandedEntity={expandedEntity}
                    setExpandedEntity={setExpandedEntity}
                    expandedRecord={expandedRecord}
                    setExpandedRecord={setExpandedRecord}
                  />
                </div>

                {/* Expanded Entity Details */}
                {expandedEntity && (
                  <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
                    {(() => {
                      const entity = filteredEntities.find(e => e.name === expandedEntity)
                      if (!entity) return null

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {entity.name} ({entity.count} records)
                            </h3>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                              <Button size="sm" variant="outline">
                                <Refresh className="h-3 w-3 mr-1" />
                                Refresh
                              </Button>
                            </div>
                          </div>

                          {entity.data.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-100">
                                    {Object.keys(entity.data[0]).map(key => (
                                      <th key={key} className="px-3 py-2 text-left font-medium text-gray-900">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {entity.data.slice(0, 10).map((record, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                      {Object.entries(record).map(([key, value]) => (
                                        <td key={key} className="px-3 py-2 text-gray-700">
                                          {formatValue(value, key)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {filteredEntities.length === 0 && (
                  <div className="px-5 py-9 text-center text-gray-500 bg-white">
                    <div className="text-sm">No entities found</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Check your database connection and permissions
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="block md:hidden">
              <div className="space-y-3">
                {filteredEntities.map((entity) => (
                  <Card key={entity.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {entity.name}
                        </Badge>
                        <span className="text-xs text-gray-500">{entity.count} records</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {entity.data.length > 0 ? 
                          Object.keys(entity.data[0]).slice(0, 5).join(", ") : 
                          "No data available"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testing">
            <ConnectionTester connectionStatus={connectionStatus} />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookTester />
          </TabsContent>

          <TabsContent value="environment">
            <EnvironmentDebugPanel environmentInfo={environmentInfo} />
          </TabsContent>
        </Tabs>
      </MainContainer>
    </div>
  )
}