import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Conference from './pages/Conference'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/conference/:roomID" element={<Conference />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
