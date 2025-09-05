import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChecklistPage from './pages/ChecklistPage'
import ResultPage from './pages/ResultPage'
import QRScannerPage from './pages/QRScannerPage'
import AccessResultPage from './pages/AccessResultPage'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <div className="app-container">
          <div className="mobile-frame">
            <div className="mobile-screen">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/scanner" element={<QRScannerPage />} />
                <Route path="/access-result" element={<AccessResultPage />} />
              </Routes>
            </div>
          </div>
        </div>
        <Navigation />
      </div>
    </Router>
  )
}

export default App
