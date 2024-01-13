import { Route, Routes } from 'react-router-dom'
import './App.css'
import RootLayout from './pages/RootLayout'
import NewEventPage from './pages/NewEventPage'
import ExistingEventPage from './pages/ExistingEventPage'
import ThankYouPage from './pages/ThankYouPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<NewEventPage />} />
        <Route path="/:eventId" element={<ExistingEventPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
      </Routes>
    </RootLayout>
  )
}

export default App
