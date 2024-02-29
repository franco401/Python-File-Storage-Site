import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import GetFilesPage from './components/GetFilesPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<GetFilesPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
