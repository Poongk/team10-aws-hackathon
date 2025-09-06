import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../config/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [demoAdmins, setDemoAdmins] = useState([]);
  const navigate = useNavigate();

  // 관리자 계정 목록 (백엔드에서 동적으로 로드)
  const adminAccounts = demoAdmins.length > 0 ? demoAdmins : [
    { id: 'admin', name: '시스템 관리자' },
    { id: 'manager', name: '출입 관리자' },
    { id: 'supervisor', name: '현장 관리자' }
  ];

  // 백엔드에서 관리자 리스트 로드
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const data = await apiCall('/auth/users', { method: 'GET' });
        if (data.success && data.data && data.data.users) {
          // admin 타입만 필터링
          const admins = data.data.users
            .filter(user => user.type === 'admin')
            .map(user => ({
              id: user.user_id,
              name: user.name
            }));
          setDemoAdmins(admins);
        }
      } catch (error) {
        console.error('관리자 리스트 로드 실패:', error);
      }
    };
    loadAdmins();
  }, []);

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

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 백엔드 API 호출
      const data = await apiCall('/auth/admin', {
        method: 'POST',
        body: JSON.stringify({
          admin_id: adminId,
          password: password
        })
      });

      if (data.success) {
        const adminSession = {
          user_id: data.data.user_id,
          name: data.data.name,
          user_type: data.data.user_type,
          session_token: data.data.session_token
        };
        
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        navigate('/mvp/scanner');
      } else {
        setError(data.error?.message || '로그인에 실패했습니다');
      }
    } catch (error) {
      console.error('관리자 로그인 오류:', error);
      setError('서버 연결에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdoorLogin = async () => {
    setIsLoading(true);
    try {
      // 첫 번째 관리자 계정으로 자동 로그인
      const firstAdmin = adminAccounts[0];
      if (firstAdmin) {
        const data = await apiCall('/auth/admin', {
          method: 'POST',
          body: JSON.stringify({
            admin_id: firstAdmin.id
          })
        });

        if (data.success) {
          const adminSession = {
            user_id: data.data.user_id,
            name: data.data.name,
            user_type: data.data.user_type,
            session_token: data.data.session_token,
            backdoor: true
          };
          
          localStorage.setItem('adminSession', JSON.stringify(adminSession));
          navigate('/mvp/scanner');
        }
      }
    } catch (error) {
      console.error('백도어 로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
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
            onChange={(e) => setAdminId(e.target.value.toLowerCase().trim())}
            onKeyPress={handleKeyPress}
            placeholder="admin"
            className={`admin-input ${error ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="••••••••••"
            className={`admin-input ${error ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="current-password"
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
