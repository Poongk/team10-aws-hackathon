import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [showDemo, setShowDemo] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [loginForm, setLoginForm] = useState({
    userId: '',
    password: ''
  })

  const handleLogin = () => {
    // 일반 로그인 처리 (실제로는 API 호출)
    if (loginForm.userId && loginForm.password) {
      alert('일반 로그인은 해커톤에서 구현되지 않았습니다.')
    } else {
      alert('사용자 ID와 비밀번호를 입력해주세요.')
    }
  }

  const handleLoginButtonClick = () => {
    if (isHovering) {
      // 호버 상태에서 클릭하면 데모 화면으로
      setShowDemo(true)
    } else {
      // 일반 상태에서는 로그인 처리
      handleLogin()
    }
  }

  const handleDemoLogin = (role, userId) => {
    // 해커톤 데모 계정 로그인
    switch(role) {
      case 'worker':
        navigate('/dashboard')
        break
      case 'operator':
        navigate('/dashboard') // 운영자 대시보드 (미구현)
        break
      case 'supervisor':
        navigate('/dashboard') // 책임자 화면 (미구현)
        break
      case 'admin':
        navigate('/dashboard') // 관리자 화면 (미구현)
        break
      case 'security':
        navigate('/scanner')
        break
      default:
        navigate('/dashboard')
    }
  }

  if (showDemo) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => {
              setShowDemo(false)
              setIsHovering(false) // 상태 초기화
            }} 
            style={{ background: 'none', border: 'none', fontSize: '18px' }}
          >
            ← 뒤로가기
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>🎭 해커톤 데모 계정</h2>
          <p>역할별 계정을 선택하세요</p>
        </div>

        <div className="card">
          <h3>👷 작업자</h3>
          <button 
            className="btn btn-primary"
            onClick={() => handleDemoLogin('worker', 'worker1')}
            style={{ marginBottom: '8px' }}
          >
            김작업 (생산팀A)<br/>
            <small>worker1</small>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleDemoLogin('worker', 'worker2')}
          >
            박작업 (생산팀B)<br/>
            <small>worker2</small>
          </button>
        </div>

        <div className="card">
          <h3>👨‍💼 관리직</h3>
          <button 
            className="btn" 
            style={{ background: '#52c41a', color: 'white', marginBottom: '8px' }}
            onClick={() => handleDemoLogin('operator', 'operator1')}
          >
            박운영 (운영자)<br/>
            <small>operator1</small>
          </button>
          <button 
            className="btn" 
            style={{ background: '#faad14', color: 'white', marginBottom: '8px' }}
            onClick={() => handleDemoLogin('supervisor', 'supervisor1')}
          >
            이책임 (책임자)<br/>
            <small>supervisor1</small>
          </button>
          <button 
            className="btn" 
            style={{ background: '#722ed1', color: 'white', marginBottom: '8px' }}
            onClick={() => handleDemoLogin('admin', 'admin1')}
          >
            최관리 (관리자)<br/>
            <small>admin1</small>
          </button>
          <button 
            className="btn" 
            style={{ background: '#f5222d', color: 'white' }}
            onClick={() => handleDemoLogin('security', 'security1')}
          >
            정보안 (보안담당)<br/>
            <small>security1</small>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '60px' }}>
        <h1>GMP CheckMaster</h1>
        <div style={{ margin: '20px 0' }}>
          <div style={{ fontSize: '48px' }}>🏭</div>
          <p style={{ color: '#595959', margin: '10px 0' }}>일동제약</p>
          <p style={{ color: '#595959' }}>위생상태 점검 시스템</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>👤 로그인</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            사용자 ID
          </label>
          <input
            type="text"
            value={loginForm.userId}
            onChange={(e) => setLoginForm(prev => ({ ...prev, userId: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            placeholder="사용자 ID를 입력하세요"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            비밀번호
          </label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            placeholder="••••••••••••••"
          />
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleLoginButtonClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ 
            marginBottom: '30px',
            background: isHovering ? '#722ed1' : '#1890ff',
            transform: isHovering ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isHovering ? '🎭 해커톤 백도어' : '🔐 로그인'}
        </button>

        <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          <p style={{ color: '#8c8c8c', fontSize: '12px' }}>
            💡 로그인 버튼에 마우스를 올려보세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
