import Link from "next/link"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"

export type Message = { success: string } | { error: string } | { message: string }

interface FormMessageProps {
  message?: Message;
  confirmEmailText?: string;
  resendConfirmationText?: string;
}

function isUnconfirmedEmailError(error: string) {
  return (
    error.toLowerCase().includes("not confirmed") ||
    error.toLowerCase().includes("confirm your email") ||
    error.toLowerCase().includes("email not confirmed")
  )
}

export function FormMessage({ 
  message, 
  confirmEmailText = "Confirm your email",
  resendConfirmationText = "Resend confirmation"
}: FormMessageProps) {
  if (!message) return null

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span>{message.success}</span>
        </div>
      )}
      {"error" in message && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="h-4 w-4 text-red-600" />
            <span>{message.error}</span>
          </div>
          {isUnconfirmedEmailError(message.error) && (
            <div className="flex gap-2 mt-2">
              <Link href="/auth/verify-email" className="underline text-primary hover:text-primary/80">
                {confirmEmailText}
              </Link>
              <Link href="/auth/resend-confirmation" className="underline text-primary hover:text-primary/80">
                {resendConfirmationText}
              </Link>
            </div>
          )}
        </div>
      )}
      {"message" in message && (
        <div className="text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          {message.message}
        </div>
      )}
    </div>
  )
}