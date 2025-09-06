import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkerResults.css';

const WorkerResults = () => {
  const [user, setUser] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 세션에서 사용자 정보 가져오기
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      setUser(JSON.parse(userSession));
      loadResultHistory();
    } else {
      navigate('/mvp/login');
    }
  }, [navigate]);

  const loadResultHistory = async () => {
    // 실제로는 API에서 가져올 데이터, 현재는 localStorage + 더미 데이터
    const savedResult = localStorage.getItem('checklistResult');
    const mockResults = [
      {
        id: 4,
        date: '2025-09-06T08:30:00Z',
        status: 'approved',
        expireTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25분 후
        isExpired: false,
        aiVerified: true,
        userName: '이영희',
        userId: 'EMP002'
      },
      {
        id: 3,
        date: '2025-09-04T09:10:00Z',
        status: 'approved',
        expireTime: '2025-09-04T09:40:00Z',
        isExpired: true,
        aiVerified: false,
        userName: '박민수',
        userId: 'EMP003'
      },
      {
        id: 2,
        date: '2025-09-05T08:20:00Z',
        status: 'rejected',
        reason: '발열 증상 확인',
        isExpired: false,
        userName: '이영희',
        userId: 'EMP002'
      },
      {
        id: 1,
        date: '2025-09-06T08:15:00Z',
        status: 'approved',
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분 후
        isExpired: false,
        aiVerified: true,
        userName: '김철수',
        userId: 'EMP001'
      }
    ];

    // 저장된 결과가 있으면 최신 결과로 추가
    if (savedResult) {
      const result = JSON.parse(savedResult);
      const newResult = {
        id: Date.now(),
        date: result.timestamp,
        status: 'approved', // 임시로 적합 처리
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        isExpired: false,
        aiVerified: true,
        userName: user?.name || '김철수',
        userId: user?.user_id || 'EMP001'
      };
      // 최신 순으로 정렬 (새 결과를 맨 앞에)
      setResultHistory([newResult, ...mockResults.sort((a, b) => new Date(b.date) - new Date(a.date))]);
    } else {
      // 최신 순으로 정렬
      setResultHistory(mockResults.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  const handleViewResult = (result) => {
    // URL 파라미터로 판정 결과 화면에 데이터 전달
    const params = new URLSearchParams({
      user: result.userName,     // 각 결과의 사용자명
      userId: result.userId,     // 각 결과의 사용자ID
      approved: result.status === 'approved' ? 'true' : 'false',
      expired: result.isExpired ? 'true' : 'false'
    });
    
    navigate(`/mvp/result?${params.toString()}`);
  };

  const calculateTimeLeft = (expireTime) => {
    const now = new Date();
    const expire = new Date(expireTime);
    const diff = expire - now;
    
    if (diff <= 0) return '만료됨';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}분 ${seconds}초 남음`;
  };

  const expireQRCode = (resultId) => {
    // 만료시키기 기능 제거됨 - 사용하지 않음
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    navigate('/mvp/dashboard');
  };

  const handleNewChecklist = () => {
    navigate('/mvp/checklist');
  };

  if (!user) {
    return (
      <div className="page-container worker-results">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container worker-results">
      {/* 헤더 */}
      <div className="results-header">
        <button onClick={handleBack} className="back-button">
          ← 뒤로
        </button>
        <h1>결과 보기</h1>
      </div>

      {/* 제목 */}
      <div className="results-title">
        <h2>📊 최근 체크리스트 결과</h2>
      </div>

      {/* 결과 목록 */}
      {resultHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>아직 체크리스트 결과가 없습니다</h3>
          <p>첫 번째 위생상태 점검을 시작해보세요</p>
          <button onClick={handleNewChecklist} className="btn btn-primary">
            체크리스트 작성하기
          </button>
        </div>
      ) : (
        <div className="results-list">
          {resultHistory.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-header">
                <div className="result-date">{formatDate(result.date)}</div>
                <div className={`result-status ${result.status}`}>
                  {result.status === 'approved' ? '✅ 적합 판정' : '❌ 부적합 판정'}
                </div>
              </div>

              {result.status === 'approved' && (
                <div className="result-actions">
                  <button 
                    onClick={() => handleViewResult(result)}
                    className="view-result-button"
                  >
                    QR코드 확인
                  </button>
                </div>
              )}

              {result.status === 'rejected' && (
                <div className="rejection-info">
                  <div className="rejection-reason">사유: {result.reason}</div>
                  <div className="no-qr">QR 코드 없음</div>
                </div>
              )}

              {result.status === 'approved' && (
                <div className="result-status">
                  상태: {result.isExpired ? (
                    <span className="status-expired">만료됨</span>
                  ) : (
                    <span className="status-valid">유효함 ({calculateTimeLeft(result.expireTime)})</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="action-section">
        <button onClick={handleNewChecklist} className="new-checklist-button">
          새 체크리스트 작성
        </button>
      </div>
    </div>
  );
};

export default WorkerResults;
