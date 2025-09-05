import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 세션에서 사용자 정보 가져오기
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      setUser(JSON.parse(userSession));
    } else {
      // 세션이 없으면 로그인 화면으로
      navigate('/mvp/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/mvp/login');
  };

  const handleBackToLogin = () => {
    navigate('/mvp/login');
  };

  const handleChecklist = () => {
    navigate('/mvp/checklist');
  };

  const handleResults = () => {
    navigate('/mvp/results');
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container worker-dashboard">
      {/* 헤더 */}
      <div className="dashboard-header">
        <button onClick={handleBackToLogin} className="back-button">
          ← 뒤로
        </button>
        <h1>GMP CheckMaster</h1>
      </div>

      {/* 환영 메시지 */}
      <div className="welcome-section">
        <h2>👤 {user.name}님 안녕하세요!</h2>
        <p>오늘도 안전한 작업을 위해 위생상태를 점검해주세요</p>
      </div>

      {/* 메인 액션 카드 */}
      <div className="action-cards">
        <div className="dashboard-card main-action" onClick={handleChecklist}>
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>체크리스트 작성</h3>
            <p>오늘의 위생상태 점검</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        {/* 보조 액션 카드 */}
        <div className="dashboard-card secondary-action" onClick={handleResults}>
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>결과 보기</h3>
            <p>이전 체크리스트 확인</p>
          </div>
          <div className="card-arrow">→</div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="dashboard-footer">
        <button onClick={handleLogout} className="logout-button">
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default WorkerDashboard;
