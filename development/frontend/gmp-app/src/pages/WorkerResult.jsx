import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiCall } from '../config/api';
import QRCode from 'qrcode';
import './WorkerResult.css';

const WorkerResult = () => {
  console.log('🎯 WorkerResult 컴포넌트 렌더링 시작');
  
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log('🔍 현재 searchParams:', searchParams.toString());

  useEffect(() => {
    console.log('🚀 WorkerResult 컴포넌트 마운트됨');
    console.log('🔗 현재 URL:', window.location.href);
    
    // URL 파라미터에서 record_id만 가져오기
    const recordId = searchParams.get('recordId');
    
    console.log('📋 판정결과 record_id:', recordId);
    console.log('📋 모든 URL 파라미터:', Object.fromEntries(searchParams));

    if (recordId) {
      // record_id로 상세 정보 조회
      fetchChecklistDetail(recordId);
    } else {
      console.log('❌ recordId가 없음, 결과 페이지로 이동');
      navigate('/mvp/results');
    }
  }, [searchParams, navigate]);

  const fetchChecklistDetail = async (recordId) => {
    try {
      console.log('🔍 체크리스트 상세 조회 시작:', recordId);
      
      // 실제 API 연동
      const userSession = localStorage.getItem('userSession');
      const userData = userSession ? JSON.parse(userSession) : null;
      
      if (!userData?.session_token) {
        console.log('⚠️ 토큰 없음');
        alert('로그인이 필요합니다.');
        navigate('/mvp/login');
        return;
      }

      const data = await apiCall(`/checklist/detail/${recordId}`, {
        method: 'GET'
      });

      console.log('📊 API 응답:', data);
      
      if (data.success) {
        const detail = data.data;
        
        setUser({
          name: detail.user_name,
          user_id: detail.user_id
        });
        
        if (detail.status === 'approved') {
          setResult({
            record_id: detail.record_id,
            judgment: 'approved',
            message: detail.message || '위생상태 점검 완료!\n안전하게 작업하세요',
            items: detail.items,
            aiAnalysis: detail.ai_analysis,
            expireTime: detail.expire_time
          });

          generateQRCode({ record_id: detail.record_id }, false, detail.expire_time);
          
        } else {
          setResult({
            checkId: detail.record_id,
            judgment: 'rejected',
            message: detail.message || '건강상 이유로 오늘은\n출근이 어렵습니다',
            items: detail.items,
            reason: detail.reason
          });
        }
      } else {
        throw new Error(data.error?.message || 'API 응답 오류');
      }
    } catch (error) {
      console.error('❌ 체크리스트 상세 조회 오류:', error);
      alert(`데이터를 불러올 수 없습니다:\n${error.message}`);
    }
  };

  useEffect(() => {
    // 적합 판정일 때만 타이머 실행
    if (result?.judgment === 'approved') {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [result]);

  const generateQRCode = async (userData, isExpired = false, expireTime = null) => {
    try {
      const currentTime = new Date();
      const actualExpireTime = expireTime ? new Date(expireTime) : new Date(Date.now() + 30 * 60 * 1000);
      const isActuallyExpired = isExpired || currentTime > actualExpireTime;
      
      // record_id 기반 QR 코드 데이터
      const qrData = {
        record_id: userData?.record_id
      };

      console.log('🔗 QR 코드 데이터:', qrData);

      // JSON 형태로 QR 코드 생성 (스캐너에서 파싱 가능)
      const qrText = JSON.stringify(qrData);
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      
      // 만료된 QR인 경우 타이머를 0으로 설정
      if (isActuallyExpired) {
        setTimeLeft(0);
      } else if (expireTime) {
        const remainingTime = Math.max(0, Math.floor((actualExpireTime - currentTime) / 1000));
        setTimeLeft(remainingTime);
      }
      
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
    }
  };

  const determineResult = (answers) => {
    // 부적합 항목 체크
    const rejectionReasons = [];
    
    if (answers.symptoms === '아니오') {
      rejectionReasons.push('발열/설사/구토 증상');
    }
    if (answers.respiratory === '아니오') {
      rejectionReasons.push('호흡기 질환');
    }
    if (answers.wounds === '아니오') {
      rejectionReasons.push('신체 상처');
    }
    if (answers.uniform === '아니오') {
      rejectionReasons.push('복장 상태');
    }
    if (answers.accessories === '아니오') {
      rejectionReasons.push('장신구 착용');
    }
    if (answers.hair === '아니오') {
      rejectionReasons.push('두발 상태');
    }
    if (answers.nails === '아니오') {
      rejectionReasons.push('손톱 상태');
    }
    if (answers.makeup === '아니오') {
      rejectionReasons.push('화장 상태');
    }
    if (answers.personal_items === '아니오') {
      rejectionReasons.push('개인 물품');
    }

    if (rejectionReasons.length === 0) {
      return {
        status: 'approved',
        message: '위생상태 점검 완료!\n안전하게 작업하세요'
      };
    } else {
      return {
        status: 'rejected',
        message: getRejectMessage(rejectionReasons[0])
      };
    }
  };

  const getRejectMessage = (reason) => {
    const messages = {
      '발열/설사/구토 증상': '충분한 휴식 후 내일 다시 체크해주세요 🏠',
      '호흡기 질환': '호흡기 증상이 있습니다.\n충분한 휴식을 취하세요',
      '신체 상처': '🏥 보건실에서 상담 받으신 후 출입해주세요',
      '복장 상태': '작업복 상태를 다시 확인해주세요 👔',
      '장신구 착용': '장신구를 제거한 후 다시 체크해주세요',
      '두발 상태': '두발 상태를 정리한 후 다시 체크해주세요',
      '손톱 상태': '손톱을 깨끗이 한 후 다시 체크해주세요',
      '화장 상태': '화장을 연하게 한 후 다시 체크해주세요',
      '개인 물품': '작업용 이외의 물품을 제거해주세요'
    };
    
    return messages[reason] || '건강상 이유로 오늘은\n출근이 어렵습니다';
  };

  const getItemLabel = (key) => {
    const labels = {
      symptoms: '발열/설사/구토 증상',
      respiratory: '호흡기 증상',
      wounds: '상처 상태',
      uniform: '작업복 착용',
      accessories: '액세서리 제거',
      hair: '모발 정리',
      nails: '손톱 정리',
      makeup: '화장품 제거',
      personal_items: '개인 소지품 정리'
    };
    return labels[key] || key;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초 남음`;
  };

  const handleBack = () => {
    navigate('/mvp/checklist');
  };

  const handleQRView = () => {
    navigate('/mvp/results');
  };

  const handleRetry = () => {
    // 기존 결과 삭제 후 재검사
    localStorage.removeItem('checklistResult');
    navigate('/mvp/checklist');
  };

  const handleDashboard = () => {
    navigate('/mvp/dashboard');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    // 파일명 구성 요소
    const userName = user?.name || 'user';
    const date = new Date().toISOString().slice(0, 10);
    const status = result.judgment === 'approved' ? '적합' : '부적합';
    const expiredStatus = timeLeft === 0 ? '만료' : '유효';
    
    // QR 코드 이미지를 다운로드
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_${userName}_${status}_${expiredStatus}_${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !result) {
    return (
      <div className="page-container worker-result">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container worker-result">
      {/* 헤더 */}
      <div className="result-header">
        <button onClick={handleBack} className="back-button">
          ← 뒤로
        </button>
        <h1>판정 결과</h1>
      </div>

      {/* 결과 표시 영역 */}
      <div className={`result-content ${result.judgment}`}>
        {/* 결과 아이콘 */}
        <div className="result-icon">
          {result.judgment === 'approved' ? '✅' : '❌'}
        </div>

        {/* 결과 메시지 */}
        <div className="result-message">
          {result.message.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>

        {/* 적합 판정 시 QR 코드 */}
        {result.judgment === 'approved' && qrCodeUrl && (
          <div className="qr-section">
            <div className={`qr-container ${timeLeft === 0 ? 'expired' : ''}`}>
              <img src={qrCodeUrl} alt="QR Code" className="qr-image" />
              {timeLeft === 0 && (
                <div className="expired-overlay">만료됨</div>
              )}
              
              {/* QR 다운로드 버튼 */}
              <button onClick={downloadQRCode} className="qr-download-button" title="QR 코드 저장">
                💾 저장
              </button>
            </div>
            <div className={`timer ${timeLeft <= 300 ? 'warning' : ''}`}>
              {timeLeft === 0 ? '만료됨' : `유효시간: ${formatTime(timeLeft)}`}
            </div>
          </div>
        )}

        {/* 체크리스트 상세 정보 */}
        {result.items && (
          <div className="checklist-details">
            <h3>📋 체크리스트 결과</h3>
            <div className="items-grid">
              {Object.entries(result.items).map(([key, value]) => (
                <div key={key} className={`item ${value === '아니오' ? 'negative' : 'positive'}`}>
                  <span className="item-label">{getItemLabel(key)}</span>
                  <span className="item-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {/* AI 분석 결과 */}
        {result.aiAnalysis && (
          <div className="ai-analysis">
            <h3>🤖 AI 분석 결과</h3>
            <div className="ai-content">
              <div className={`ai-result ${result.aiAnalysis.result}`}>
                {result.aiAnalysis.result === 'approved' ? '✅ 적합' : '❌ 부적합'}
              </div>
              <div className="ai-confidence">
                신뢰도: {Math.round(result.aiAnalysis.confidence * 100)}%
              </div>
              <div className="ai-message">
                {result.aiAnalysis.message}
              </div>
            </div>
          </div>
        )}

        {/* 부적합 판정 시 안내 카드 */}
        {result.judgment === 'rejected' && (
          <div className="guidance-card">
            <div className="guidance-icon">🏥</div>
            <div className="guidance-text">
              <div>보건실에서 상담 받으신</div>
              <div>후 출입해주세요</div>
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 영역 */}
      <div className="action-section">
        {result.judgment === 'approved' ? (
          <>
            <button onClick={handleDashboard} className="btn btn-secondary">
              대시보드로 돌아가기
            </button>
          </>
        ) : (
          <>
            <button onClick={handleRetry} className="btn btn-primary">
              재검사하기
            </button>
            <button onClick={handleDashboard} className="btn btn-secondary">
              대시보드로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerResult;
