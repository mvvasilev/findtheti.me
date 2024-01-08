import { Route, Routes } from 'react-router-dom'
import './App.css'
import RootLayout from './pages/RootLayout'
import NewEventPage from './pages/NewEventPage'
import ExistingEventPage from './pages/ExistingEventPage'

function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<NewEventPage />} />
        <Route path="/:eventId" element={<ExistingEventPage />} />
      </Routes>
    </RootLayout>
  )
}

export default App
