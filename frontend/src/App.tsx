import './App.css'
import { ClerkLoaded, ClerkLoading, RedirectToSignIn, useAuth } from '@clerk/react'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { Signup } from './pages/Signup'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dash from './dash/Dash'
import Pricing from './pages/Pricing'

function ProtectedDashboard() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return <Dashboard />
}

function App() {
  return (
    <>
      <ClerkLoading>
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading...
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Dash />}></Route>
            <Route path='/pricing' element={<Pricing />}></Route>
            <Route path='/signup/*' element={<Signup />}></Route>
            <Route path='/signin/*' element={<Signin />}></Route>
            <Route path='/dashboard' element={<ProtectedDashboard />}></Route>
          </Routes>
        </BrowserRouter>
      </ClerkLoaded>
    </>
  )
}

export default App
