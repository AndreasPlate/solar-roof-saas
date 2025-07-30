# Core Studio Dashboard

Universal admin dashboard template for all De IT Afdeling projects.

## Overview

The Core Studio Dashboard provides a comprehensive debug and administration interface that dynamically adapts to any application's data structure. Inspired by the proven kern-architecten /studio pattern, this template creates a universal studio interface that can be generated for any project type.

## Features

### Dynamic Entity Discovery
- Automatically detects all database tables and entities
- Generates appropriate data views for each entity type
- Adapts UI components based on data relationships

### Development & Debug Tools
- **Supabase Connection Testing**: Verify database connectivity and configuration
- **Environment Variable Validation**: Check all required environment variables
- **N8N Webhook Testing**: Interactive webhook testing and validation
- **Real-time Data Monitoring**: Live data updates and connection status

### Data Management Interface
- **Grid-based Layout**: Professional CSS grid layout from kern-architecten pattern
- **Expandable Rows**: Detailed view for each entity with nested relationships
- **Search & Filtering**: Advanced search across all entity types
- **Status Indicators**: Visual status badges and progress indicators

### Professional UI Components
- **Responsive Design**: Mobile-first design with desktop enhancements
- **Role-based Access**: Only accessible to super-admin users
- **Interactive Buttons**: Direct data manipulation and testing capabilities
- **Brand Integration**: Configurable colors and styling

## Usage

### Authentication & Access Control
The studio is only accessible to users with `super_admin` role:

```typescript
// Server-side role check
const { data: userProfile } = await supabase
  .from("user_profiles")
  .select("role")
  .eq("id", user.id)
  .single()

if (userProfile?.role !== "super_admin") {
  return redirect("/unauthorized")
}
```

### Dynamic Entity Loading
The dashboard automatically discovers and loads all database entities:

```typescript
// Dynamic entity discovery
const { data: tables } = await supabase
  .rpc('get_table_list')

const entities = await Promise.all(
  tables.map(async (table) => {
    const { data } = await supabase
      .from(table.name)
      .select('*')
      .limit(100)
    return { name: table.name, data, schema: table.schema }
  })
)
```

### Interactive Testing
Built-in testing capabilities for development and production validation:

```typescript
// Supabase connection test
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { status: 'connected', data, error }
  } catch (error) {
    return { status: 'error', error }
  }
}

// N8N webhook test
const testWebhook = async (webhookUrl: string, payload: any) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return { status: response.status, data: await response.json() }
  } catch (error) {
    return { status: 'error', error }
  }
}
```

## File Structure

```
core-studio-dashboard/
├── app/
│   └── studio/
│       ├── page.tsx              # Main studio page (server component)
│       └── studio-client.tsx     # Client-side dashboard logic
├── components/
│   ├── studio-grid.tsx           # Dynamic grid layout component
│   ├── entity-viewer.tsx         # Entity data viewer
│   ├── connection-tester.tsx     # Supabase connection testing
│   ├── webhook-tester.tsx        # N8N webhook testing
│   └── debug-panel.tsx           # Development debug tools
├── lib/
│   ├── studio-utils.ts           # Utility functions
│   └── entity-discovery.ts       # Dynamic entity discovery
└── types/
    └── studio.ts                 # TypeScript interfaces
```

## Bootstrap Integration

This component is designed to be generated LAST in the bootstrap process, after all other components are known:

1. **Entity Discovery**: Scans the final database schema
2. **Component Analysis**: Identifies all installed UI components
3. **Function Mapping**: Maps available functions for testing
4. **Dynamic Generation**: Creates studio interface with appropriate entities

## Integration with Commercial Templates

### Website Template
- Basic connection testing
- Environment validation
- Simple data management

### WebApp Template  
- Full entity management
- Advanced search and filtering
- Professional grid layout
- Role-based access control

### SaaS Template
- All WebApp features plus:
- N8N webhook testing
- Real-time monitoring
- Advanced debug tools
- Performance metrics

## Dependencies

### Required UI Components
- `MainContainer` (layout wrapper)
- `Badge` (status indicators)
- `Avatar` (user representations)
- `Sheet` (mobile navigation)
- `Button` (interactive elements)

### Required Icons
- `Users`, `Calendar`, `CheckCircle`, `Edit`
- `FileText`, `Clock`, `AlertTriangle`, `Menu`
- `Settings`, `Database`, `Activity`

### Required Utilities
- `cn()` (className merging)
- Date formatting functions
- Color utility functions

## Customization

### Brand Colors
The studio adapts to the application's primary color scheme:

```typescript
// Primary brand color integration
const brandColor = "rgba(233,198,73,0.75)" // Default yellow
const headerBg = `bg-[${brandColor}]`
const accentColor = "#B8941F"
```

### Entity-Specific Views
Custom views can be defined for specific entity types:

```typescript
const entityViews = {
  projects: ProjectGridView,
  tasks: TaskListView, 
  users: UserProfileView,
  default: GenericEntityView
}
```

## Security Considerations

1. **Super Admin Only**: Strict role-based access control
2. **Data Sanitization**: All displayed data is properly escaped
3. **Safe Testing**: Webhook testing is sandboxed
4. **Environment Protection**: Sensitive data is masked in production

This component provides a production-ready, universal admin interface that can be deployed to any De IT Afdeling project with minimal configuration.