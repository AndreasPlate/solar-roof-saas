import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Entity, ConnectionTest, WebhookTest } from "../types/studio"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return String(dateString)
  }
}

export function formatValue(value: any, key: string): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "✓" : "✗"
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 1)
    } catch {
      return String(value)
    }
  }
  if (key.toLowerCase().includes("date") || key.toLowerCase().includes("time")) {
    return formatDate(value)
  }
  if (typeof value === "string" && value.length > 50) {
    return value.substring(0, 50) + "..."
  }
  return String(value)
}

export function maskSensitiveValue(value: string | undefined, show: boolean = false): string {
  if (!value) return "Not set"
  if (show) return value
  if (value.length <= 12) return "***"
  return value.substring(0, 8) + "..." + value.substring(value.length - 4)
}

export function getEntityIcon(entityName: string): string {
  const iconMap: Record<string, string> = {
    users: "👤",
    user_profiles: "👤", 
    projects: "📁",
    tasks: "✓",
    clients: "🏢",
    organizations: "🏛️",
    teams: "👥",
    documents: "📄",
    subscriptions: "💳",
    billing: "💰",
    analytics: "📊",
    logs: "📝",
    settings: "⚙️",
    default: "📋"
  }
  
  return iconMap[entityName.toLowerCase()] || iconMap.default
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    connected: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    unknown: "bg-gray-100 text-gray-800 border-gray-200",
    testing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    active: "bg-blue-100 text-blue-800 border-blue-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200"
  }
  
  return colorMap[status.toLowerCase()] || colorMap.unknown
}

export function calculateLatency(startTime: number): number {
  return Date.now() - startTime
}

export async function testDatabaseConnection(supabaseClient: any): Promise<ConnectionTest> {
  const startTime = Date.now()
  
  try {
    const { data, error } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .limit(1)
    
    const latency = calculateLatency(startTime)
    
    if (error) {
      return {
        service: "database",
        status: "error",
        lastTested: new Date(),
        latency,
        errorMessage: error.message
      }
    }
    
    return {
      service: "database",
      status: "connected",
      lastTested: new Date(),
      latency
    }
  } catch (error) {
    return {
      service: "database",
      status: "error",
      lastTested: new Date(),
      latency: calculateLatency(startTime),
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function testWebhook(url: string, method: string = "POST", payload?: any): Promise<WebhookTest> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Studio-Dashboard/1.0'
      },
      body: payload ? JSON.stringify(payload) : undefined
    })
    
    const timing = calculateLatency(startTime)
    const data = await response.json()
    
    return {
      url,
      method: method as any,
      response: {
        status: response.status,
        data,
        timing
      }
    }
  } catch (error) {
    return {
      url,
      method: method as any,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export function exportEntityData(entity: Entity, format: "json" | "csv" = "json"): string {
  if (format === "json") {
    return JSON.stringify(entity.data, null, 2)
  }
  
  if (format === "csv" && entity.data.length > 0) {
    const headers = Object.keys(entity.data[0])
    const csvRows = [
      headers.join(","),
      ...entity.data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(",")
      )
    ]
    return csvRows.join("\n")
  }
  
  return ""
}

export function downloadFile(content: string, filename: string, mimeType: string = "application/json"): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateEntityFilename(entityName: string, format: string): string {
  const timestamp = new Date().toISOString().split("T")[0]
  return `${entityName}_export_${timestamp}.${format}`
}

export function detectEntityType(entity: Entity): "system" | "user" | "content" | "analytics" | "unknown" {
  const systemTables = ["user_profiles", "organizations", "teams", "roles", "permissions"]
  const userTables = ["users", "profiles", "accounts", "sessions"]
  const contentTables = ["projects", "tasks", "documents", "files", "posts", "pages"]
  const analyticsTables = ["events", "analytics", "logs", "metrics", "stats"]
  
  const name = entity.name.toLowerCase()
  
  if (systemTables.some(table => name.includes(table))) return "system"
  if (userTables.some(table => name.includes(table))) return "user"
  if (contentTables.some(table => name.includes(table))) return "content"
  if (analyticsTables.some(table => name.includes(table))) return "analytics"
  
  return "unknown"
}

export function getEntityPriority(entity: Entity): number {
  const typeOrder = {
    system: 1,
    user: 2,
    content: 3,
    analytics: 4,
    unknown: 5
  }
  
  const type = detectEntityType(entity)
  return typeOrder[type] * 1000 + entity.count
}

export function sortEntitiesByPriority(entities: Entity[]): Entity[] {
  return [...entities].sort((a, b) => getEntityPriority(a) - getEntityPriority(b))
}