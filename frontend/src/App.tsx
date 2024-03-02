import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import GetFilesPage from './components/GetFilesPage'
import RegisterPage from './components/RegisterPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/files' element={<GetFilesPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
