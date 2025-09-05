import { useNavigate, useLocation } from 'react-router-dom'

function MobileNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const pages = [
    { path: '/mobile/login', label: '로그인', icon: '🔐' },
    { path: '/mobile/dashboard', label: '대시보드', icon: '🏠' },
    { path: '/mobile/checklist', label: '체크리스트', icon: '📋' },
    { path: '/mobile/result', label: 'AI 결과', icon: '🤖' },
    { path: '/mobile/scanner', label: 'QR 스캐너', icon: '📱' },
    { path: '/mobile/access-result', label: '출입결과', icon: '✅' },
    { path: '/mobile/team-status', label: '팀현황', icon: '🏢' },
    { path: '/desktop/operator-dashboard', label: '운영자', icon: '👨‍💼' }
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: '50px',
      right: '50px',
      background: 'linear-gradient(145deg, #2c3e50, #34495e)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      border: '2px solid #1a252f',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'auto auto repeat(4, 1fr)',
      gap: '8px',
      zIndex: 99999,
      width: '180px'
    }}>
      {/* 리모컨 제목 */}
      <div style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '9px',
        fontWeight: 'bold',
        marginBottom: '2px',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        모바일 리모컨
      </div>
      
      {/* 리모컨 상단 표시등 */}
      <div style={{
        gridColumn: '1 / -1',
        height: '4px',
        background: location.pathname !== '/mobile/login' ? '#52c41a' : '#ff4d4f',
        borderRadius: '2px',
        marginBottom: '4px',
        boxShadow: `0 0 6px ${location.pathname !== '/mobile/login' ? '#52c41a' : '#ff4d4f'}`
      }} />
      
      {pages.map(page => (
        <button
          key={page.path}
          onClick={() => navigate(page.path)}
          style={{
            background: location.pathname === page.path 
              ? 'linear-gradient(145deg, #1890ff, #096dd9)' 
              : 'linear-gradient(145deg, #4a5568, #2d3748)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '6px 4px',
            fontSize: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40px',
            transition: 'all 0.2s ease',
            boxShadow: location.pathname === page.path 
              ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
              : '0 2px 4px rgba(0,0,0,0.2)',
            transform: location.pathname === page.path ? 'scale(0.95)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== page.path) {
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = location.pathname === page.path ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <span style={{ fontSize: '14px', marginBottom: '1px' }}>
            {page.icon}
          </span>
          <span style={{ fontSize: '7px', textAlign: 'center', lineHeight: '1.0' }}>
            {page.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default MobileNavigation
