import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MobileLayout from './components/MobileLayout'
import DesktopLayout from './components/DesktopLayout'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* 모바일 프레임 적용 */}
        <Route path="/mobile/*" element={<MobileLayout />} />
        
        {/* 데스크톱 전체 화면 */}
        <Route path="/desktop/*" element={<DesktopLayout />} />
        
        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/mobile/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
