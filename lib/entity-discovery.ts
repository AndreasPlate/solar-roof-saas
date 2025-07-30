import type { Entity, Column, ForeignKey } from "../types/studio"

/**
 * Dynamically discover database entities and their schemas
 * This is the core intelligence of the studio dashboard
 */

export interface TableInfo {
  name: string
  schema: string
  type: "table" | "view"
  rowCount?: number
}

export async function discoverDatabaseEntities(supabaseClient: any): Promise<Entity[]> {
  const entities: Entity[] = []
  
  // Common table names to check across different project types
  const commonTables = [
    // Core authentication and users
    "users", "user_profiles", "profiles",
    
    // Organization and team management
    "organizations", "teams", "team_members", "workspaces",
    
    // Project and task management  
    "projects", "tasks", "todos", "issues",
    
    // Client and customer management
    "clients", "customers", "contacts",
    
    // Content management
    "documents", "files", "posts", "pages", "articles",
    
    // E-commerce and billing
    "products", "orders", "subscriptions", "billing", "payments",
    
    // Analytics and tracking
    "events", "analytics", "logs", "audit_logs", "metrics",
    
    // Communication
    "messages", "notifications", "emails", "comments",
    
    // System configuration
    "settings", "configurations", "permissions", "roles"
  ]
  
  // Test each table to see if it exists
  const entityPromises = commonTables.map(async (tableName) => {
    try {
      const { data, error, count } = await supabaseClient
        .from(tableName)
        .select("*", { count: "exact", head: false })
        .limit(50)
      
      if (!error && data) {
        // Get column information from the first row
        const columns = data.length > 0 ? 
          Object.keys(data[0]).map(key => ({
            name: key,
            type: typeof data[0][key] === 'string' ? 'text' : 
                  typeof data[0][key] === 'number' ? 'numeric' :
                  typeof data[0][key] === 'boolean' ? 'boolean' :
                  data[0][key] instanceof Date ? 'timestamp' : 'unknown',
            nullable: data.some(row => row[key] === null)
          })) : []
        
        return {
          name: tableName,
          data: data || [],
          exists: true,
          count: count || data.length,
          schema: {
            columns,
            primaryKey: ['id'], // Assume 'id' is primary key
            foreignKeys: detectForeignKeys(columns)
          }
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  })
  
  const results = await Promise.allSettled(entityPromises)
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      entities.push(result.value)
    }
  })
  
  return entities.filter(entity => entity.exists && entity.count > 0)
}

function detectForeignKeys(columns: Column[]): ForeignKey[] {
  const foreignKeys: ForeignKey[] = []
  
  columns.forEach(column => {
    const name = column.name.toLowerCase()
    
    // Common foreign key patterns
    if (name.endsWith('_id') && name !== 'id') {
      const referencedTable = name.replace('_id', '') + 's'
      foreignKeys.push({
        column: column.name,
        referencedTable,
        referencedColumn: 'id'
      })
    }
    
    // Special cases
    if (name === 'user_id' || name === 'created_by' || name === 'updated_by') {
      foreignKeys.push({
        column: column.name,
        referencedTable: 'user_profiles',
        referencedColumn: 'id'
      })
    }
    
    if (name === 'organization_id' || name === 'org_id') {
      foreignKeys.push({
        column: column.name,
        referencedTable: 'organizations',
        referencedColumn: 'id'
      })
    }
  })
  
  return foreignKeys
}

export async function getTableSchema(supabaseClient: any, tableName: string): Promise<Column[]> {
  try {
    // Try to get schema information from information_schema
    const { data, error } = await supabaseClient
      .rpc('get_table_schema', { table_name: tableName })
    
    if (!error && data) {
      return data.map((col: any) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default,
        description: col.description
      }))
    }
    
    // Fallback: infer from sample data
    const { data: sampleData } = await supabaseClient
      .from(tableName)
      .select("*")
      .limit(1)
    
    if (sampleData && sampleData.length > 0) {
      return Object.keys(sampleData[0]).map(key => ({
        name: key,
        type: inferColumnType(sampleData[0][key]),
        nullable: true // Can't determine from sample
      }))
    }
    
    return []
  } catch (error) {
    console.error(`Error getting schema for ${tableName}:`, error)
    return []
  }
}

function inferColumnType(value: any): string {
  if (value === null || value === undefined) return 'unknown'
  if (typeof value === 'string') {
    // Check if it looks like a date
    if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.includes('T') && value.includes('Z')) {
      return 'timestamp'
    }
    // Check if it looks like a UUID
    if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return 'uuid'
    }
    return 'text'
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'numeric'
  }
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'json'
  return 'unknown'
}

export async function getEntityRelationships(entities: Entity[]): Promise<any[]> {
  const relationships = []
  
  for (const entity of entities) {
    if (entity.schema?.foreignKeys) {
      for (const fk of entity.schema.foreignKeys) {
        const referencedEntity = entities.find(e => e.name === fk.referencedTable)
        if (referencedEntity) {
          relationships.push({
            fromEntity: entity.name,
            toEntity: fk.referencedTable,
            type: 'many-to-one',
            foreignKey: fk.column,
            referencedKey: fk.referencedColumn
          })
        }
      }
    }
  }
  
  return relationships
}

export function generateEntityQueries(entity: Entity): Record<string, string> {
  const queries: Record<string, string> = {}
  
  // Basic queries
  queries.selectAll = `SELECT * FROM ${entity.name} LIMIT 100;`
  queries.count = `SELECT COUNT(*) FROM ${entity.name};`
  
  // If we have created_at column
  if (entity.schema?.columns.some(col => col.name === 'created_at')) {
    queries.recent = `SELECT * FROM ${entity.name} ORDER BY created_at DESC LIMIT 10;`
    queries.today = `SELECT * FROM ${entity.name} WHERE created_at >= CURRENT_DATE;`
  }
  
  // If we have status column
  if (entity.schema?.columns.some(col => col.name === 'status')) {
    queries.byStatus = `SELECT status, COUNT(*) as count FROM ${entity.name} GROUP BY status;`
  }
  
  // If we have user_id column
  if (entity.schema?.columns.some(col => col.name === 'user_id')) {
    queries.byUser = `SELECT user_id, COUNT(*) as count FROM ${entity.name} GROUP BY user_id ORDER BY count DESC LIMIT 10;`
  }
  
  return queries
}

export function validateEntityData(entity: Entity): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!entity.name) {
    errors.push("Entity name is required")
  }
  
  if (!entity.data || !Array.isArray(entity.data)) {
    errors.push("Entity data must be an array")
  }
  
  if (entity.count < 0) {
    errors.push("Entity count cannot be negative")
  }
  
  if (entity.data.length !== entity.count) {
    errors.push(`Entity count (${entity.count}) does not match data length (${entity.data.length})`)
  }
  
  // Check for required fields in data
  if (entity.data.length > 0) {
    const firstRow = entity.data[0]
    if (!firstRow.id) {
      errors.push("Entity data should have an 'id' field")
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}