import { BrowserRouter, Routes, Route } from 'react-router-dom'

import GetFilesPage from './components/GetFilesPage'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<HomePage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='login' element={<LoginPage/>}/>
        <Route path='/files' element={<GetFilesPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
