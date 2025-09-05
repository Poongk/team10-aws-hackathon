import { Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import ChecklistPage from '../pages/ChecklistPage'
import ResultPage from '../pages/ResultPage'
import QRScannerPage from '../pages/QRScannerPage'
import AccessResultPage from '../pages/AccessResultPage'
import TeamStatusPage from '../pages/TeamStatusPage'
import MobileNavigation from './MobileNavigation'

function MobileLayout() {
  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="mobile-frame">
          <div className="mobile-screen">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/scanner" element={<QRScannerPage />} />
              <Route path="/access-result" element={<AccessResultPage />} />
              <Route path="/team-status" element={<TeamStatusPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  )
}

export default MobileLayout
