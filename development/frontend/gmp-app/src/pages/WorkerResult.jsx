import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import './WorkerResult.css';

const WorkerResult = () => {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터에서 데이터 가져오기
    const userName = searchParams.get('user');
    const userId = searchParams.get('userId');
    const approved = searchParams.get('approved') === 'true';
    const expired = searchParams.get('expired') === 'true';

    if (userName && userId) {
      // URL 파라미터로 사용자 정보 설정
      const userData = {
        name: userName,
        user_id: userId,
        user_type: 'worker'
      };
      setUser(userData);

      // 판정 결과 설정
      if (approved) {
        setResult({
          judgment: 'approved',
          message: '위생상태 점검 완료!\n안전하게 작업하세요'
        });
        generateQRCode(userData, expired);
      } else {
        setResult({
          judgment: 'rejected',
          message: '건강상 이유로 오늘은\n출근이 어렵습니다'
        });
      }
    } else {
      // 파라미터가 없으면 기존 localStorage 방식 사용
      loadFromLocalStorage();
    }
  }, [searchParams, navigate]);

  const loadFromLocalStorage = () => {
    // 세션에서 사용자 정보 가져오기
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      setUser(JSON.parse(userSession));
    } else {
      navigate('/mvp/login');
      return;
    }

    // 체크리스트 결과 가져오기
    const checklistResult = localStorage.getItem('checklistResult');
    if (checklistResult) {
      const data = JSON.parse(checklistResult);
      const judgmentResult = determineResult(data.answers);
      setResult({
        ...data,
        judgment: judgmentResult.status,
        message: judgmentResult.message
      });

      // 적합 판정 시 QR 코드 생성
      if (judgmentResult.status === 'approved') {
        generateQRCode(JSON.parse(userSession), data.isExpired, data.expireTime);
      }
    } else {
      // 결과가 없으면 대시보드로
      navigate('/mvp/dashboard');
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
      
      const qrData = {
        name: userData.name,
        employeeId: userData.user_id,
        status: isActuallyExpired ? '만료됨' : '출입허용',
        checkTime: new Date().toLocaleString('ko-KR'),
        expireTime: actualExpireTime.toLocaleString('ko-KR')
      };

      const qrText = `${qrData.name} (${qrData.employeeId})\n${qrData.status}\n점검시간: ${qrData.checkTime}\n만료시간: ${qrData.expireTime}`;
      
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
