import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // 관리자 계정 목록 (MVP)
  const adminAccounts = [
    { id: 'admin', name: '시스템 관리자' },
    { id: 'manager', name: '출입 관리자' },
    { id: 'supervisor', name: '현장 관리자' }
  ];

  useEffect(() => {
    // 자동 로그인 체크
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession) {
      navigate('/mvp/scanner');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setAdminId(value);
    setError(''); // 입력 시 오류 메시지 초기화
  };

  const validateAdminId = (id) => {
    if (!id.trim()) {
      return '관리자 ID를 입력해주세요';
    }

    // 형식 검증: 영문자, 숫자, 하이픈, 언더스코어만 허용
    const validFormat = /^[a-zA-Z0-9_-]+$/;
    if (!validFormat.test(id)) {
      return '올바른 관리자 ID 형식을 입력해주세요';
    }

    // 길이 제한
    if (id.length < 3 || id.length > 20) {
      return '관리자 ID는 3~20자로 입력해주세요';
    }

    return null;
  };

  const handleLogin = async () => {
    // 입력 검증
    const validationError = validateAdminId(adminId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 관리자 계정 확인
      const admin = adminAccounts.find(acc => acc.id === adminId);
      if (!admin) {
        setError('등록되지 않은 관리자 ID입니다');
        setIsLoading(false);
        return;
      }

      // 로그인 성공 시뮬레이션 (1초 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 관리자 세션 저장
      const adminSession = {
        id: admin.id,
        name: admin.name,
        loginTime: new Date().toISOString(),
        userType: 'admin'
      };

      localStorage.setItem('adminSession', JSON.stringify(adminSession));

      // QR 스캐너로 이동
      navigate('/mvp/scanner');

    } catch (error) {
      console.error('로그인 오류:', error);
      setError('서버 연결에 실패했습니다. 다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdoorLogin = () => {
    // 해커톤 백도어: 즉시 admin으로 로그인
    const adminSession = {
      id: 'admin',
      name: '시스템 관리자',
      loginTime: new Date().toISOString(),
      userType: 'admin',
      backdoor: true
    };

    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    navigate('/mvp/scanner');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const goToWorkerLogin = () => {
    navigate('/mvp/login');
  };

  return (
    <div className="page-container admin-login">
      {/* 헤더 */}
      <div className="admin-header">
        <div className="admin-logo">
          <span className="admin-icon">🔧</span>
          <span className="admin-text">일동제약</span>
        </div>
        <h1 className="app-title">GMP CheckMaster</h1>
        <p className="app-subtitle">위생상태 점검 시스템</p>
      </div>

      {/* 환영 메시지 */}
      <div className="admin-welcome">
        <div className="welcome-icon">👨‍💼</div>
        <h2 className="welcome-title">관리자 로그인</h2>
        <p className="welcome-message">출입 통제 관리</p>
        <p className="welcome-submessage">안전한 작업환경 관리</p>
      </div>

      {/* 로그인 폼 */}
      <div className="admin-form">
        <div className="input-group">
          <label htmlFor="adminId" className="input-label">관리자 ID</label>
          <input
            id="adminId"
            type="text"
            value={adminId}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="admin"
            className={`admin-input ${error ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={isHovered ? handleBackdoorLogin : handleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isLoading}
          className={`admin-button ${isHovered ? 'backdoor' : ''}`}
        >
          {isLoading ? (
            '로그인 중...'
          ) : isHovered ? (
            '🎭 해커톤 백도어'
          ) : (
            '🔧 관리자 로그인'
          )}
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className="admin-hint">
        <div className="hint-icon">💡</div>
        <p>로그인 버튼에 마우스를 올려보세요</p>
      </div>

      {/* 구분선 */}
      <div className="admin-divider"></div>

      {/* 작업자 로그인 링크 */}
      <div className="worker-link">
        <button onClick={goToWorkerLogin} className="link-button">
          작업자 로그인은 여기를 클릭
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
