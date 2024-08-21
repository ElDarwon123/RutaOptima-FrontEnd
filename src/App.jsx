import React from 'react';
import MapComponent from './components/MapComponent';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/map' element={<MapComponent />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
