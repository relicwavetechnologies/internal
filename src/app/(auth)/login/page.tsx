import { LoginForm } from "@/components/forms/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <>
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 relative overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Logo */}
          <div className="h-32 w-32 relative">
            <Image
              src="/logo.png"
              alt="Internal Dash Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* App Name */}
          <h1 className="text-5xl font-bold text-white text-center">Internal Dash</h1>

          {/* Tagline */}
          <p className="text-2xl text-white/90 font-light text-center">
            Track your company finances
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-gray-950 p-8 md:p-12">
        {/* Mobile Logo */}
        <div className="md:hidden h-24 w-24 relative mb-8">
          <Image
            src="/logo.png"
            alt="Internal Dash Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[448px]">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </>
  )
}
