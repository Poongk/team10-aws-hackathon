import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminScanner.css';

const AdminScanner = () => {
  const [admin, setAdmin] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const [stream, setStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadMode, setUploadMode] = useState(true); // 파일 업로드가 기본
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 관리자 세션 확인
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      setAdmin(JSON.parse(adminSession));
      loadMockLog();
      
      // 카메라 모드일 때만 카메라 시작
      if (!uploadMode) {
        startCamera();
      }
    } else {
      navigate('/mvp/admin-login');
    }

    return () => {
      stopCamera();
    };
  }, [navigate, uploadMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 280, 
          height: 280,
          facingMode: 'environment' // 후면 카메라 우선
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      setLastScanResult({
        status: 'error',
        message: '카메라 권한이 필요합니다',
        user: null
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const loadMockLog = () => {
    // 더미 출입 로그 데이터
    const mockLog = [
      {
        id: 5,
        time: '08:15',
        user: '김철수',
        status: 'approved',
        message: '출입허용',
        aiVerified: true
      },
      {
        id: 4,
        time: '08:12',
        user: '이영희',
        status: 'approved',
        message: 'AI검증완료',
        aiVerified: true
      },
      {
        id: 3,
        time: '08:10',
        user: '박민수',
        status: 'expired',
        message: '만료된코드',
        aiVerified: false
      },
      {
        id: 2,
        time: '08:08',
        user: '정수연',
        status: 'approved',
        message: '출입허용',
        aiVerified: false
      },
      {
        id: 1,
        time: '08:05',
        user: '최수진',
        status: 'rejected',
        message: '부적합',
        aiVerified: false
      }
    ];
    setAccessLog(mockLog);
  };

  const simulateQRScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // QR 스캔 시뮬레이션 (랜덤 결과)
    setTimeout(() => {
      const mockResults = [
        {
          status: 'approved',
          message: '출입 허용 - 김철수님',
          user: '김철수',
          aiVerified: true
        },
        {
          status: 'approved',
          message: '출입 허용 (AI 검증 완료) - 이영희님',
          user: '이영희',
          aiVerified: true
        },
        {
          status: 'expired',
          message: '만료된 코드입니다. 재검사 필요',
          user: '박민수',
          aiVerified: false
        },
        {
          status: 'rejected',
          message: '출입이 거부되었습니다',
          user: '최수진',
          aiVerified: false
        }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setLastScanResult(randomResult);
      addToLog(randomResult);
      
      // 3초 후 결과 초기화
      setTimeout(() => {
        setLastScanResult(null);
        setIsScanning(false);
      }, 3000);
      
    }, 1000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setLastScanResult({
        status: 'error',
        message: '이미지 파일만 업로드 가능합니다',
        user: null
      });
      return;
    }

    setIsScanning(true);

    // QR 스캔 시뮬레이션 (파일 업로드)
    setTimeout(() => {
      simulateQRScan();
    }, 500);
  };

  const toggleMode = () => {
    setUploadMode(!uploadMode);
    if (!uploadMode) {
      stopCamera(); // 파일 모드로 전환 시 카메라 정지
    } else {
      startCamera(); // 카메라 모드로 전환 시 카메라 시작
    }
  };

  const addToLog = (result) => {
    const logEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      user: result.user,
      status: result.status,
      message: getLogMessage(result),
      aiVerified: result.aiVerified
    };
    
    setAccessLog(prev => [logEntry, ...prev.slice(0, 9)]);
  };

  const getLogMessage = (result) => {
    switch (result.status) {
      case 'approved':
        return result.aiVerified ? 'AI검증완료' : '출입허용';
      case 'expired':
        return '만료된코드';
      case 'rejected':
        return '부적합';
      default:
        return '오류';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'expired':
      case 'rejected':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    stopCamera();
    navigate('/mvp/admin-login');
  };

  const goToWorkerLogin = () => {
    navigate('/mvp/login');
  };

  if (!admin) {
    return (
      <div className="page-container admin-scanner">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container admin-scanner">
      {/* 헤더 */}
      <div className="scanner-header">
        <h1>QR 스캐너</h1>
        <button onClick={handleLogout} className="logout-button">
          로그아웃
        </button>
      </div>

      {/* QR 스캐너 영역 */}
      <div className="scanner-section">
        {/* 모드 전환 버튼 */}
        <div className="mode-toggle">
          <button 
            onClick={toggleMode}
            className={`mode-button ${!uploadMode ? 'active' : ''}`}
          >
            📷 카메라 스캔
          </button>
          <button 
            onClick={toggleMode}
            className={`mode-button ${uploadMode ? 'active' : ''}`}
          >
            📁 파일 업로드
          </button>
        </div>

        {!uploadMode ? (
          // 카메라 모드
          <>
            <div className="scanner-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="scanner-video"
                onClick={simulateQRScan}
              />
              <div className="scanner-overlay">
                <div className="scan-guide">
                  <div className="guide-frame"></div>
                  <div className="guide-text">
                    📷 QR 스캐너<br />
                    QR 코드를 화면에 맞춰주세요
                  </div>
                </div>
              </div>
              {isScanning && (
                <div className="scanning-indicator">
                  <div className="scan-line"></div>
                </div>
              )}
            </div>
            
            <div className="scanner-hint">
              💡 화면을 터치하여 QR 스캔 시뮬레이션
            </div>
          </>
        ) : (
          // 파일 업로드 모드
          <>
            <div className="upload-container">
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">📁</div>
                <div className="upload-text">QR 이미지 선택</div>
                <div className="upload-subtext">JPG, PNG 파일을 선택하세요</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="scanner-hint">
              📁 QR 코드 이미지를 업로드하여 스캔하세요
            </div>
          </>
        )}
      </div>

      {/* 스캔 결과 표시 */}
      {lastScanResult && (
        <div className={`scan-result ${lastScanResult.status}`}>
          <div className="result-icon">
            {getStatusIcon(lastScanResult.status)}
          </div>
          <div className="result-content">
            <div className="result-message">{lastScanResult.message}</div>
            <div className="result-time">
              {new Date().toLocaleString('ko-KR')}
            </div>
          </div>
        </div>
      )}

      {/* 출입 로그 */}
      <div className="access-log">
        <h3>📊 최근 출입 로그</h3>
        <div className="log-list">
          {accessLog.map((entry) => (
            <div key={entry.id} className="log-entry">
              <div className="log-icon">
                {getStatusIcon(entry.status)}
              </div>
              <div className="log-content">
                <div className="log-main">
                  {entry.time} {entry.user} ({entry.message})
                </div>
                {entry.aiVerified && (
                  <div className="ai-badge">AI</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 로그인 화면 링크 */}
      <div className="login-links">
        <button onClick={goToWorkerLogin} className="login-link-button">
          작업자 로그인 화면
        </button>
      </div>
    </div>
  );
};

export default AdminScanner;
