import { SignIn, useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export function Signin() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="dashboard-grid flex min-h-screen items-center justify-center text-white">
      <div className="absolute h-[500px] w-[500px] rounded-full bg-gray-500 opacity-70 blur-[160px]"></div>
      <div className="relative z-10 rounded-xl bg-gradient-to-br p-8">
        <SignIn
          path="/signin"
          routing="path"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
