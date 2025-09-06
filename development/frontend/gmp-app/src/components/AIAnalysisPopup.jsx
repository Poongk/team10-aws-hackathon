import React, { useState, useRef, useEffect } from 'react';
import './AIAnalysisPopup.css';

const AIAnalysisPopup = ({ isOpen, onClose, onResult }) => {
  const [cameraState, setCameraState] = useState('ready'); // ready, loading, result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [uploadMode, setUploadMode] = useState(true); // 파일 업로드가 기본
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !uploadMode) {
      startCamera(); // 카메라 모드일 때만 카메라 시작
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, uploadMode]);

  // 페이지 이동 시 카메라 정지
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopCamera();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };

    const handlePageHide = () => {
      stopCamera();
    };

    // 페이지 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      // 정리
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      stopCamera();
    };
  }, []);

  // 컴포넌트 언마운트 시 카메라 정지
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      setAnalysisResult({
        result: 'error',
        message: '카메라 권한이 필요합니다',
        recommendation: '설정에서 카메라 권한을 허용해주세요'
      });
      setCameraState('result');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('카메라 트랙 정지:', track.kind);
      });
      setStream(null);
    }
    
    // 비디오 요소도 정리
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCameraState('loading');

    // 캔버스에 비디오 프레임 캡처
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 280;
    canvas.height = 280;
    ctx.drawImage(video, 0, 0, 280, 280);

    // 이미지를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      try {
        // 실제 AI 분석 API 호출
        const result = await analyzeWoundWithAI(blob);
        setAnalysisResult(result);
        setCameraState('result');
      } catch (error) {
        console.error('AI 분석 실패:', error);
        // 실패 시 기존 시뮬레이션 사용
        const mockResult = simulateAIAnalysis();
        setAnalysisResult(mockResult);
        setCameraState('result');
      }
    }, 'image/jpeg', 0.8);
  };

  const analyzeWoundWithAI = async (imageBlob) => {
    try {
      // 이미지를 base64로 변환
      const base64Data = await blobToBase64(imageBlob);
      
      // Hello World에서 검증된 실제 API 호출
      const response = await fetch('https://31cxzj6n06.execute-api.us-east-1.amazonaws.com/dev/ai/wound-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: JSON.parse(localStorage.getItem('user') || '{}').user_id || 'worker1',
          wound_location: 'hand', // 기본값, 필요시 사용자 선택으로 변경 가능
          image_base64: base64Data.split(',')[1] // data:image/jpeg;base64, 부분 제거
        })
      });

      if (!response.ok) {
        throw new Error('AI 분석 API 호출 실패');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'AI 분석 실패');
      }

      // API 응답을 우리 형식으로 변환
      const analysisData = data.data;
      const isApproved = !analysisData.requires_medical_attention && !analysisData.work_restriction;
      
      return {
        result: isApproved ? 'approved' : 'rejected',
        message: isApproved 
          ? `상처 크기가 ${analysisData.severity}이고 염증이 없어\n적합 판정됩니다`
          : `상처 심각도가 ${analysisData.severity}로\n부적합 판정됩니다`,
        recommendation: !isApproved 
          ? analysisData.recommendations?.[0] || '의료진 상담 후 재검사하시기 바랍니다'
          : null,
        confidence: analysisData.confidence || 0.95,
        aiAnalysis: analysisData // 원본 AI 분석 결과 보존
      };
    } catch (error) {
      console.error('실제 AI 분석 실패, 폴백 사용:', error);
      // 실패 시 폴백 시뮬레이션 사용
      return simulateAIAnalysis();
    }
  };

  // Blob을 Base64로 변환하는 헬퍼 함수
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const simulateAIAnalysis = () => {
    // 해커톤용 랜덤 결과 생성
    const isApproved = Math.random() > 0.3; // 70% 확률로 적합

    if (isApproved) {
      return {
        result: 'approved',
        message: '상처 크기가 작고 염증이 없어\n적합 판정됩니다',
        confidence: 0.95,
        aiAnalysis: null // 시뮬레이션임을 표시
      };
    } else {
      return {
        result: 'rejected',
        message: '상처에 염증이 확인되어\n부적합 판정됩니다',
        recommendation: '의료진 상담 후 재검사하시기 바랍니다',
        confidence: 0.92,
        aiAnalysis: null // 시뮬레이션임을 표시
      };
    }
  };

  const handleCancel = () => {
    // 카메라 강제 정지
    stopCamera();
    
    setCameraState('ready');
    setAnalysisResult(null);
  };

  const handleClose = () => {
    if (analysisResult && analysisResult.result !== 'error') {
      // 체크리스트 항목 자동 업데이트
      const answer = analysisResult.result === 'approved' ? '예' : '아니오';
      onResult('wounds', answer);
    }
    
    // 카메라 강제 정지
    stopCamera();
    
    // 상태 초기화
    setCameraState('ready');
    setAnalysisResult(null);
    setUploadMode(true); // 기본 모드로 리셋
    
    onClose();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setCameraState('loading');

    try {
      // 실제 AI 분석 API 호출
      const result = await analyzeWoundWithAI(file);
      setAnalysisResult(result);
      setCameraState('result');
    } catch (error) {
      console.error('AI 분석 실패:', error);
      // 실패 시 기존 시뮬레이션 사용
      const mockResult = simulateAIAnalysis();
      setAnalysisResult(mockResult);
      setCameraState('result');
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

  if (!isOpen) return null;

  return (
    <div className="ai-popup-overlay">
      <div className="ai-popup">
        {/* 헤더 */}
        <div className="ai-popup-header">
          <h3>AI 상처 판별</h3>
          <button onClick={handleClose} className="close-button">×</button>
        </div>

        {/* 콘텐츠 */}
        <div className="ai-popup-content">
          {/* 모드 전환 버튼 */}
          {cameraState === 'ready' && (
            <div className="mode-toggle">
              <button 
                onClick={toggleMode}
                className={`mode-button ${!uploadMode ? 'active' : ''}`}
              >
                📷 카메라 촬영
              </button>
              <button 
                onClick={toggleMode}
                className={`mode-button ${uploadMode ? 'active' : ''}`}
              >
                📁 파일 업로드
              </button>
            </div>
          )}

          {cameraState === 'ready' && !uploadMode && (
            <>
              <div className="camera-section">
                <div className="camera-viewfinder">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video"
                  />
                  <div className="camera-guide">
                    상처 부위를 화면 중앙에 맞춰주세요
                  </div>
                </div>
              </div>
              
              <div className="instruction-text">
                📷 상처 부위를 촬영해주세요
              </div>
              
              <button onClick={capturePhoto} className="capture-button">
                촬영하기
              </button>
            </>
          )}

          {cameraState === 'ready' && uploadMode && (
            <>
              <div className="upload-section">
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">상처 이미지 선택</div>
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
              
              <div className="instruction-text">
                📁 데모용: 손목, 팔 등의 상처를 사진으로 찍어보세요!
              </div>
            </>
          )}

          {cameraState === 'loading' && (
            <>
              <div className="loading-section">
                <div className="loading-icon">🔄</div>
                <div className="loading-text">AI 분석 중...</div>
                <div className="loading-subtext">잠시만 기다려주세요 (5-10초)</div>
              </div>
              
              <button onClick={handleCancel} className="cancel-button">
                취소
              </button>
            </>
          )}

          {cameraState === 'result' && analysisResult && (
            <>
              <div className="result-section">
                <div className={`result-icon ${analysisResult.result}`}>
                  {analysisResult.result === 'approved' ? '✅' : 
                   analysisResult.result === 'rejected' ? '❌' : '⚠️'}
                </div>
                <div className="result-title">
                  {analysisResult.result === 'error' ? '오류 발생' : '분석 완료'}
                </div>
                
                {/* Bedrock Vision 사용 여부 표시 */}
                <div className="analysis-method" style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '10px',
                  padding: '4px 8px',
                  backgroundColor: analysisResult.aiAnalysis ? '#e8f5e8' : '#fff3cd',
                  borderRadius: '4px',
                  border: `1px solid ${analysisResult.aiAnalysis ? '#28a745' : '#ffc107'}`
                }}>
                  {analysisResult.aiAnalysis ? 
                    '🤖 Amazon Bedrock Vision 분석' : 
                    '🔄 시뮬레이션 분석'
                  }
                </div>
                
                <div className="result-message">
                  {analysisResult.message.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                {analysisResult.recommendation && (
                  <div className="result-recommendation">
                    {analysisResult.recommendation}
                  </div>
                )}
                
                {/* 신뢰도 표시 */}
                <div className="confidence-display" style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  신뢰도: {(analysisResult.confidence * 100).toFixed(1)}%
                </div>
              </div>
              
              <button onClick={handleClose} className="close-result-button">
                닫음
              </button>
            </>
          )}
        </div>

        {/* 숨겨진 캔버스 (이미지 캡처용) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default AIAnalysisPopup;
