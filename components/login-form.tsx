import Link from "next/link"
import { SubmitButton } from "./submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage, type Message } from "./form-message"
import { signInAction } from "@/app/actions"
import Image from "next/image"

interface LoginFormProps {
  searchParams?: Message;
  logoSrc?: string;
  logoAlt?: string;
  appName?: string;
  showLogo?: boolean;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  forgotPasswordText?: string;
  loginButtonText?: string;
  loginButtonPendingText?: string;
  signupPromptText?: string;
  signupLinkText?: string;
  footerText?: string;
  className?: string;
}

export function LoginForm({
  searchParams,
  logoSrc = "/logo.png",
  logoAlt = "{{PROJECT_TITLE}}",
  appName = "{{PROJECT_TITLE}}",
  showLogo = true,
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
  forgotPasswordText = "Forgot Password?",
  loginButtonText = "Sign In",
  loginButtonPendingText = "Signing In...",
  signupPromptText = "Don't have an account?",
  signupLinkText = "Sign up here",
  footerText,
  className = ""
}: LoginFormProps) {

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-background ${className}`}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          {/* Header with logo */}
          {showLogo && (
            <div className="bg-card px-6 py-8 text-center border-b border-border">
              <div className="flex justify-center">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    width={200}
                    height={40}
                    className="h-10 w-auto"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-card-foreground">{appName}</h1>
                )}
              </div>
            </div>
          )}

          {/* Form content */}
          <div className="px-6 py-8">
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-card-foreground">
                    {emailLabel}
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder={emailPlaceholder}
                    required
                    className="h-10 text-sm border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-semibold text-card-foreground">
                      {passwordLabel}
                    </Label>
                    <Link
                      className="text-xs text-primary hover:text-primary/80 font-medium underline"
                      href="/auth/forgot-password"
                    >
                      {forgotPasswordText}
                    </Link>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    placeholder={passwordPlaceholder}
                    required
                    className="h-10 text-sm border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={signInAction}
                pendingText={loginButtonPendingText}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 text-sm border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loginButtonText}
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {signupPromptText}{" "}
                <Link className="text-primary hover:text-primary/80 font-semibold underline" href="/auth/sign-up">
                  {signupLinkText}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {footerText && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>{footerText}</p>
          </div>
        )}
      </div>
    </div>
  )
}