import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Map from '../pages/Map/Map'
import SignIn from '../pages/UserSingIn/SingIn'
import SignInSide from '../pages/UserSingUp/SingUp'

export default function RoutesApp() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path='/map' element={<Map />} />
        <Route path='/' element={<SignInSide />} />
        <Route path='/singin' element={<SignIn/> } />
        </Routes>
    </BrowserRouter>
  )
}
