import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QrScanner from 'qr-scanner'

function QRScannerPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [todayStats, setTodayStats] = useState({
    approved: 42,
    rejected: 3,
    review: 5
  })

  useEffect(() => {
    startCamera()
    
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    // QR Scanner 정리
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    
    // 비디오 스트림 정리
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => {
        track.stop()
      })
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  const startCamera = async () => {
    try {
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          result => {
            console.log('QR 코드 스캔 결과:', result.data)
            setScanResult(result.data)
            
            // QR 코드 데이터 파싱 및 결과 페이지로 이동
            try {
              const qrData = JSON.parse(result.data)
              cleanup() // 카메라 정리 후 이동
              navigate('/access-result', { state: { qrData } })
            } catch (e) {
              cleanup() // 카메라 정리 후 이동
              navigate('/access-result', { state: { qrData: { id: result.data, judgment: 'unknown' } } })
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        
        await qrScannerRef.current.start()
        setIsScanning(true)
        setCameraError('')
      }
    } catch (error) {
      console.error('카메라 접근 오류:', error)
      setCameraError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.')
    }
  }

  const handleManualInput = () => {
    const qrCode = prompt('QR 코드를 수동으로 입력하세요:')
    if (qrCode) {
      handleQRScan(qrCode)
    }
  }

  const handleQRScan = (qrData) => {
    setScanResult(qrData)
    
    // QR 스캔 결과 처리 (1초 후 결과 페이지로 이동)
    setTimeout(() => {
      cleanup() // 카메라 정리 후 이동
      navigate('/access-result', { 
        state: { 
          qrData,
          scanTime: new Date().toISOString()
        } 
      })
    }, 1000)
  }

  const simulateQRScan = () => {
    const mockQRData = `QR_${Date.now()}_36.5`
    handleQRScan(mockQRData)
  }

  const handleBack = () => {
    cleanup() // 뒤로 가기 시에도 카메라 정리
    navigate('/')
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>📷 QR 스캐너</h2>
        <span>🏠</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>👮 정보안님 (보안팀)</h3>
        <p>📅 2025-09-05 21:37</p>
      </div>

      {/* 카메라 뷰 */}
      <div className="card">
        <h3>📷 카메라 스캔</h3>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {cameraError ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'white',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷❌</div>
                <p>{cameraError}</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* 스캔 가이드 오버레이 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: '3px solid #1890ff',
                borderRadius: '12px',
                background: 'rgba(24, 144, 255, 0.1)'
              }}>
                {/* 모서리 가이드 */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #52c41a',
                  borderRight: 'none',
                  borderBottom: 'none'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #52c41a',
                  borderLeft: 'none',
                  borderBottom: 'none'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #52c41a',
                  borderRight: 'none',
                  borderTop: 'none'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #52c41a',
                  borderLeft: 'none',
                  borderTop: 'none'
                }}></div>
              </div>
            </>
          )}
        </div>

        {scanResult ? (
          <div style={{
            padding: '16px',
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#52c41a'
          }}>
            🔍 QR 코드 감지됨: {scanResult}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
            💡 QR 코드를 스캔 영역에 맞춰주세요
          </div>
        )}
      </div>

      {/* 오늘 스캔 현황 */}
      <div className="card">
        <h3>📊 오늘 스캔 현황</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#52c41a' }}>{todayStats.approved}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>승인 ✅</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#fff2f0', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#f5222d' }}>{todayStats.rejected}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>거부 🚫</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#fffbe6', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#faad14' }}>{todayStats.review}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>재확인 ⚠️</div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ marginTop: '20px' }}>
        <button 
          className="btn btn-primary"
          onClick={simulateQRScan}
          disabled={!isScanning}
        >
          🔍 QR 스캔 시뮬레이션
        </button>
        
        <button 
          className="btn" 
          style={{ background: '#f0f0f0', color: '#595959' }}
          onClick={handleManualInput}
        >
          📝 수동 입력
        </button>

        {cameraError && (
          <button 
            className="btn btn-warning"
            onClick={startCamera}
          >
            🔄 카메라 재시도
          </button>
        )}
      </div>
    </div>
  )
}

export default QRScannerPage
