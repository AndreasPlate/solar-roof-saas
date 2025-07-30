"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

interface ForgotPasswordFormProps {
  className?: string;
  titleText?: string;
  descriptionText?: string;
  successTitleText?: string;
  successDescriptionText?: string;
  successMessageText?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitButtonText?: string;
  submitButtonPendingText?: string;
  loginPromptText?: string;
  loginLinkText?: string;
  redirectUrl?: string;
}

export function ForgotPasswordForm({ 
  className,
  titleText = "Forgot Password",
  descriptionText = "Enter your email address and we'll send you a link to reset your password",
  successTitleText = "Check your email",
  successDescriptionText = "Password reset instructions have been sent",
  successMessageText = "If you have an account with this email address, you will receive an email to reset your password.",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  submitButtonText = "Send reset link",
  submitButtonPendingText = "Sending...",
  loginPromptText = "Already have an account?",
  loginLinkText = "Sign in",
  redirectUrl = "/auth/update-password",
  ...props 
}: ForgotPasswordFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${redirectUrl}`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{successTitleText}</CardTitle>
            <CardDescription>{successDescriptionText}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {successMessageText}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{titleText}</CardTitle>
            <CardDescription>
              {descriptionText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={emailPlaceholder}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? submitButtonPendingText : submitButtonText}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {loginPromptText}{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  {loginLinkText}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}