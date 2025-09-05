import { useNavigate, useLocation } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const pages = [
    { path: '/', label: '로그인', icon: '🔐' },
    { path: '/dashboard', label: '대시보드', icon: '🏠' },
    { path: '/checklist', label: '체크리스트', icon: '📋' },
    { path: '/result', label: 'AI 결과', icon: '🤖' },
    { path: '/scanner', label: 'QR 스캐너', icon: '📱' },
    { path: '/access-result', label: '출입결과', icon: '✅' }
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
      gap: '12px',
      zIndex: 99999,
      width: '200px'
    }}>
      {/* 리모컨 상단 표시등 */}
      <div style={{
        gridColumn: '1 / -1',
        height: '8px',
        background: location.pathname !== '/' ? '#52c41a' : '#ff4d4f',
        borderRadius: '4px',
        marginBottom: '8px',
        boxShadow: `0 0 10px ${location.pathname !== '/' ? '#52c41a' : '#ff4d4f'}`
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
            borderRadius: '12px',
            padding: '12px 8px',
            fontSize: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60px',
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
          <span style={{ fontSize: '20px', marginBottom: '4px' }}>
            {page.icon}
          </span>
          <span style={{ fontSize: '9px', textAlign: 'center', lineHeight: '1.2' }}>
            {page.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default Navigation
