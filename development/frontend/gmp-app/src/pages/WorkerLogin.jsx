import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../config/api';
import './WorkerLogin.css';

const WorkerLogin = () => {
  const [formData, setFormData] = useState({ employeeId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const navigate = useNavigate();

  // 유효한 사번 목록 (백엔드에서 동적으로 로드)
  const validEmployees = demoUsers.length > 0 ? demoUsers : [
    { id: 'EMP001', name: '김철수' },
    { id: 'EMP002', name: '이영희' },
    { id: 'EMP003', name: '박민수' },
    { id: 'EMP004', name: '정수연' },
    { id: 'EMP005', name: '최수진' }
  ];

  // 백엔드에서 사용자 리스트 로드
  useEffect(() => {
    let isMounted = true;
    
    const loadUsers = async () => {
      try {
        const data = await apiCall('/auth/users', { method: 'GET' });
        if (data.success && data.data && data.data.users && isMounted) {
          // admin 타입 제외하고 worker만 필터링
          const workers = data.data.users
            .filter(user => user.type === 'worker')
            .map(user => ({
              id: user.user_id,
              name: user.name
            }));
          setDemoUsers(workers);
        }
      } catch (error) {
        if (isMounted) {
          console.error('사용자 리스트 로드 실패:', error);
        }
      }
    };
    
    loadUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 입력 검증
  const validateEmployeeId = (input) => {
    const cleanInput = input.trim().toUpperCase();
    
    if (!cleanInput) {
      return { valid: false, message: '사번을 입력해주세요' };
    }
    
    const empPattern = /^EMP\d{3}$/;
    if (!empPattern.test(cleanInput)) {
      return { valid: false, message: '올바른 사번 형식을 입력해주세요 (예: EMP001)' };
    }
    
    const employee = validEmployees.find(emp => emp.id === cleanInput);
    if (!employee) {
      return { valid: false, message: '등록되지 않은 사번입니다' };
    }
    
    return { valid: true, employee };
  };

  // 실시간 입력 검증
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData({ employeeId: value });
    if (error) setError('');
  };

  // 일반 로그인 처리
  const handleLogin = async () => {
    if (formData.employeeId && formData.employeeId !== '') {
      setIsLoading(true);
      setError('');
      
      try {
        const validation = validateEmployeeId(formData.employeeId);
        
        if (!validation.valid) {
          setError(validation.message);
          return;
        }
        
        // 백엔드 API 호출
        const data = await apiCall('/auth/worker', {
          method: 'POST',
          body: JSON.stringify({
            employee_id: validation.employee.id
          })
        });

        if (data.success) {
          localStorage.setItem('userSession', JSON.stringify({
            user_id: data.data.user_id,
            name: data.data.name,
            user_type: data.data.user_type,
            session_token: data.data.session_token
          }));
          navigate('/mvp/dashboard');
        } else {
          setError(data.error?.message || '로그인에 실패했습니다');
        }
        
      } catch (error) {
        setError('서버 연결에 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('사용자 ID를 입력해주세요.');
    }
  };

  // 로그인 버튼 클릭 처리
  const handleLoginButtonClick = () => {
    if (isHovering) {
      // 호버 상태에서 클릭하면 데모 화면으로
      setShowDemo(true);
    } else {
      // 일반 상태에서는 로그인 처리
      handleLogin();
    }
  };

  // 데모 계정 로그인
  const handleDemoLogin = async (employeeId) => {
    setIsLoading(true);
    try {
      const data = await apiCall('/auth/worker', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: employeeId
        })
      });

      if (data.success) {
        localStorage.setItem('userSession', JSON.stringify({
          user_id: data.data.user_id,
          name: data.data.name,
          user_type: data.data.user_type,
          session_token: data.data.session_token
        }));
        navigate('/mvp/dashboard');
      }
    } catch (error) {
      console.error('데모 로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자 로그인으로 이동
  const goToAdminLogin = () => {
    navigate('/mvp/admin-login');
  };

  // 데모 계정 선택 화면
  if (showDemo) {
    return (
      <div className="page-container worker-login">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => {
              setShowDemo(false);
              setIsHovering(false);
            }} 
            style={{ background: 'none', border: 'none', fontSize: '18px' }}
          >
            ← 뒤로가기
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>🎭 해커톤 데모 계정</h2>
          <p>작업자 계정을 선택하세요</p>
        </div>

        <div className="card">
          <h3>👷 작업자</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {validEmployees.map((employee) => (
              <button 
                key={employee.id}
                className="btn btn-primary"
                onClick={() => handleDemoLogin(employee.id)}
                style={{ 
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontWeight: '500' }}>{employee.name}</span>
                <small style={{ fontSize: '12px', opacity: '0.8', marginTop: '2px' }}>
                  {employee.id}
                </small>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 메인 로그인 화면
  return (
    <div className="page-container worker-login">
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '60px' }}>
        <h1>GMP CheckMaster</h1>
        <div style={{ margin: '20px 0' }}>
          <div style={{ fontSize: '48px' }}>📋</div>
          <p style={{ color: '#595959', margin: '10px 0' }}>일동제약</p>
          <p style={{ color: '#595959' }}>위생상태 점검 시스템</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>👤 로그인</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleLoginButtonClick(); }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              사용자 ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="사용자 ID를 입력하세요"
              maxLength={10}
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              비밀번호
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••••••••"
              defaultValue="password123"
            />
          </div>

          {error && (
            <div style={{
              color: '#ff4d4f',
              fontSize: '14px',
              marginBottom: '20px',
              padding: '8px 12px',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '6px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{ 
              marginBottom: '30px',
              background: isHovering ? '#722ed1' : '#1890ff',
              transform: isHovering ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '로그인 중...' : (isHovering ? '🎭 해커톤 백도어' : '🔐 로그인')}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          <p style={{ 
            color: '#8c8c8c', 
            fontSize: '12px',
            margin: '0 0 16px 0',
            width: '100%',
            textAlign: 'center',
            wordWrap: 'break-word',
            whiteSpace: 'normal'
          }}>
            💡 로그인 버튼에 마우스를 올려보세요
          </p>
          
          {/* 관리자 로그인 링크 */}
          <button 
            onClick={goToAdminLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#1890ff'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            관리자 로그인은 여기를 클릭
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;
