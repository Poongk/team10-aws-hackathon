import { Routes, Route } from 'react-router-dom';
import DesktopNavigation from './DesktopNavigation';

// 임시 플레이스홀더 컴포넌트들
const AdminDashboard = () => <div className="placeholder">관리자 대시보드 (개발 예정)</div>;
const NonCompliancePage = () => <div className="placeholder">부적합 관리 (개발 예정)</div>;
const SettingsPage = () => <div className="placeholder">설정 (개발 예정)</div>;

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
  );
}

export default DesktopLayout;
