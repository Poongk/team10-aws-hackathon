import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function TeamStatusPage() {
  const navigate = useNavigate()
  
  const [teamStats, setTeamStats] = useState({
    teamName: '생산팀C',
    manager: '이책임',
    totalMembers: 20,
    completed: 12,
    completionRate: 60,
    timeLeft: 8, // 마감까지 남은 시간(분)
    rejected: 1,
    review: 2,
    pending: 5
  })

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: '김작업', status: 'completed', time: '08:45', temp: '36.2°C', risk: 'low' },
    { id: 2, name: '박제조', status: 'completed', time: '08:50', temp: '36.4°C', risk: 'low' },
    { id: 3, name: '이생산', status: 'rejected', time: '09:15', temp: '37.8°C', risk: 'high', reason: '발열' },
    { id: 4, name: '최품질', status: 'review', time: '09:20', temp: '36.9°C', risk: 'medium', reason: '재확인 필요' },
    { id: 5, name: '정안전', status: 'review', time: '09:25', temp: '36.7°C', risk: 'medium', reason: '증상 의심' },
    { id: 6, name: '강관리', status: 'pending', time: '-', temp: '-', risk: 'medium' },
    { id: 7, name: '조운영', status: 'pending', time: '-', temp: '-', risk: 'medium' },
    { id: 8, name: '윤검사', status: 'pending', time: '-', temp: '-', risk: 'medium' }
  ])

  const [activeTab, setActiveTab] = useState('현황')

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#52c41a'
      case 'rejected': return '#f5222d'
      case 'review': return '#faad14'
      case 'pending': return '#8c8c8c'
      default: return '#8c8c8c'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료 ✅'
      case 'rejected': return '거부 🚫'
      case 'review': return '재확인 ⚠️'
      case 'pending': return '미완료 ⏰'
      default: return '알 수 없음'
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#f5222d'
      case 'medium': return '#faad14'
      case 'low': return '#52c41a'
      default: return '#8c8c8c'
    }
  }

  const handleMemberAction = (member, action) => {
    if (action === 'call') {
      alert(`${member.name}님에게 전화를 겁니다.`)
    } else if (action === 'message') {
      alert(`${member.name}님에게 메시지를 보냅니다.`)
    } else if (action === 'approve') {
      alert(`${member.name}님의 재확인 요청을 승인합니다.`)
    }
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>🏢 {teamStats.teamName} 현황</h2>
        <span>👤 {teamStats.manager}</span>
      </div>

      {/* 빠른 메뉴 */}
      <div style={{ display: 'flex', marginBottom: '20px', background: '#f5f5f5', borderRadius: '8px', padding: '4px' }}>
        {['현황', '승인', '소통', '설정'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              background: activeTab === tab ? '#1890ff' : 'transparent',
              color: activeTab === tab ? 'white' : '#666'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '현황' && (
        <>
          {/* 오늘 현황 */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>📊 오늘 현황 (09-05)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f6ffed', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {teamStats.completed}/{teamStats.totalMembers}명
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>완료율 {teamStats.completionRate}%</div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: '#f0f0f0', 
                  borderRadius: '3px', 
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${teamStats.completionRate}%`,
                    height: '100%',
                    background: '#52c41a',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '16px', background: '#fff2f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                  {teamStats.timeLeft}분
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>마감까지</div>
                <div style={{ fontSize: '10px', color: '#f5222d', marginTop: '4px' }}>
                  🔴 긴급
                </div>
              </div>
            </div>

            {/* 위험 현황 */}
            <div style={{ padding: '12px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🚨 위험 현황</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>거부: {teamStats.rejected}명 🚫</div>
                <div>재확인: {teamStats.review}명 ⚠️</div>
                <div>미완료: {teamStats.pending}명 ⏰</div>
              </div>
              <button 
                className="btn btn-warning" 
                style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '6px' }}
                onClick={() => alert('팀원들에게 긴급 알림을 발송합니다.')}
              >
                📞 즉시 연락 필요
              </button>
            </div>
          </div>

          {/* 팀원 현황 */}
          <div className="card">
            <h3>👥 팀원 현황</h3>
            
            {/* 긴급 상황 팀원 */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', color: '#f5222d', marginBottom: '8px' }}>🔴 긴급 (3명)</h4>
              {teamMembers.filter(m => m.status === 'rejected' || m.status === 'review').map(member => (
                <div key={member.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '4px',
                  background: member.status === 'rejected' ? '#fff2f0' : '#fffbe6',
                  borderRadius: '6px',
                  border: `1px solid ${member.status === 'rejected' ? '#ffccc7' : '#ffe58f'}`
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{member.name}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {member.time} | {member.temp} | {member.reason}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '10px', 
                        border: 'none', 
                        borderRadius: '4px',
                        background: '#1890ff',
                        color: 'white'
                      }}
                      onClick={() => handleMemberAction(member, 'call')}
                    >
                      📞
                    </button>
                    {member.status === 'review' && (
                      <button 
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '10px', 
                          border: 'none', 
                          borderRadius: '4px',
                          background: '#52c41a',
                          color: 'white'
                        }}
                        onClick={() => handleMemberAction(member, 'approve')}
                      >
                        ✅
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 완료된 팀원 */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', color: '#52c41a', marginBottom: '8px' }}>✅ 완료 ({teamMembers.filter(m => m.status === 'completed').length}명)</h4>
              {teamMembers.filter(m => m.status === 'completed').map(member => (
                <div key={member.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  marginBottom: '2px',
                  background: '#f6ffed',
                  borderRadius: '4px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px' }}>{member.name}</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
                      {member.time} | {member.temp}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#52c41a' }}>✅</span>
                </div>
              ))}
            </div>

            {/* 미완료 팀원 */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>⏰ 미완료 ({teamMembers.filter(m => m.status === 'pending').length}명)</h4>
              {teamMembers.filter(m => m.status === 'pending').map(member => (
                <div key={member.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  marginBottom: '2px',
                  background: '#fafafa',
                  borderRadius: '4px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px' }}>{member.name}</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
                      미완료
                    </span>
                  </div>
                  <button 
                    style={{ 
                      padding: '2px 6px', 
                      fontSize: '10px', 
                      border: 'none', 
                      borderRadius: '3px',
                      background: '#faad14',
                      color: 'white'
                    }}
                    onClick={() => handleMemberAction(member, 'message')}
                  >
                    💬
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === '승인' && (
        <div className="card">
          <h3>✅ 승인 관리</h3>
          <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
            승인 대기 중인 항목이 없습니다.
          </p>
        </div>
      )}

      {activeTab === '소통' && (
        <div className="card">
          <h3>💬 팀 소통</h3>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
            📢 전체 공지사항 발송
          </button>
          <button className="btn" style={{ background: '#f0f0f0', color: '#595959', width: '100%' }}>
            📊 팀 회의 일정 관리
          </button>
        </div>
      )}

      {activeTab === '설정' && (
        <div className="card">
          <h3>⚙️ 팀 설정</h3>
          <button className="btn" style={{ background: '#f0f0f0', color: '#595959', width: '100%', marginBottom: '12px' }}>
            👥 팀원 관리
          </button>
          <button className="btn" style={{ background: '#f0f0f0', color: '#595959', width: '100%' }}>
            📋 체크리스트 설정
          </button>
        </div>
      )}

      {/* 하단 여백 */}
      <div style={{ height: '40px' }}></div>
    </div>
  )
}

export default TeamStatusPage
