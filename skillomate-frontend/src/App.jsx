import Login from './components/Login'

import Profile from './pages/Profile'
import { Route, Routes } from "react-router-dom";
import SelectClass from './pages/SelectClass';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Offline from './Offline';
import Class from './pages/Class';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HexagonalGrid from './pages/hex';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>
     
   
      <Route path='/profile' element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      }/>
      <Route path='/class' element={
        <ProtectedRoute>
          <Class/>
        </ProtectedRoute>
      }/>
      <Route path='/offline' element={<Offline/>}/>
      <Route path='/hex' element={<HexagonalGrid/>}/>
    </Routes>
  )
}

export default App