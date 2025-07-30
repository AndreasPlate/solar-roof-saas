"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Search } from "lucide-react"
import { signOutAction } from "@/app/actions"
import Link from "next/link"
import Image from "next/image"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { MainContainer } from "@/components/ui/main-container"

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
}

interface ActionButton {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "primary";
  title: string;
}

interface GlobalHeaderProps {
  user: SupabaseUser;
  userRole?: string;
  currentPage?: string;
  logoSrc?: string;
  logoAlt?: string;
  appName?: string;
  navigation?: NavigationItem[];
  actionButtons?: ActionButton[];
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  showSearch?: boolean;
  primaryColor?: string;
}

const defaultRoleLabels = {
  super_admin: "Super Admin",
  admin: "Admin", 
  manager: "Manager",
  user: "User",
}

export function GlobalHeader({
  user,
  userRole = "user",
  currentPage,
  logoSrc = "/logo.png",
  logoAlt = "{{PROJECT_TITLE}}",
  appName = "{{PROJECT_TITLE}}",
  navigation = [],
  actionButtons = [],
  searchPlaceholder = "Search...",
  searchTerm = "",
  onSearchTermChange,
  showSearch = true,
  primaryColor = "hsl(var(--primary))"
}: GlobalHeaderProps) {
  const roleLabel = defaultRoleLabels[userRole as keyof typeof defaultRoleLabels] || "User"

  return (
    <header className="bg-white pt-[8px]">
      <div className="px-4 sm:px-6 lg:px-8">
        <MainContainer>
          <div className="flex items-center justify-between min-w-0">
            {/* Left: Logo + Menu */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="h-10 w-auto max-h-10"
                    style={{ width: "auto", height: "40px" }}
                    priority
                  />
                ) : (
                  <span className="text-xl font-bold">{appName}</span>
                )}
              </div>
              
              {/* Navigation */}
              {navigation.length > 0 && (
                <nav className="flex space-x-2 min-w-0">
                  {navigation.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentPage === item.href.replace('/', '');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-center h-10 w-[60px] border border-black rounded shadow-md hover:shadow-lg transition-all duration-200 ${
                          isActive
                            ? "bg-gray-100 border-gray-800"
                            : "bg-white hover:bg-gray-50 hover:border-gray-800"
                        }`}
                        title={item.title}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-600"}`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right: Search + Action Buttons + Profile + Logout */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange && onSearchTermChange(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-10 w-64 rounded"
                  />
                </div>
              )}

              {/* Vertical Divider */}
              {(showSearch || actionButtons.length > 0) && (
                <div className="h-6 w-px bg-gray-300"></div>
              )}

              {/* Action Buttons */}
              {actionButtons.map((button, index) => {
                const IconComponent = button.icon;
                return (
                  <Button
                    key={index}
                    onClick={button.onClick}
                    className={
                      button.variant === "primary"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground border border-black hover:border-gray-800 h-10 w-auto px-3 text-xs shadow-md hover:shadow-lg transition-all duration-200"
                        : "bg-white hover:bg-gray-50 text-black border border-black hover:border-gray-800 h-10 w-auto px-3 text-xs shadow-md hover:shadow-lg transition-all duration-200"
                    }
                    title={button.title}
                  >
                    <IconComponent className="h-3 w-3 mr-0.5" />
                    {button.label}
                  </Button>
                );
              })}

              {/* Vertical Divider */}
              {actionButtons.length > 0 && (
                <div className="h-6 w-px bg-gray-300"></div>
              )}

              {/* Profile Icon */}
              <Link href="/profile">
                <button className="flex items-center">
                  <Avatar className="h-10 w-10 bg-primary border-2 border-white shadow-sm">
                    <AvatarFallback className="text-primary-foreground font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </Link>

              {/* Logout Button */}
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-10 w-10 p-0 bg-transparent"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </MainContainer>
      </div>
    </header>
  )
}