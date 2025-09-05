import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function AccessResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState(null)
  const [autoRedirect, setAutoRedirect] = useState(5)

  useEffect(() => {
    // QR 스캔 데이터 처리
    const { qrData, scanTime } = location.state || {}
    
    // QR 데이터 검증 및 결과 생성
    let accessResult = 'approved'
    let reason = '출입이 승인되었습니다'
    let userInfo = {
      name: '김작업',
      employeeId: 'EMP001',
      team: '생산팀A',
      checkTime: '07:45'
    }

    // QR 데이터 분석 (실제로는 서버에서 검증)
    if (qrData) {
      if (qrData.includes('expired')) {
        accessResult = 'expired'
        reason = 'QR 코드가 만료되었습니다'
      } else if (qrData.includes('invalid')) {
        accessResult = 'invalid'
        reason = '잘못된 QR 코드입니다'
      } else if (qrData.includes('rejected')) {
        accessResult = 'rejected'
        reason = 'AI 판정 결과 출입이 거부되었습니다'
        userInfo.name = '이작업'
        userInfo.employeeId = 'EMP003'
        userInfo.team = '생산팀C'
      }
    }

    setResult({
      access: accessResult,
      reason,
      userInfo,
      qrData,
      scanTime: scanTime || new Date().toISOString(),
      doorAction: accessResult === 'approved' ? 'open' : 'keep_locked'
    })

    // 자동 리다이렉트 카운트다운 (승인 시에만)
    if (accessResult === 'approved') {
      const timer = setInterval(() => {
        setAutoRedirect(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/scanner')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [location.state, navigate])

  const getResultStyle = () => {
    if (!result) return {}
    
    switch(result.access) {
      case 'approved':
        return {
          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
          border: '2px solid #52c41a',
          color: '#52c41a'
        }
      case 'rejected':
        return {
          background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
          border: '2px solid #f5222d',
          color: '#f5222d'
        }
      case 'expired':
      case 'invalid':
        return {
          background: 'linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)',
          border: '2px solid #8c8c8c',
          color: '#8c8c8c'
        }
      default:
        return {}
    }
  }

  const getResultIcon = () => {
    if (!result) return '🔍'
    
    switch(result.access) {
      case 'approved': return '✅'
      case 'rejected': return '🚫'
      case 'expired': return '⏰'
      case 'invalid': return '❌'
      default: return '🔍'
    }
  }

  const getResultTitle = () => {
    if (!result) return 'QR 검증 중...'
    
    switch(result.access) {
      case 'approved': return '출입 승인!'
      case 'rejected': return '출입 불가!'
      case 'expired': return 'QR 코드 만료!'
      case 'invalid': return '잘못된 QR 코드!'
      default: return 'QR 검증 완료'
    }
  }

  if (!result) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <h2>QR 코드 검증 중...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/scanner')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>🚪 출입 결과</h2>
        <span>📷</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>👮 정보안님 (보안팀)</h3>
        <p>📅 2025-09-05 21:37</p>
      </div>

      {/* 출입 결과 */}
      <div className="card" style={getResultStyle()}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {getResultIcon()}
          </div>
          <h2>{getResultTitle()}</h2>
          <p style={{ margin: '16px 0', fontSize: '16px' }}>
            {result.reason}
          </p>
          
          {result.access === 'approved' && autoRedirect > 0 && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {autoRedirect}초 후 자동으로 스캐너로 돌아갑니다
            </div>
          )}
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="card">
        <h3>👤 사용자 정보</h3>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>이름:</span>
          <span>{result.userInfo.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>사번:</span>
          <span>{result.userInfo.employeeId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>소속:</span>
          <span>{result.userInfo.team}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>체크 시간:</span>
          <span>{result.userInfo.checkTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>스캔 시간:</span>
          <span>{new Date(result.scanTime).toLocaleTimeString('ko-KR')}</span>
        </div>
      </div>

      {/* 출입문 제어 */}
      <div className="card">
        <h3>🚪 출입문 제어</h3>
        <div style={{ textAlign: 'center', padding: '16px' }}>
          {result.doorAction === 'open' ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '12px', color: '#52c41a' }}>🚪➡️</div>
              <p style={{ color: '#52c41a', fontWeight: '600' }}>출입문이 3초간 열립니다</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '12px', color: '#f5222d' }}>🚪🔒</div>
              <p style={{ color: '#f5222d', fontWeight: '600' }}>출입문이 잠금 상태를 유지합니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ marginTop: '20px' }}>
        {result.access === 'approved' && (
          <button 
            className="btn btn-success"
            onClick={() => navigate('/scanner')}
          >
            📷 다음 스캔
          </button>
        )}
        
        {result.access === 'rejected' && (
          <>
            <button 
              className="btn btn-danger"
              onClick={() => navigate('/scanner')}
            >
              📷 다음 스캔
            </button>
            <button 
              className="btn" 
              style={{ background: '#f0f0f0', color: '#595959' }}
            >
              📞 운영팀 연락
            </button>
          </>
        )}
        
        {(result.access === 'expired' || result.access === 'invalid') && (
          <>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/scanner')}
            >
              🔄 다시 스캔
            </button>
            <button 
              className="btn" 
              style={{ background: '#f0f0f0', color: '#595959' }}
            >
              📝 수동 확인
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AccessResultPage
