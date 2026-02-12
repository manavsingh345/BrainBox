import './App.css'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { Signup } from './pages/Signup'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Dash from './dash/Dash'
import Pricing from './pages/Pricing'


function App() {

  return (
    
    <BrowserRouter>
    <Routes>
      <Route path='/dashboard' element={<Dashboard/>}></Route>
      <Route path='/' element={<Dash/>}></Route>
      <Route path='/pricing' element={<Pricing/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/signin' element={<Signin/>}></Route>
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
