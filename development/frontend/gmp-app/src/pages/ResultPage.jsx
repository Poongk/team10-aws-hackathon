import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'

function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState(null)
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    // AI 판정 결과 시뮬레이션
    const checklistData = location.state?.checklistData || {}
    
    // 간단한 판정 로직 (실제로는 AI API 호출)
    let judgment = 'approved'
    let reason = '모든 위생상태가 정상입니다'
    
    if (checklistData.temperature && parseFloat(checklistData.temperature) > 37.5) {
      judgment = 'rejected'
      reason = '발열 증상이 감지되었습니다'
    } else if (checklistData.symptoms && checklistData.symptoms !== '없음') {
      judgment = 'rejected'
      reason = '증상이 감지되었습니다'
    } else if (checklistData.clothing === '부적절' || checklistData.accessories !== '없음') {
      judgment = 'review_required'
      reason = '복장 상태를 재확인해주세요'
    }

    setResult({
      judgment,
      reason,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    })

    // QR 코드 생성
    if (judgment === 'approved' || judgment === 'review_required') {
      const qrData = JSON.stringify({
        id: `QR_${Date.now()}`,
        judgment,
        temperature: checklistData.temperature || '36.5',
        timestamp: new Date().toISOString(),
        worker: '김작업',
        team: '생산팀A'
      })
      
      // 실제 QR 코드 이미지 생성
      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCode(url)
      }).catch(err => {
        console.error('QR 코드 생성 오류:', err)
        setQrCode('QR_ERROR')
      })
    }
  }, [location.state])

  const getResultStyle = () => {
    if (!result) return {}
    
    switch(result.judgment) {
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
      case 'review_required':
        return {
          background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)',
          border: '2px solid #faad14',
          color: '#faad14'
        }
      default:
        return {}
    }
  }

  const getResultIcon = () => {
    if (!result) return '🤖'
    
    switch(result.judgment) {
      case 'approved': return '✅'
      case 'rejected': return '🚫'
      case 'review_required': return '⚠️'
      default: return '🤖'
    }
  }

  const getResultTitle = () => {
    if (!result) return 'AI 판정 중...'
    
    switch(result.judgment) {
      case 'approved': return '출입 승인!'
      case 'rejected': return '출입 불가!'
      case 'review_required': return '재확인 필요!'
      default: return 'AI 판정 완료'
    }
  }

  if (!result) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
          <h2>AI 판정 중...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>🤖 AI 판정 결과</h2>
        <span>🏠</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>👤 김작업님 (생산팀A)</h3>
        <p>📅 2025-09-05 21:37</p>
      </div>

      {/* AI 판정 결과 */}
      <div className="card" style={getResultStyle()}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {getResultIcon()}
          </div>
          <h2>{getResultTitle()}</h2>
          <p style={{ margin: '16px 0', fontSize: '16px' }}>
            {result.reason}
          </p>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            AI 신뢰도: {(result.confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="card">
        <h3>📋 체크 정보</h3>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>판정 시간:</span>
          <span>{new Date().toLocaleTimeString('ko-KR')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>유효 시간:</span>
          <span>17:30까지</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <span style={{ width: '80px', color: '#8c8c8c' }}>AI 모델:</span>
          <span>Claude-3 Sonnet</span>
        </div>
      </div>

      {/* QR 코드 */}
      {qrCode && (
        <div className="card">
          <h3>📱 QR 코드</h3>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {qrCode === 'QR_ERROR' ? (
              <div style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
                background: '#f0f0f0',
                border: '2px solid #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#8c8c8c'
              }}>
                QR 코드 생성 오류
              </div>
            ) : qrCode ? (
              <img 
                src={qrCode} 
                alt="QR Code" 
                style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
                background: '#f0f0f0',
                border: '2px solid #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#8c8c8c'
              }}>
                QR 코드 생성 중...
              </div>
            )}
            <p style={{ margin: '16px 0', fontSize: '14px', color: '#595959' }}>
              보안담당자에게 QR 코드를 스캔받으세요
            </p>
          </div>
          
          <button className="btn btn-primary">
            📱 QR 코드 확대
          </button>
          <button className="btn" style={{ background: '#f0f0f0', color: '#595959' }}>
            💾 QR 코드 저장
          </button>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ marginTop: '20px' }}>
        {result.judgment === 'approved' && (
          <button 
            className="btn btn-success"
            onClick={() => navigate('/dashboard')}
          >
            ✅ 출입 준비 완료
          </button>
        )}
        
        {result.judgment === 'rejected' && (
          <button 
            className="btn btn-danger"
            onClick={() => navigate('/dashboard')}
          >
            🏠 대시보드로 돌아가기
          </button>
        )}
        
        {result.judgment === 'review_required' && (
          <>
            <button 
              className="btn btn-warning"
              onClick={() => navigate('/checklist')}
            >
              📝 체크리스트 재작성
            </button>
            <button 
              className="btn" 
              style={{ background: '#f0f0f0', color: '#595959' }}
              onClick={() => navigate('/dashboard')}
            >
              🏠 대시보드로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultPage
