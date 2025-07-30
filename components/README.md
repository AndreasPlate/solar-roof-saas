# Supabase Auth Components

Complete authentication system for Supabase with customizable forms and layouts.

## Components Included

- **LoginForm** - User login with email/password
- **SignUpForm** - User registration with email verification
- **ForgotPasswordForm** - Password reset request
- **UpdatePasswordForm** - Set new password after reset
- **SubmitButton** - Form submit button with loading state
- **FormMessage** - Consistent error/success message display
- **AuthLayout** - Layout wrapper for auth pages

## Dependencies Required

Add these to your package.json:
```json
{
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest",
  "react-dom": "^19",
  "lucide-react": "latest"
}
```

## Required Files

You also need these Supabase integration files:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts` 
- `lib/supabase/middleware.ts`
- `app/actions.ts` (with signInAction)

## UI Components Needed

Install these shadcn/ui components:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
```

## Usage Examples

### Login Page
```tsx
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <LoginForm 
      logoSrc="/logo.png"
      appName="My App"
      emailPlaceholder="you@company.com"
    />
  )
}
```

### With Auth Layout
```tsx
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <AuthLayout backgroundColor="bg-gray-50">
      <SignUpForm 
        titleText="Join My App"
        emailPlaceholder="you@company.com"
      />
    </AuthLayout>
  )
}
```

## Customization

All components accept props for customizing:
- Text labels and placeholders
- Button text and styling
- Success/error messages
- Redirect URLs
- Styling classes

Example with custom styling:
```tsx
<LoginForm
  titleText="Welcome Back"
  emailLabel="Work Email"
  emailPlaceholder="you@company.com"
  loginButtonText="Access Dashboard"
  footerText="© 2025 My Company"
  className="custom-auth-form"
/>
```

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Page Routes

Create these pages in your app:
- `/auth/login` - Login form
- `/auth/sign-up` - Registration form
- `/auth/forgot-password` - Password reset request
- `/auth/update-password` - Password update form
- `/auth/confirm` - Email confirmation handler