import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedApiCall } from '../config/api';
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
      
      // 페이지 진입 시 스캔 결과 초기화
      setLastScanResult(null);
      
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

  const loadMockLog = async () => {
    // 실제 출입 로그만 조회
    try {
      await loadAccessLogs();
    } catch (error) {
      console.error('❌ 출입 로그 조회 실패:', error);
      // 빈 배열로 설정
      setAccessLog([]);
    }
  };
  
  const simulateQRScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // 카메라 스캔 시뮬레이션 제거
    setIsScanning(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📷 QR 이미지 업로드:', file.name, file.type, file.size);

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      console.log('❌ 이미지 파일이 아님:', file.type);
      setLastScanResult({
        status: 'error',
        message: '이미지 파일만 업로드 가능합니다',
        user: null
      });
      return;
    }
 
    setIsScanning(true);

    try {
      // 이미지에서 QR 코드 텍스트 추출 시뮬레이션
      const qrText = await extractQRFromImage(file);
      console.log('🔍 QR 텍스트 추출 결과:', qrText);
      
      if (qrText) {
        const result = await parseQRResult(qrText);
        console.log('📊 QR 파싱 결과:', result);
        setLastScanResult(result);
        addToLog(result);
      } else {
        console.log('⚠️ QR 코드를 찾을 수 없음');
        setLastScanResult({
          status: 'error',
          message: 'QR 코드를 찾을 수 없습니다. 다른 이미지를 시도해주세요.',
          user: null
        });
      }
    } catch (error) {
      console.error('❌ QR 분석 오류:', error);
      setLastScanResult({
        status: 'error',
        message: 'QR 코드 분석 중 오류가 발생했습니다',
        user: null
      });
    }

    setIsScanning(false);
  };

  const extractQRFromImage = async (file) => {
    console.log('📷 실제 QR 코드 추출 시작:', file.name);
    
    try {
      // QR 코드 스캐너 라이브러리 사용
      const QrScanner = (await import('qr-scanner')).default;
      
      // 이미지 파일에서 QR 코드 스캔
      const qrResult = await QrScanner.scanImage(file, {
        returnDetailedScanResult: false,
        alsoTryWithoutSourceRect: true
      });
      
      console.log('✅ QR 코드 스캔 성공:', qrResult);
      console.log('📊 QR 결과 타입:', typeof qrResult);
      console.log('📊 QR 결과 상세:', qrResult);
      
      // 결과가 객체인 경우 처리
      let qrText;
      if (typeof qrResult === 'string') {
        qrText = qrResult;
      } else if (typeof qrResult === 'object' && qrResult !== null) {
        // 객체인 경우 data 필드나 text 필드 확인
        qrText = qrResult.data || qrResult.text || JSON.stringify(qrResult);
      } else {
        qrText = String(qrResult);
      }
      
      console.log('📝 최종 QR 텍스트:', qrText);
      console.log('📝 최종 QR 텍스트 타입:', typeof qrText);
      
      return qrText;
      
    } catch (error) {
      console.error('❌ QR 코드 스캔 실패:', error);
      
      // QR 코드를 찾을 수 없는 경우
      if (error.message?.includes('No QR code found')) {
        console.log('⚠️ QR 코드가 없는 이미지입니다');
        return null;
      }
      
      // 기타 오류
      throw error;
    }
  };

  const parseQRResult = async (qrText) => {
    console.log('🔍 QR 텍스트 파싱 시작:', qrText);
    console.log('📊 QR 텍스트 상세 정보:');
    console.log('  - 타입:', typeof qrText);
    console.log('  - 값:', qrText);
    
    // qrText가 문자열이 아닌 경우 처리
    if (typeof qrText !== 'string') {
      console.error('❌ QR 텍스트가 문자열이 아님:', qrText);
      throw new Error('QR 코드 데이터 형식이 올바르지 않습니다');
    }
    
    console.log('  - 길이:', qrText.length);
    console.log('  - 첫 10자:', qrText.substring(0, 10));
    console.log('  - 마지막 10자:', qrText.substring(qrText.length - 10));
    
    try {
      // JSON 형태인지 확인
      const jsonData = JSON.parse(qrText);
      console.log('✅ JSON 파싱 성공!');
      console.log('📊 파싱된 JSON 객체:', jsonData);
      console.log('📊 JSON 객체 키들:', Object.keys(jsonData));
      
      // record_id 추출
      const recordId = jsonData.record_id || jsonData.check_id;
      console.log('🔑 추출된 record_id:', recordId);
      
      if (recordId) {
        console.log('🔍 record_id로 API 호출 시작:', recordId);
        
        // API 호출로 실제 데이터 가져오기
        const apiResult = await fetchChecklistDetail(recordId);
        return apiResult;
      } else {
        console.error('❌ record_id를 찾을 수 없습니다. JSON 구조:', jsonData);
        throw new Error('record_id를 찾을 수 없습니다');
      }
    } catch (e) {
      console.log('❌ JSON 파싱 실패:', e.message);
      console.log('📝 텍스트 형태 QR로 처리합니다');
      console.log('📝 텍스트 QR 내용 미리보기:', qrText.split('\n').slice(0, 3));
      throw new Error(e.message);
      // return parseTextQR(qrText);
    }
  };

  const fetchChecklistDetail = async (recordId) => {
    try {
      console.log('🔍 record_id로 API 호출:', recordId);
      
      const data = await authenticatedApiCall(`/checklist/detail/${recordId}`, {
        method: 'GET'
      });

      console.log('📊 API 응답 데이터:', data);
      
      if (data.success) {
        const detail = data.data;
        
        // API 응답을 스캐너 결과 형태로 변환
        let status = detail.status;
        
        // is_expired가 true면 만료 처리
        if (detail.is_expired) {
          status = 'expired';
        }
        
        const result = {
          status: status === 'approved' ? 'approved' : 
                  status === 'rejected' ? 'rejected' : 'expired',
          message: getStatusMessage(status, detail.user_name, detail.reason, detail.is_expired),
          user: {
            name: detail.user_name,
            employeeId: detail.user_id,
            recordId: detail.check_id,
            timestamp: detail.check_time || new Date().toISOString(),
            expireTime: detail.expire_time,
            reason: detail.reason,
            isExpired: detail.is_expired
          }
        };
        
        console.log('✅ API 기반 결과 생성:', result);
        return result;
      } else {
        throw new Error(data.error?.message || 'API 응답 오류');
      }
    } catch (error) {
      console.error('❌ API 호출 오류:', error);
      
      // API 실패 시 오류 결과 반환
      return {
        status: 'error',
        message: `데이터 조회 실패: ${error.message}`,
        user: {
          name: '알 수 없음',
          employeeId: recordId,
          recordId: recordId
        }
      };
    }
  };

  const getStatusMessage = (status, userName, reason, isExpired) => {
    // 만료 체크가 최우선
    if (isExpired) {
      return `만료된 QR 코드입니다. ${userName}님은 재검사를 받아야 합니다.`;
    }
    
    switch (status) {
      case 'approved':
        return `출입 허용 - ${userName}님`;
      case 'rejected':
        return `출입 거부 - ${userName}님 (${reason || '건강상 이유'})`;
      case 'expired':
        return `만료된 코드 - ${userName}님 (재검사 필요)`;
      default:
        return `알 수 없는 상태 - ${userName}님`;
    }
  };
  
  const parseTextQR = (qrText) => {
    // 기존 텍스트 형태 QR 코드 처리
    const lines = qrText.split('\n');
    const userInfo = lines[0]; // "박민수 (EMP003)"
    const status = lines[1];   // "만료됨" 또는 "출입허용"
    
    const userName = userInfo.split(' (')[0];
    
    console.log('📝 텍스트 QR 파싱:', { userInfo, status, userName });
    
    if (status === '만료됨') {
      const result = {
        status: 'expired',
        message: `만료된 코드입니다. 재검사 필요 - ${userName}님`,
        user: userName,
        aiVerified: false
      };
      console.log('⏰ 만료된 QR 코드:', result);
      return result;
    } else if (status === '출입허용') {
      const result = {
        status: 'approved',
        message: `출입 허용 - ${userName}님`,
        user: userName,
        aiVerified: true
      };
      console.log('✅ 출입 허용 QR 코드:', result);
      return result;
    } else {
      const result = {
        status: 'rejected',
        message: `출입이 거부되었습니다 - ${userName}님`,
        user: userName,
        aiVerified: false
      };
      console.log('❌ 출입 거부 QR 코드:', result);
      return result;
    }
  };


  const toggleMode = () => {
    setUploadMode(!uploadMode);
    if (!uploadMode) {
      stopCamera(); // 파일 모드로 전환 시 카메라 정지
    } else {
      startCamera(); // 카메라 모드로 전환 시 카메라 시작
    }
  };

  const addToLog = async (result) => {
    // console.log(result)
    const logEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      user: result.user?.name || result.user || '알 수 없음',
      status: result.status,
      message: getLogMessage(result),
      aiVerified: result.aiVerified
    };
    
    // 화면에 표시할 로그 추가
    setAccessLog(prev => [logEntry, ...prev.slice(0, 9)]);
    
    // 서버에 출입 로그 기록
    await recordAccessLog(result);
  };

  const recordAccessLog = async (result) => {
    try {
      // 결과에서 사용자 정보 추출
      console.log('📊 로그 저장용 결과 분석:', result);
      
      let userId = 'UNKNOWN';
      let userName = '알 수 없음';
      let recordId = null;
      
      // result.user에서 정보 추출
      if (result.user) {
        console.log('👤 result.user 타입:', typeof result.user, result.user);
        
        if (typeof result.user === 'string') {
          // 문자열인 경우 (예: "김철수")
          userName = result.user;
        } else if (typeof result.user === 'object' && result.user !== null) {
          // 객체인 경우
          userId = result.user.employeeId || result.user.user_id || 'UNKNOWN';
          userName = result.user.name || result.user.user_name || result.user.userName || '알 수 없음';
          recordId = result.user.recordId || result.user.record_id || null;
          
          console.log('📝 추출된 정보:', { userId, userName, recordId });
        }
      }
      
      // userName이 여전히 객체인 경우 처리
      if (typeof userName === 'object') {
        console.warn('⚠️ userName이 객체입니다:', userName);
        userName = userName?.name || userName?.user_name || '알 수 없음';
      }

      // 출입 결과에 따른 action과 result 결정
      const action = 'entry'; // 기본적으로 입장 시도
      const accessResult = result.status === 'approved' ? 'success' : 'failed';
      
      const logData = {
        user_id: userId,
        user_name: userName,
        action: action,
        result: accessResult,
        qr_data: recordId,
        scanner_id: 'ADMIN_SCANNER'
      };

      console.log('📝 출입 로그 기록 데이터:', logData);

      const data = await authenticatedApiCall('/access-log', {
        method: 'POST',
        body: JSON.stringify(logData)
      });

      if (data.success) {
        console.log('✅ 출입 로그 기록 완료:', data.data?.log_id);
      } else {
        console.error('❌ 출입 로그 기록 실패:', data.error);
      }
    } catch (error) {
      console.error('❌ 출입 로그 기록 오류:', error);
    }
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

  const loadAccessLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('📊 출입 로그 조회 시작:', today);

      const data = await authenticatedApiCall(`/access-log?date=${today}&limit=20`, {
        method: 'GET'
      });

      console.log('✅ 출입 로그 조회 완료:', data.data);
      
      if (data.success && data.data.logs) {
        // API 응답을 화면 표시용으로 변환
        const displayLogs = data.data.logs.map((log, index) => ({
          id: index + 1,
          time: new Date(log.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          user: log.user_name,
          status: log.result === 'success' ? 'approved' : 'rejected',
          message: `${log.action === 'entry' ? '입장' : '퇴장'} ${log.result === 'success' ? '성공' : '실패'}`,
          logId: log.log_id,
          aiVerified: log.result === 'success'
        }));
        
        setAccessLog(displayLogs);
      } else {
        // 데이터가 없으면 빈 배열
        setAccessLog([]);
      }
    } catch (error) {
      console.error('❌ 출입 로그 조회 오류:', error);
      throw error;
    }
  };

  const clearScanResult = () => {
    setLastScanResult(null);
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

      {/* QR 스캐너 영역 - 결과가 없을 때만 표시 */}
      {!lastScanResult && (
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
      )}

      {/* 스캔 결과 표시 - 결과가 있을 때만 표시 */}
      {lastScanResult && (
        <div className="scanner-section">
          <div className="scan-result-container">
            <div className={`scan-result ${lastScanResult.status}`}>
              <div className="result-icon">
                {getStatusIcon(lastScanResult.status)}
              </div>
              <div className="result-content">
                <div className="result-message">{lastScanResult.message}</div>
                <div className="result-time">
                  {new Date().toLocaleString('ko-KR')}
                </div>
                {lastScanResult.aiVerified && (
                  <div className="ai-verified-badge">AI 검증 완료</div>
                )}
              </div>
            </div>
          </div>
          
          {/* 새 스캔 버튼 */}
          <div className="scanner-hint">
            <button onClick={clearScanResult} className="new-scan-button">
              🔄 새로운 스캔
            </button>
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
