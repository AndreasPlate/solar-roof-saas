-- Solar Roof SaaS Database Schema
-- Builds on top of existing De IT Afdeling multi-tenant architecture
-- Assumes organizations and user_profiles tables already exist

-- Solar Roof Projects
CREATE TABLE solar_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  roof_area_sqm DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  google_maps_image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roof Analysis Results
CREATE TABLE roof_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
  total_roof_area_sqm DECIMAL(10, 2),
  usable_roof_area_sqm DECIMAL(10, 2),
  obstacles_detected JSONB DEFAULT '[]', -- Array of obstacle objects {type, coordinates, area}
  shading_analysis JSONB DEFAULT '{}', -- Shading patterns throughout the day
  optimal_panel_count INTEGER,
  estimated_annual_output_kwh DECIMAL(10, 2),
  analysis_confidence DECIMAL(3, 2), -- 0.00 to 1.00
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solar Panel Layouts
CREATE TABLE panel_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES roof_analyses(id) ON DELETE CASCADE,
  layout_name TEXT NOT NULL,
  panel_positions JSONB NOT NULL, -- Array of panel positions {x, y, rotation, tilt}
  total_panels INTEGER NOT NULL,
  layout_efficiency DECIMAL(5, 2), -- Percentage of roof area utilized
  estimated_output_kwh DECIMAL(10, 2),
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Panel Specifications (reference data)
CREATE TABLE panel_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  width_mm INTEGER NOT NULL,
  height_mm INTEGER NOT NULL,
  thickness_mm INTEGER NOT NULL,
  power_watts INTEGER NOT NULL,
  efficiency_percent DECIMAL(4, 2),
  price_per_panel DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Estimates
CREATE TABLE cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
  layout_id UUID REFERENCES panel_layouts(id),
  panel_cost DECIMAL(10, 2),
  installation_cost DECIMAL(10, 2),
  additional_costs JSONB DEFAULT '{}', -- {permits, inverters, wiring, etc}
  total_cost DECIMAL(10, 2),
  estimated_savings_annual DECIMAL(10, 2),
  payback_period_years DECIMAL(4, 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Analytics (for SaaS metrics)
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'project_created', 'analysis_run', 'layout_generated', etc
  resource_id UUID, -- ID of the resource being acted upon
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing Events (for Stripe integration)
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'analysis_credit_used', 'subscription_upgrade', etc
  credits_consumed INTEGER DEFAULT 0,
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE solar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant access
-- Solar Projects
CREATE POLICY "Users can view solar projects from their organization" ON solar_projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create solar projects for their organization" ON solar_projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update solar projects from their organization" ON solar_projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Roof Analyses
CREATE POLICY "Users can view analyses for their organization's projects" ON roof_analyses
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM solar_projects WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create analyses for their organization's projects" ON roof_analyses
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM solar_projects WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Panel Layouts
CREATE POLICY "Users can view layouts for their organization's analyses" ON panel_layouts
  FOR SELECT USING (
    analysis_id IN (
      SELECT ra.id FROM roof_analyses ra
      JOIN solar_projects sp ON ra.project_id = sp.id
      WHERE sp.organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Panel Specifications (public read access)
CREATE POLICY "Panel specifications are publicly readable" ON panel_specifications
  FOR SELECT USING (true);

-- Cost Estimates
CREATE POLICY "Users can view cost estimates for their organization's projects" ON cost_estimates
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM solar_projects WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Usage Analytics
CREATE POLICY "Users can view analytics for their organization" ON usage_analytics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert analytics for any organization" ON usage_analytics
  FOR INSERT WITH CHECK (true);

-- Billing Events
CREATE POLICY "Users can view billing events for their organization" ON billing_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_solar_projects_org_id ON solar_projects(organization_id);
CREATE INDEX idx_solar_projects_created_at ON solar_projects(created_at);
CREATE INDEX idx_roof_analyses_project_id ON roof_analyses(project_id);
CREATE INDEX idx_panel_layouts_analysis_id ON panel_layouts(analysis_id);
CREATE INDEX idx_cost_estimates_project_id ON cost_estimates(project_id);
CREATE INDEX idx_usage_analytics_org_id ON usage_analytics(organization_id);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at);
CREATE INDEX idx_billing_events_org_id ON billing_events(organization_id);

-- Insert some sample panel specifications
INSERT INTO panel_specifications (manufacturer, model, width_mm, height_mm, thickness_mm, power_watts, efficiency_percent, price_per_panel) VALUES
('SunPower', 'SPR-X22-370', 1046, 1690, 40, 370, 22.1, 425.00),
('LG', 'LG370Q1C-A5', 1016, 1700, 40, 370, 21.7, 385.00),
('Panasonic', 'VBHN330SA17', 1053, 1590, 40, 330, 20.3, 365.00),
('Tesla', 'Solar Roof Tile', 1829, 381, 45, 71.67, 17.5, 85.00),
('Canadian Solar', 'CS3U-370MS', 1048, 1690, 35, 370, 19.9, 285.00);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_solar_projects_updated_at BEFORE UPDATE ON solar_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();