import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Server-side operations for Solar Roof SaaS
export class SolarRoofService {
  
  // Create a new solar project
  static async createProject(projectData: {
    organization_id: string
    name: string
    address: string
    latitude?: number
    longitude?: number
    roof_area_sqm?: number
    created_by: string
  }) {
    const { data, error } = await supabaseAdmin
      .from('solar_projects')
      .insert(projectData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get projects for an organization
  static async getProjectsForOrg(organizationId: string) {
    const { data, error } = await supabaseAdmin
      .from('solar_projects')
      .select(`
        *,
        roof_analyses (
          id,
          optimal_panel_count,
          estimated_annual_output_kwh,
          analysis_confidence,
          processed_at
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // Save roof analysis results
  static async saveAnalysis(analysisData: {
    project_id: string
    total_roof_area_sqm?: number
    usable_roof_area_sqm?: number
    obstacles_detected: any[]
    shading_analysis: any
    optimal_panel_count?: number
    estimated_annual_output_kwh?: number
    analysis_confidence?: number
  }) {
    const { data, error } = await supabaseAdmin
      .from('roof_analyses')
      .insert(analysisData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Save panel layout
  static async savePanelLayout(layoutData: {
    analysis_id: string
    layout_name: string
    panel_positions: any[]
    total_panels: number
    layout_efficiency?: number
    estimated_output_kwh?: number
    is_recommended?: boolean
  }) {
    const { data, error } = await supabaseAdmin
      .from('panel_layouts')
      .insert(layoutData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Track usage analytics
  static async trackUsage(analyticsData: {
    organization_id: string
    user_id?: string
    action_type: string
    resource_id?: string
    metadata?: any
  }) {
    const { error } = await supabaseAdmin
      .from('usage_analytics')
      .insert(analyticsData)
    
    if (error) throw error
  }

  // Get panel specifications
  static async getPanelSpecs() {
    const { data, error } = await supabaseAdmin
      .from('panel_specifications')
      .select('*')
      .order('efficiency_percent', { ascending: false })
    
    if (error) throw error
    return data
  }
}