"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface UpdatePasswordFormProps {
  className?: string;
  titleText?: string;
  descriptionText?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  submitButtonText?: string;
  submitButtonPendingText?: string;
  successRedirectUrl?: string;
}

export function UpdatePasswordForm({ 
  className,
  titleText = "Set New Password",
  descriptionText = "Enter your new password below.",
  passwordLabel = "New Password",
  passwordPlaceholder = "New password",
  submitButtonText = "Save Password",
  submitButtonPendingText = "Saving...",
  successRedirectUrl = "/dashboard",
  ...props 
}: UpdatePasswordFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      // Redirect to authenticated route - user already has active session
      router.push(successRedirectUrl)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{titleText}</CardTitle>
          <CardDescription>{descriptionText}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={passwordPlaceholder}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? submitButtonPendingText : submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}