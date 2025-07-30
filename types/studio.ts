export interface Entity {
  name: string
  data: any[]
  error?: any
  exists: boolean
  count: number
  schema?: {
    columns: Column[]
    primaryKey?: string[]
    foreignKeys?: ForeignKey[]
  }
}

export interface Column {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
  description?: string
}

export interface ForeignKey {
  column: string
  referencedTable: string
  referencedColumn: string
}

export interface EnvironmentInfo {
  nodeEnv?: string
  supabaseUrl?: string
  hasServiceRole: boolean
  vercelEnv?: string
  appUrl?: string
  appName?: string
  hasStripeKey?: boolean
  hasEmailConfig?: boolean
  customVariables?: Record<string, string>
}

export interface ConnectionTest {
  service: string
  status: "connected" | "error" | "testing" | "unknown"
  lastTested?: Date
  latency?: number
  errorMessage?: string
}

export interface WebhookTest {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  payload?: any
  response?: {
    status: number
    data: any
    timing: number
  }
  error?: string
}

export interface StudioConfig {
  theme: {
    primaryColor: string
    accentColor: string
    headerBg: string
  }
  features: {
    entityBrowser: boolean
    connectionTesting: boolean
    webhookTesting: boolean
    environmentDebug: boolean
    dataExport: boolean
    realTimeMonitoring: boolean
  }
  entities: {
    exclude?: string[]
    include?: string[]
    customViews?: Record<string, string>
  }
}

export interface UserProfile {
  id: string
  email: string
  role: "super_admin" | "admin" | "manager" | "user"
  displayName?: string
  avatar?: string
  permissions?: string[]
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entity?: string
  entityId?: string
  changes?: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface SystemHealth {
  database: ConnectionTest
  auth: ConnectionTest
  storage?: ConnectionTest
  functions?: ConnectionTest
  webhooks: WebhookTest[]
  lastUpdated: Date
}

export interface EntityRelationship {
  fromEntity: string
  toEntity: string
  type: "one-to-one" | "one-to-many" | "many-to-many"
  foreignKey: string
  referencedKey: string
}

export interface StudioContext {
  user: UserProfile
  config: StudioConfig
  entities: Entity[]
  systemHealth: SystemHealth
  auditLogs: AuditLog[]
  relationships: EntityRelationship[]
}