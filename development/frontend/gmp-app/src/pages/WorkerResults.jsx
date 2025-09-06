import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedApiCall } from '../config/api';
import './WorkerResults.css';

const WorkerResults = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 세션에서 사용자 정보 가져오기
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const userData = JSON.parse(userSession);
      setUser(userData);
      fetchChecklistResults(userData.user_id, userData.session_token);
    } else {
      navigate('/mvp/login');
    }
  }, [navigate]);

  const fetchChecklistResults = async (userId, token) => {
    try {
      setLoading(true);
      const data = await authenticatedApiCall(`/checklist/${userId}?limit=10`, {
        method: 'GET'
      });

      console.log('📊 API 응답 데이터:', data);
      
      if (data.success) {
        // API 응답 구조 확인 - data.data가 배열일 수도 있음
        const results = Array.isArray(data.data) ? data.data : (data.data?.results || []);
        
        if (Array.isArray(results)) {
          // API 응답을 기존 형식에 맞게 변환
          const transformedResults = results.map((result, index) => ({
            id: index + 1,
            recordId: result.record_id || result.check_id,  // record_id 또는 check_id 사용
            user: user?.name || '사용자',
            userId: user?.user_id,
            date: formatDate(result.check_time),
            time: formatTime(result.check_time),
            status: result.status,
            approved: result.status === 'approved',
            expired: result.is_expired,
            qrCode: result.qr_code,
            expireTime: result.expire_time,
            aiVerified: result.ai_verified,
            reason: result.reason
          }));
          
          setResults(transformedResults);
        } else {
          console.error('❌ results가 배열이 아님:', results);
          setResults([]);
          setError('데이터 형식이 올바르지 않습니다');
        }
      } else {
        console.error('❌ API 응답 실패:', data);
        setResults([]);
        setError(data.error?.message || '데이터 조회 실패');
      }
    } catch (err) {
      console.error('체크리스트 조회 오류:', err);
      setError(err.message);
      
      // 에러 시 더미 데이터 사용 (개발용)
      setResults([
        {
          id: 1,
          recordId: `${user?.user_id || 'EMP001'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 5).replace(':', '')}`,
          user: user?.name || '김철수',
          userId: user?.user_id || 'EMP001',
          date: '2025-09-06',
          time: '08:15',
          status: 'approved',
          approved: true,
          expired: false,
          qrCode: 'sample_qr_code',
          expireTime: '2025-09-06T08:45:00Z',
          aiVerified: true,
          reason: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5);
  };

  const handleResultClick = (result) => {
    navigate(`/mvp/worker-result?recordId=${result.recordId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/mvp/dashboard');
  };

  if (loading) {
    return (
      <div className="worker-results">
        <div className="results-header">
          <h1>📊 결과 보기</h1>
        </div>
        <div className="loading-message">
          <p>체크리스트 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-results">
      <div className="results-header">
        <h1>📊 결과 보기</h1>
        <p className="user-info">
          {user?.name} ({user?.user_id})님의 체크리스트 결과
        </p>
        {error && (
          <div className="error-notice">
            ⚠️ API 연결 오류: {error} (더미 데이터 표시 중)
          </div>
        )}
      </div>

      <div className="results-list">
        {results.length === 0 ? (
          <div className="no-results">
            <p>📋 아직 체크리스트 결과가 없습니다</p>
            <button onClick={() => navigate('/mvp/checklist')} className="create-checklist-btn">
              체크리스트 작성하기
            </button>
          </div>
        ) : (
          results.map((result) => (
            <div 
              key={result.id} 
              className={`result-item ${result.expired ? 'expired' : ''}`}
              onClick={() => handleResultClick(result)}
            >
              <div className="result-header">
                <div className="result-info">
                  <span className="result-date">{result.date}</span>
                  <span className="result-time">{result.time}</span>
                </div>
                <div className={`result-status ${result.approved ? 'approved' : 'rejected'}`}>
                  {result.approved ? '✅ 적합' : '❌ 부적합'}
                </div>
              </div>
              
              <div className="result-details">
                <div className="result-badges">
                  {result.aiVerified && (
                    <span className="ai-badge">🤖 AI 검증</span>
                  )}
                  {result.expired && (
                    <span className="expired-badge">⏰ 만료됨</span>
                  )}
                </div>
                
                {result.reason && (
                  <div className="result-reason">
                    <strong>부적합 사유:</strong> {result.reason}
                  </div>
                )}
              </div>
              
              <div className="result-arrow">→</div>
            </div>
          ))
        )}
      </div>

      <div className="results-actions">
        <button onClick={handleBackToDashboard} className="back-button">
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default WorkerResults;
