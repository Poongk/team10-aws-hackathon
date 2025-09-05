import { useState, useEffect } from 'react'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 156,
    todayChecked: 142,
    pendingApproval: 3,
    rejectedToday: 2,
    avgCompletionTime: '4분 32초',
    complianceRate: 94.2
  })

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, worker: '김작업', action: '체크리스트 완료', status: 'approved', time: '09:15', dept: '생산팀A' },
    { id: 2, worker: '이제조', action: '체크리스트 완료', status: 'approved', time: '09:12', dept: '생산팀B' },
    { id: 3, worker: '박품질', action: '예외 승인 요청', status: 'pending', time: '09:08', dept: '품질팀' },
    { id: 4, worker: '최안전', action: '체크리스트 거부', status: 'rejected', time: '09:05', dept: '안전팀' },
    { id: 5, worker: '정관리', action: '체크리스트 완료', status: 'approved', time: '09:02', dept: '관리팀' }
  ])

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: '생산팀A 출입률 85% (목표: 95%)', time: '09:00' },
    { id: 2, type: 'error', message: '품질팀 박품질님 승인 대기 중', time: '09:08' },
    { id: 3, type: 'info', message: '오늘 평균 완료시간 단축 (전일 대비 -23초)', time: '08:45' }
  ])

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          📊 관리자 대시보드
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          실시간 GMP 준수 현황 모니터링
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
            {stats.todayChecked}/{stats.totalWorkers}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>오늘 체크 완료</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
            {stats.complianceRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>준수율</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}>
            {stats.pendingApproval}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>승인 대기</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f5222d' }}>
            {stats.rejectedToday}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>오늘 거부</div>
        </div>
      </div>

      {/* 알림 섹션 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
          🚨 실시간 알림
        </h3>
        {alerts.map(alert => (
          <div key={alert.id} style={{
            padding: '8px 12px',
            marginBottom: '8px',
            borderRadius: '6px',
            fontSize: '12px',
            backgroundColor: alert.type === 'error' ? '#fff2f0' : 
                           alert.type === 'warning' ? '#fffbe6' : '#f6ffed',
            borderLeft: `3px solid ${alert.type === 'error' ? '#f5222d' : 
                                   alert.type === 'warning' ? '#faad14' : '#52c41a'}`
          }}>
            <div style={{ fontWeight: '500' }}>{alert.message}</div>
            <div style={{ color: '#666', fontSize: '10px' }}>{alert.time}</div>
          </div>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
          📋 최근 활동
        </h3>
        {recentActivities.map(activity => (
          <div key={activity.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>
                {activity.worker} ({activity.dept})
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {activity.action}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: activity.status === 'approved' ? '#f6ffed' :
                               activity.status === 'pending' ? '#fffbe6' : '#fff2f0',
                color: activity.status === 'approved' ? '#52c41a' :
                      activity.status === 'pending' ? '#faad14' : '#f5222d'
              }}>
                {activity.status === 'approved' ? '승인' :
                 activity.status === 'pending' ? '대기' : '거부'}
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <button className="btn btn-primary" style={{ padding: '12px', fontSize: '14px' }}>
          📊 상세 리포트
        </button>
        <button className="btn btn-warning" style={{ padding: '12px', fontSize: '14px' }}>
          ⚙️ 시스템 설정
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
