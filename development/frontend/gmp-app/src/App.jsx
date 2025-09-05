import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChecklistPage from './pages/ChecklistPage'
import ResultPage from './pages/ResultPage'
import QRScannerPage from './pages/QRScannerPage'
import AccessResultPage from './pages/AccessResultPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <div className="mobile-frame">
        <div className="mobile-screen">
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/scanner" element={<QRScannerPage />} />
              <Route path="/access-result" element={<AccessResultPage />} />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  )
}

export default App
