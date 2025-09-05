import { Routes, Route } from 'react-router-dom';
import MVPNavigation from './MVPNavigation';

// MVP 페이지들
import WorkerLogin from '../pages/WorkerLogin';
import WorkerDashboard from '../pages/WorkerDashboard';

// 임시 플레이스홀더 컴포넌트들
const WorkerChecklist = () => <div className="placeholder">WK-003: 체크리스트 작성 (개발 예정)</div>;
const WorkerResult = () => <div className="placeholder">WK-004: 판정 결과 (개발 예정)</div>;
const WorkerResults = () => <div className="placeholder">WK-005: 결과 보기 (개발 예정)</div>;
const AdminLogin = () => <div className="placeholder">AD-001: 관리자 로그인 (개발 예정)</div>;
const AdminScanner = () => <div className="placeholder">AD-002: QR 스캐너 (개발 예정)</div>;

function MVPLayout() {
  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="mobile-frame">
          <div className="mobile-screen">
            <Routes>
              {/* MVP 화면들 */}
              <Route path="/login" element={<WorkerLogin />} />
              <Route path="/dashboard" element={<WorkerDashboard />} />
              <Route path="/checklist" element={<WorkerChecklist />} />
              <Route path="/result" element={<WorkerResult />} />
              <Route path="/results" element={<WorkerResults />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/scanner" element={<AdminScanner />} />
            </Routes>
          </div>
        </div>
      </div>
      <MVPNavigation />
    </div>
  );
}

export default MVPLayout;
