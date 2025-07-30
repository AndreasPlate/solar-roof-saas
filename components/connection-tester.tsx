"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Activity, 
  AlertTriangle, 
  Refresh,
  Wifi,
  Key,
  Shield
} from "lucide-react"
import { testDatabaseConnection, getStatusColor } from "../lib/studio-utils"
import type { ConnectionTest } from "../types/studio"

interface ConnectionTesterProps {
  supabaseClient: any
  initialStatus?: string
}

export function ConnectionTester({ supabaseClient, initialStatus = "unknown" }: ConnectionTesterProps) {
  const [tests, setTests] = useState<ConnectionTest[]>([
    {
      service: "database",
      status: initialStatus as any,
      lastTested: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const runAllTests = async () => {
    setIsLoading(true)
    setProgress(0)
    
    const testSuites = [
      { name: "Database Connection", test: () => testDatabaseConnection(supabaseClient) },
      { name: "Authentication", test: () => testAuth() },
      { name: "Row Level Security", test: () => testRLS() },
      { name: "Real-time", test: () => testRealtime() }
    ]
    
    const results: ConnectionTest[] = []
    
    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i]
      setProgress((i / testSuites.length) * 100)
      
      try {
        const result = await suite.test()
        results.push(result)
      } catch (error) {
        results.push({
          service: suite.name.toLowerCase().replace(/\s/g, "_"),
          status: "error",
          lastTested: new Date(),
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        })
      }
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setProgress(100)
    setTests(results)
    setIsLoading(false)
  }

  const testAuth = async (): Promise<ConnectionTest> => {
    const startTime = Date.now()
    
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (error) {
        return {
          service: "authentication",
          status: "error",
          lastTested: new Date(),
          latency: Date.now() - startTime,
          errorMessage: error.message
        }
      }
      
      return {
        service: "authentication", 
        status: session ? "connected" : "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: !session ? "No active session" : undefined
      }
    } catch (error) {
      return {
        service: "authentication",
        status: "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  const testRLS = async (): Promise<ConnectionTest> => {
    const startTime = Date.now()
    
    try {
      // Test RLS by trying to access a protected table
      const { data, error } = await supabaseClient
        .from("user_profiles")
        .select("id")
        .limit(1)
      
      if (error && error.code === "42501") {
        // RLS is working (permission denied is expected for some operations)
        return {
          service: "row_level_security",
          status: "connected",
          lastTested: new Date(),
          latency: Date.now() - startTime
        }
      }
      
      return {
        service: "row_level_security",
        status: data ? "connected" : "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: error?.message
      }
    } catch (error) {
      return {
        service: "row_level_security",
        status: "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  const testRealtime = async (): Promise<ConnectionTest> => {
    const startTime = Date.now()
    
    try {
      // Test realtime connection
      const channel = supabaseClient
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {})
        .subscribe()
      
      // Wait a moment for connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const status = channel.state
      
      await supabaseClient.removeChannel(channel)
      
      return {
        service: "realtime",
        status: status === "SUBSCRIBED" ? "connected" : "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: status !== "SUBSCRIBED" ? `Channel state: ${status}` : undefined
      }
    } catch (error) {
      return {
        service: "realtime",
        status: "error",
        lastTested: new Date(),
        latency: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  const getTestIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "testing":
        return <Activity className="h-4 w-4 text-yellow-600 animate-pulse" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "database":
        return <Database className="h-4 w-4" />
      case "authentication":
        return <Key className="h-4 w-4" />
      case "row_level_security":
        return <Shield className="h-4 w-4" />
      case "realtime":
        return <Wifi className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const formatServiceName = (service: string) => {
    return service.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ")
  }

  const overallStatus = tests.length > 0 ? 
    tests.every(test => test.status === "connected") ? "connected" :
    tests.some(test => test.status === "connected") ? "warning" : "error"
    : "unknown"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Tests
        </CardTitle>
        <CardDescription>
          Comprehensive testing of all Supabase services and security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getTestIcon(overallStatus)}
              <span className="font-medium">Overall Status</span>
            </div>
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </div>
          <Button 
            onClick={runAllTests}
            disabled={isLoading}
            size="sm"
          >
            <Refresh className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Running connection tests...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Individual Test Results */}
        <div className="space-y-3">
          {tests.map((test) => (
            <div 
              key={test.service}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getServiceIcon(test.service)}
                <div>
                  <div className="font-medium text-sm">
                    {formatServiceName(test.service)}
                  </div>
                  {test.latency && (
                    <div className="text-xs text-gray-500">
                      {test.latency}ms response time
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {test.errorMessage && (
                  <div className="text-xs text-red-600 max-w-xs truncate" title={test.errorMessage}>
                    {test.errorMessage}
                  </div>
                )}
                <Badge className={getStatusColor(test.status)}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </Badge>
                {getTestIcon(test.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Last Tested */}
        {tests.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            Last tested: {tests[0].lastTested?.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}