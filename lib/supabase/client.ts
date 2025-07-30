import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Solar Roof SaaS
export interface SolarProject {
  id: string
  organization_id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  roof_area_sqm?: number
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  google_maps_image_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface RoofAnalysis {
  id: string
  project_id: string
  total_roof_area_sqm?: number
  usable_roof_area_sqm?: number
  obstacles_detected: any[]
  shading_analysis: any
  optimal_panel_count?: number
  estimated_annual_output_kwh?: number
  analysis_confidence?: number
  processed_at: string
}

export interface PanelLayout {
  id: string
  analysis_id: string
  layout_name: string
  panel_positions: any[]
  total_panels: number
  layout_efficiency?: number
  estimated_output_kwh?: number
  is_recommended: boolean
  created_at: string
}

export interface PanelSpecification {
  id: string
  manufacturer: string
  model: string
  width_mm: number
  height_mm: number
  thickness_mm: number
  power_watts: number
  efficiency_percent?: number
  price_per_panel?: number
  created_at: string
}

export interface CostEstimate {
  id: string
  project_id: string
  layout_id?: string
  panel_cost?: number
  installation_cost?: number
  additional_costs: any
  total_cost?: number
  estimated_savings_annual?: number
  payback_period_years?: number
  created_at: string
}