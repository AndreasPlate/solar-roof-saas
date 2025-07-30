import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

export function AuthLayout({ 
  children, 
  className = "",
  backgroundImage,
  backgroundColor = "bg-background"
}: AuthLayoutProps) {
  const backgroundStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-6 ${backgroundColor} ${className}`}
      style={backgroundStyle}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}