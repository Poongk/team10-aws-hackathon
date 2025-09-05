import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import NonCompliancePage from '../pages/NonCompliancePage'
import SettingsPage from '../pages/SettingsPage'
import DesktopNavigation from './DesktopNavigation'

function DesktopLayout() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <Routes>
        <Route path="/operator-dashboard" element={<AdminDashboard />} />
        <Route path="/non-compliance" element={<NonCompliancePage />} />
        <Route path="/admin-dashboard" element={<SettingsPage />} />
      </Routes>
      <DesktopNavigation />
    </div>
  )
}

export default DesktopLayout
