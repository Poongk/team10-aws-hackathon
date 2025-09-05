import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NonCompliancePage() {
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('조치대기')
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('긴급순')

  const [nonComplianceList, setNonComplianceList] = useState([
    {
      id: 1,
      name: '이작업',
      empId: 'EMP003',
      team: '생산팀C',
      status: 'rejected',
      time: '08:15',
      symptoms: '발열/설사/구토 증상 감지',
      aiConfidence: 98,
      phone: '010-1111-3333',
      temp: '38.2°C',
      priority: 'high',
      actionReason: '발열 38.2도로 즉시 귀가 조치',
      actionContent: '1. 즉시 귀가 조치\n2. 의료진 상담 후 진단서 제출\n3. 증상 완화 확인 후 재검토 예정',
      reviewDate: '2025-09-06',
      reviewTime: '08:00'
    },
    {
      id: 2,
      name: '박품질',
      empId: 'EMP007',
      team: '품질팀',
      status: 'review',
      time: '08:30',
      symptoms: '체온 미세 상승 감지',
      aiConfidence: 75,
      phone: '010-2222-7777',
      temp: '37.1°C',
      priority: 'medium',
      actionReason: '',
      actionContent: '',
      reviewDate: '',
      reviewTime: ''
    },
    {
      id: 3,
      name: '최안전',
      empId: 'EMP012',
      team: '안전팀',
      status: 'rejected',
      time: '08:45',
      symptoms: '위생상태 부적합',
      aiConfidence: 92,
      phone: '010-3333-1212',
      temp: '36.5°C',
      priority: 'high',
      actionReason: '',
      actionContent: '',
      reviewDate: '',
      reviewTime: ''
    }
  ])

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    actionReason: '',
    actionContent: '',
    reviewDate: '',
    reviewTime: ''
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'rejected': return '#f5222d'
      case 'review': return '#faad14'
      case 'approved': return '#52c41a'
      default: return '#8c8c8c'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'rejected': return '거부 🚫'
      case 'review': return '재확인 ⚠️'
      case 'approved': return '승인 ✅'
      default: return '알 수 없음'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f5222d'
      case 'medium': return '#faad14'
      case 'low': return '#52c41a'
      default: return '#8c8c8c'
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      actionReason: item.actionReason,
      actionContent: item.actionContent,
      reviewDate: item.reviewDate,
      reviewTime: item.reviewTime
    })
  }

  const handleSave = (id) => {
    setNonComplianceList(prev => prev.map(item => 
      item.id === id ? { ...item, ...editForm } : item
    ))
    setEditingId(null)
    alert('조치 내용이 저장되었습니다.')
  }

  const handleSubmitToManager = (id) => {
    if (confirm('책임자에게 승인 요청을 보내시겠습니까?')) {
      alert('책임자에게 승인 요청이 전송되었습니다.')
    }
  }

  const handleCall = (phone) => {
    alert(`${phone}로 전화를 겁니다.`)
  }

  const filteredList = nonComplianceList.filter(item => {
    if (selectedFilter === '전체') return true
    if (selectedFilter === '거부') return item.status === 'rejected'
    if (selectedFilter === '재확인') return item.status === 'review'
    return true
  })

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>🚨 부적합자 조치 관리</h2>
        <span>👤 박운영님</span>
      </div>

      {/* 빠른 메뉴 */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px', 
        background: '#f5f5f5', 
        borderRadius: '8px', 
        padding: '4px',
        fontSize: '11px',
        overflowX: 'auto'
      }}>
        {['조치대기', '진행중', '완료', '승인대기', '거부', '전체이력'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '6px 4px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '10px',
              background: activeTab === tab ? '#1890ff' : 'transparent',
              color: activeTab === tab ? 'white' : '#666',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 필터 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['전체', '거부', '재확인'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '10px',
                background: selectedFilter === filter ? '#1890ff' : 'white',
                color: selectedFilter === filter ? 'white' : '#666'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ fontSize: '10px', padding: '4px' }}
        >
          <option value="긴급순">긴급순</option>
          <option value="시간순">시간순</option>
          <option value="팀순">팀순</option>
        </select>
      </div>

      {/* 조치 대기 목록 */}
      <div className="card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
          🔴 조치 대기 ({filteredList.length}명)
        </h3>

        {filteredList.map(item => (
          <div key={item.id} style={{
            border: `2px solid ${getPriorityColor(item.priority)}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            background: item.priority === 'high' ? '#fff2f0' : '#fafafa'
          }}>
            {/* 기본 정보 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  👤 {item.name} ({item.empId})
                </span>
                <span style={{ fontSize: '12px', marginLeft: '8px', color: '#666' }}>
                  {item.team}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: getStatusColor(item.status),
                  fontWeight: 'bold'
                }}>
                  {getStatusText(item.status)}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>⏰ {item.time}</div>
              </div>
            </div>

            {/* 증상 정보 */}
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              <div>📋 {item.symptoms}</div>
              <div style={{ color: '#666' }}>
                🤖 AI 신뢰도: {item.aiConfidence}% | 📞 {item.phone} | 🌡️ {item.temp}
              </div>
            </div>

            {/* 조치 입력 폼 */}
            {editingId === item.id ? (
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    📝 조치 사유:
                  </label>
                  <textarea
                    value={editForm.actionReason}
                    onChange={(e) => setEditForm(prev => ({ ...prev, actionReason: e.target.value }))}
                    style={{ 
                      width: '100%', 
                      height: '40px', 
                      fontSize: '11px', 
                      padding: '4px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px'
                    }}
                    placeholder="조치 사유를 입력하세요"
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    📋 조치 내용:
                  </label>
                  <textarea
                    value={editForm.actionContent}
                    onChange={(e) => setEditForm(prev => ({ ...prev, actionContent: e.target.value }))}
                    style={{ 
                      width: '100%', 
                      height: '60px', 
                      fontSize: '11px', 
                      padding: '4px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px'
                    }}
                    placeholder="구체적인 조치 내용을 입력하세요"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      📅 재검토 일정:
                    </label>
                    <input
                      type="date"
                      value={editForm.reviewDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, reviewDate: e.target.value }))}
                      style={{ width: '100%', fontSize: '11px', padding: '4px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      ⏰ 시간:
                    </label>
                    <input
                      type="time"
                      value={editForm.reviewTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, reviewTime: e.target.value }))}
                      style={{ width: '100%', fontSize: '11px', padding: '4px' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              item.actionReason && (
                <div style={{ background: 'white', padding: '8px', borderRadius: '6px', marginBottom: '8px', fontSize: '11px' }}>
                  <div><strong>📝 조치 사유:</strong> {item.actionReason}</div>
                  {item.actionContent && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>📋 조치 내용:</strong>
                      <div style={{ whiteSpace: 'pre-line', marginTop: '2px' }}>{item.actionContent}</div>
                    </div>
                  )}
                  {item.reviewDate && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>📅 재검토 일정:</strong> {item.reviewDate} {item.reviewTime}
                    </div>
                  )}
                </div>
              )
            )}

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
              <button 
                style={{ 
                  padding: '6px 8px', 
                  border: 'none', 
                  borderRadius: '4px',
                  background: '#1890ff',
                  color: 'white'
                }}
                onClick={() => handleCall(item.phone)}
              >
                📞 연락
              </button>
              
              {editingId === item.id ? (
                <>
                  <button 
                    style={{ 
                      padding: '6px 8px', 
                      border: 'none', 
                      borderRadius: '4px',
                      background: '#52c41a',
                      color: 'white'
                    }}
                    onClick={() => handleSave(item.id)}
                  >
                    💾 저장
                  </button>
                  <button 
                    style={{ 
                      padding: '6px 8px', 
                      border: 'none', 
                      borderRadius: '4px',
                      background: '#8c8c8c',
                      color: 'white'
                    }}
                    onClick={() => setEditingId(null)}
                  >
                    ❌ 취소
                  </button>
                </>
              ) : (
                <>
                  <button 
                    style={{ 
                      padding: '6px 8px', 
                      border: 'none', 
                      borderRadius: '4px',
                      background: '#faad14',
                      color: 'white'
                    }}
                    onClick={() => handleEdit(item)}
                  >
                    ✏️ 편집
                  </button>
                  {item.actionReason && (
                    <button 
                      style={{ 
                        padding: '6px 8px', 
                        border: 'none', 
                        borderRadius: '4px',
                        background: '#722ed1',
                        color: 'white'
                      }}
                      onClick={() => handleSubmitToManager(item.id)}
                    >
                      📤 책임자 승인요청
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 여백 */}
      <div style={{ height: '40px' }}></div>
    </div>
  )
}

export default NonCompliancePage
