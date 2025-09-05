import { useNavigate } from 'react-router-dom'

function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>👷 작업자 대시보드</h2>
        <span>🏠</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>👤 김작업님 (생산팀A)</h3>
        <p>📅 2025-09-05 (금)</p>
      </div>

      <div className="card">
        <h3>📋 오늘 할 일</h3>
        <div style={{ margin: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff2f0', borderRadius: '6px', border: '1px solid #ffccc7' }}>
            <span>⏰ 위생상태점검</span>
            <span style={{ color: '#f5222d', fontWeight: '600' }}>미완료</span>
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/checklist')}
        >
          📝 체크리스트 작성하기
        </button>
      </div>

      <div className="card">
        <h3>📊 나의 기록</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#52c41a' }}>15</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>연속 완료</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#e6f7ff', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1890ff' }}>07:45</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>평균 시간</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#fffbe6', borderRadius: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#faad14' }}>98%</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>승인율</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🚀 빠른 액션</h3>
        <button className="btn btn-success">
          📱 QR 코드 보기
        </button>
        <button className="btn" style={{ background: '#f0f0f0', color: '#595959' }}>
          📊 개인 이력 조회
        </button>
      </div>
    </div>
  )
}

export default DashboardPage
