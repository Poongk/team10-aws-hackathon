import { useNavigate, useLocation } from 'react-router-dom'

function DesktopNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const pages = [
    { path: '/desktop/operator-dashboard', label: '운영자 대시보드', icon: '👨‍💼' },
    { path: '/desktop/non-compliance', label: '부적합자 조치', icon: '🚨' },
    { path: '/desktop/admin-dashboard', label: '시스템 관리', icon: '⚙️' },
    { path: '/mobile/login', label: '모바일로', icon: '📱' }
  ]

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '15px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 99999,
      minWidth: '200px'
    }}>
      {/* 데스크톱 네비게이션 제목 */}
      <div style={{
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '5px',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '8px'
      }}>
        데스크톱 네비게이션
      </div>
      
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
            padding: '12px 16px',
            fontSize: '14px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: location.pathname === page.path 
              ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
              : '0 2px 4px rgba(0,0,0,0.2)',
            transform: location.pathname === page.path ? 'scale(0.98)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== page.path) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.background = 'linear-gradient(145deg, #5a6c7d, #3e4c59)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = location.pathname === page.path ? 'scale(0.98)' : 'scale(1)'
            if (location.pathname !== page.path) {
              e.target.style.background = 'linear-gradient(145deg, #4a5568, #2d3748)'
            }
          }}
        >
          <span style={{ fontSize: '18px' }}>
            {page.icon}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>
            {page.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default DesktopNavigation
