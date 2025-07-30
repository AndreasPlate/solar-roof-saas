import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudioClient } from "./studio-client"
import { AppShell } from "@/components/app-shell"

export default async function StudioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login")
  }

  // Fetch user profile to check for super_admin role
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // Only allow super_admin access to studio
  if (userProfile?.role !== "super_admin") {
    return redirect("/unauthorized")
  }

  // Dynamic entity discovery - get all tables
  let entities: any[] = []
  let connectionStatus = "unknown"
  let errorMessage: string | null = null

  try {
    // Test basic connection
    const { data: connectionTest } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1)
    
    if (connectionTest) {
      connectionStatus = "connected"
    }

    // Discover available tables dynamically
    // This is a simplified version - in production you'd want to use information_schema
    const tableQueries = [
      { name: "user_profiles", query: supabase.from("user_profiles").select("*").limit(50) },
      { name: "projects", query: supabase.from("projects").select("*").limit(50) },
      { name: "tasks", query: supabase.from("tasks").select("*").limit(50) },
      { name: "clients", query: supabase.from("clients").select("*").limit(50) },
      { name: "organizations", query: supabase.from("organizations").select("*").limit(50) },
      { name: "teams", query: supabase.from("teams").select("*").limit(50) },
      { name: "documents", query: supabase.from("documents").select("*").limit(50) },
      { name: "subscriptions", query: supabase.from("subscriptions").select("*").limit(50) },
    ]

    const entityResults = await Promise.allSettled(
      tableQueries.map(async ({ name, query }) => {
        const { data, error } = await query
        return {
          name,
          data: data || [],
          error,
          exists: !error,
          count: data?.length || 0
        }
      })
    )

    entities = entityResults
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map(result => result.value)
      .filter(entity => entity.exists && entity.count > 0)

  } catch (error) {
    console.error("Studio initialization error:", error)
    connectionStatus = "error"
    errorMessage = error instanceof Error ? error.message : "Unknown error"
  }

  // Get environment information for debug panel
  const environmentInfo = {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    vercelEnv: process.env.VERCEL_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    appName: process.env.NEXT_PUBLIC_APP_NAME,
  }

  return (
    <AppShell
      headerProps={{
        user,
        userRole: userProfile?.role || "user",
        currentPage: "studio",
      }}
    >
      <StudioClient
        entities={entities}
        user={user}
        userRole={userProfile?.role || "user"}
        connectionStatus={connectionStatus}
        environmentInfo={environmentInfo}
        errorMessage={errorMessage}
      />
    </AppShell>
  )
}