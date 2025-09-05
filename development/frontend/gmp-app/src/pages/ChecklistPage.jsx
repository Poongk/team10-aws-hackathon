import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ChecklistPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    temperature: '',
    symptoms: '',
    clothing: '',
    hygiene: '',
    accessories: '',
    hair: '',
    hands: '',
    shoes: '',
    mask: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // 체크리스트 데이터 검증
    const requiredFields = Object.keys(formData)
    const isComplete = requiredFields.every(field => formData[field] !== '')
    
    if (!isComplete) {
      alert('모든 항목을 입력해주세요.')
      setIsSubmitting(false)
      return
    }

    // AI 판정 시뮬레이션 (2초 지연)
    setTimeout(() => {
      navigate('/result', { state: { checklistData: formData } })
    }, 2000)
  }

  const checklistItems = [
    { id: 'temperature', label: '체온 측정', placeholder: '36.5도', type: 'number' },
    { id: 'symptoms', label: '증상 여부', options: ['없음', '발열', '기침', '설사', '구토'] },
    { id: 'clothing', label: '복장 상태', options: ['적절', '부적절'] },
    { id: 'hygiene', label: '위생 상태', options: ['양호', '보통', '불량'] },
    { id: 'accessories', label: '장신구 착용', options: ['없음', '시계', '반지', '목걸이', '기타'] },
    { id: 'hair', label: '두발 정리', options: ['정리됨', '미정리'] },
    { id: 'hands', label: '손 청결도', options: ['청결', '보통', '불결'] },
    { id: 'shoes', label: '신발 상태', options: ['청결', '보통', '오염'] },
    { id: 'mask', label: '마스크 착용', options: ['착용', '미착용', '부적절'] }
  ]

  if (isSubmitting) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
          <h2>AI 판정 중...</h2>
          <p>체크리스트를 분석하고 있습니다</p>
          <div style={{ margin: '20px 0' }}>
            <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: '#1890ff', animation: 'loading 2s ease-in-out' }}></div>
            </div>
          </div>
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
        <h2>📋 위생상태점검</h2>
        <span>🏠</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>👤 김작업님 (생산팀A)</h3>
        <p>📅 2025-09-05 21:37</p>
      </div>

      <div className="card">
        <h3>📝 체크리스트 (9개 항목)</h3>
        
        {checklistItems.map((item, index) => (
          <div key={item.id} style={{ marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              {index + 1}. {item.label}
            </label>
            
            {item.type === 'number' ? (
              <input
                type="number"
                step="0.1"
                placeholder={item.placeholder}
                value={formData[item.id]}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <select
                value={formData[item.id]}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">선택해주세요</option>
                {item.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}

        <div style={{ marginTop: '30px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            🤖 AI 판정 요청
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c', textAlign: 'center' }}>
          💡 모든 항목을 정확히 입력해주세요
        </div>
      </div>
    </div>
  )
}

export default ChecklistPage
