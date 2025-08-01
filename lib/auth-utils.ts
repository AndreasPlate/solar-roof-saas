import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name?: string
  display_name?: string
  role: 'super_admin' | 'admin' | 'user'
  created_at: string
  updated_at: string
}

/**
 * Standardized function to get authenticated user and profile
 * This ensures consistent role checking across all apps
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login")
  }

  // Get user profile with role - standardized pattern
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return {
    user: user as User,
    userProfile: userProfile as UserProfile | null,
    userRole: userProfile?.role || "user"
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(userProfile: UserProfile | null, role: 'super_admin' | 'admin' | 'user'): boolean {
  return userProfile?.role === role
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userProfile: UserProfile | null): boolean {
  return hasRole(userProfile, 'super_admin')
}

/**
 * Check if user is admin or super admin
 */
export function isAdmin(userProfile: UserProfile | null): boolean {
  return hasRole(userProfile, 'super_admin') || hasRole(userProfile, 'admin')
} 