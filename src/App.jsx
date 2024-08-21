import React from 'react';
import MapComponent from './components/MapComponent';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignUp from './components/SingUp';
import AnchorTemporaryDrawer from './components/Drawer';
import SignIn from './components/SingIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/map' element={<MapComponent />} />
        <Route path='/singup' element={<SignUp />} />
        <Route path='/singin' element={<SignIn/> } />
        <Route path='/dr' element={<AnchorTemporaryDrawer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
