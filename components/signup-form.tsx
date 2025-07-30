"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SignUpFormProps {
  className?: string;
  titleText?: string;
  descriptionText?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  repeatPasswordLabel?: string;
  repeatPasswordPlaceholder?: string;
  submitButtonText?: string;
  submitButtonPendingText?: string;
  loginPromptText?: string;
  loginLinkText?: string;
  successRedirectUrl?: string;
  passwordMismatchText?: string;
  nameRequiredText?: string;
  redirectingText?: string;
}

export function SignUpForm({ 
  className, 
  titleText = "Create Account",
  descriptionText = "Create a new account to get started",
  nameLabel = "Name",
  namePlaceholder = "Your name",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter password",
  repeatPasswordLabel = "Repeat Password",
  repeatPasswordPlaceholder = "Confirm password",
  submitButtonText = "Create Account",
  submitButtonPendingText = "Creating account...",
  loginPromptText = "Already have an account?",
  loginLinkText = "Sign in",
  successRedirectUrl = "/auth/sign-up-success",
  passwordMismatchText = "Passwords do not match",
  nameRequiredText = "Name is required",
  redirectingText = "Redirecting...",
  ...props 
}: SignUpFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setRedirecting(false)

    if (password !== repeatPassword) {
      setError(passwordMismatchText)
      setIsLoading(false)
      return
    }

    if (!displayName) {
      setError(nameRequiredText)
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            display_name: displayName,
            role: "user",
          },
        },
      })
      
      if (error) {
        setError(error.message)
      } else {
        setRedirecting(true)
        router.push(successRedirectUrl)
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {redirecting ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="mt-4 text-primary">{redirectingText}</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{titleText}</CardTitle>
            <CardDescription>{descriptionText}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">{nameLabel}</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder={namePlaceholder}
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
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
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">{repeatPasswordLabel}</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder={repeatPasswordPlaceholder}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
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