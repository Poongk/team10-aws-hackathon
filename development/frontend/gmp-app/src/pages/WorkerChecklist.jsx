import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedApiCall } from '../config/api';
import AIAnalysisPopup from '../components/AIAnalysisPopup';
import './WorkerChecklist.css';

const WorkerChecklist = () => {
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showAIPopup, setShowAIPopup] = useState(false);
  const navigate = useNavigate();

  // 체크리스트 항목 정의
  const checklistItems = [
    {
      id: 'symptoms',
      question: '발열, 설사, 구토 등의 증상은 없는가?',
      type: 'basic',
      options: ['예', '아니오']
    },
    {
      id: 'respiratory',
      question: '호흡기 질환(기침, 재채기 등)은 없는가?',
      type: 'basic',
      options: ['예', '아니오']
    },
    {
      id: 'wounds',
      question: '신체 노출부위에 상처는 없는가?',
      type: 'ai_enabled',
      options: ['예', '아니오', '잘모르겠음']
    },
    {
      id: 'uniform',
      question: '복장은 깨끗하고 규정에 맞게 착용하였는가?',
      type: 'ai_disabled',
      options: ['예', '아니오', '잘모르겠음']
    },
    {
      id: 'accessories',
      question: '장신구(반지, 목걸이, 시계 등)를 착용하지 않았는가?',
      type: 'basic',
      options: ['예', '아니오']
    },
    {
      id: 'hair',
      question: '두발 및 수염은 깨끗하고 정돈되어 있는가?',
      type: 'ai_disabled',
      options: ['예', '아니오', '잘모르겠음']
    },
    {
      id: 'nails',
      question: '손톱은 짧고 깨끗하게 관리되어 있는가?',
      type: 'ai_disabled',
      options: ['예', '아니오', '잘모르겠음']
    },
    {
      id: 'makeup',
      question: '진한 화장이나 향수를 사용하지 않았는가?',
      type: 'ai_disabled',
      options: ['예', '아니오', '잘모르겠음']
    },
    {
      id: 'personal_items',
      question: '작업장에 개인 물품을 반입하지 않았는가?',
      type: 'basic',
      options: ['예', '아니오']
    }
  ];

  useEffect(() => {
    // 세션에서 사용자 정보 가져오기
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      setUser(JSON.parse(userSession));
    } else {
      navigate('/mvp/login');
    }

    // 페이지 이동 시 AI 팝업 닫기
    const handleBeforeUnload = () => {
      setShowAIPopup(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setShowAIPopup(false); // 컴포넌트 언마운트 시 팝업 닫기
    };
  }, [navigate]);

  const handleAnswerSelect = (itemId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: answer
    }));

    // AI 판별 트리거 (상처 항목에서 "잘모르겠음" 선택 시)
    if (itemId === 'wounds' && answer === '잘모르겠음') {
      setShowAIPopup(true);
    }
  };

  const handleAIResult = (itemId, result) => {
    // AI 분석 결과로 답변 자동 업데이트
    setAnswers(prev => ({
      ...prev,
      [itemId]: result
    }));
    setShowAIPopup(false);
  };

  const handleCloseAIPopup = () => {
    setShowAIPopup(false);
  };

  const getCompletedCount = () => {
    return Object.keys(answers).length;
  };

  const isAllCompleted = () => {
    return getCompletedCount() === checklistItems.length;
  };

  const handleSubmit = async () => {
    if (isAllCompleted()) {
      try {
        console.log('📤 체크리스트 제출 시작');
        
        // API로 체크리스트 제출
        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
          alert('로그인이 필요합니다.');
          navigate('/mvp/login');
          return;
        }

        const userData = JSON.parse(userSession);
        console.log('👤 사용자 데이터:', userData);
        console.log('📋 제출 데이터:', { user_id: userData.user_id, items: answers });

        const data = await authenticatedApiCall('/checklist', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userData.user_id,
            items: answers
          })
        });

        console.log('📊 API 응답 데이터:', data);
        
        if (data.success) {
          // record_id를 받아서 결과 화면으로 이동
          const recordId = data.data.record_id;
          console.log('✅ 제출 성공, record_id:', recordId);
          navigate(`/mvp/worker-result?recordId=${recordId}`);
        } else {
          console.error('❌ API 응답 실패:', data);
          throw new Error(data.error?.message || '제출 실패: 알 수 없는 오류');
        }
      } catch (error) {
        console.error('❌ 체크리스트 제출 오류:', error);
        
        // 사용자에게 오류 메시지 표시
        alert(`체크리스트 제출 중 오류가 발생했습니다:\n${error.message}\n\n다시 시도해주세요.`);
        
        // 오류 시에는 페이지 이동하지 않음
        return;
      }
    } else {
      alert('모든 항목을 완료해주세요.');
    }
  };

  const determineApproval = (answers) => {
    // 모든 답변이 '예'이거나 '잘모르겠음'이면 적합
    return Object.values(answers).every(answer => 
      answer === '예' || answer === '잘모르겠음'
    );
  };

  const handleBack = () => {
    navigate('/mvp/dashboard');
  };

  if (!user) {
    return (
      <div className="page-container worker-checklist">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container worker-checklist">
      {/* 헤더 */}
      <div className="checklist-header">
        <button onClick={handleBack} className="back-button">
          ← 뒤로
        </button>
        <h1>위생상태 점검</h1>
      </div>

      {/* 진행률 표시 */}
      <div className="progress-section">
        <div className="progress-info">
          <div className="progress-text">
            {getCompletedCount()}/{checklistItems.length} 완료
          </div>
          <div className="progress-percentage">
            {Math.round((getCompletedCount() / checklistItems.length) * 100)}%
          </div>
        </div>
        <div className="progress-bar">
          {checklistItems.map((_, index) => (
            <div
              key={index}
              className={`progress-segment ${index < getCompletedCount() ? 'completed' : ''}`}
            />
          ))}
        </div>
        <div className="progress-dots">
          {checklistItems.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index < getCompletedCount() ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* 체크리스트 항목들 */}
      <div className="checklist-items">
        {checklistItems.map((item, index) => (
          <div key={item.id} className="checklist-item">
            <div className="question-number">{index + 1}.</div>
            <div className="question-content">
              <h3 className="question-text">{item.question}</h3>
              <div className="options-container">
                {item.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(item.id, option)}
                    className={`option-button ${
                      answers[item.id] === option ? 'selected' : ''
                    } ${
                      item.type === 'ai_disabled' && option === '잘모르겠음' ? 'disabled' : ''
                    }`}
                    disabled={item.type === 'ai_disabled' && option === '잘모르겠음'}
                  >
                    {option}
                    {(item.type === 'ai_enabled' || item.type === 'ai_disabled') && option === '잘모르겠음' && (
                      <span className="ai-badge">AI</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 제출 버튼 */}
      <div className="submit-section">
        <button
          onClick={handleSubmit}
          disabled={!isAllCompleted()}
          className={`submit-button ${isAllCompleted() ? 'active' : 'disabled'}`}
        >
          제출하기
        </button>
      </div>
      {/* AI 분석 팝업 */}
      <AIAnalysisPopup
        isOpen={showAIPopup}
        onClose={handleCloseAIPopup}
        onResult={handleAIResult}
      />
    </div>
  );
};

export default WorkerChecklist;
