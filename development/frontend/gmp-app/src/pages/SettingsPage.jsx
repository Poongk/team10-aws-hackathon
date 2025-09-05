import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SettingsPage() {
  const navigate = useNavigate()
  
  const [settings, setSettings] = useState({
    notifications: true,
    autoScan: false,
    soundEnabled: true,
    language: 'ko',
    theme: 'light',
    cameraQuality: 'high',
    scanTimeout: 30,
    autoLogout: 60
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // 설정 저장 로직
    alert('설정이 저장되었습니다!')
  }

  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
      setSettings({
        notifications: true,
        autoScan: false,
        soundEnabled: true,
        language: 'ko',
        theme: 'light',
        cameraQuality: 'high',
        scanTimeout: 30,
        autoLogout: 60
      })
    }
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', fontSize: '18px' }}>
          ← 뒤로
        </button>
        <h2>⚙️ 시스템 설정</h2>
        <span>🏠</span>
      </div>

      {/* 일반 설정 */}
      <div className="card">
        <h3>🔧 일반 설정</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔔 알림 활성화</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔊 사운드 효과</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>🌍 언어 설정</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>🎨 테마 설정</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          >
            <option value="light">라이트 모드</option>
            <option value="dark">다크 모드</option>
            <option value="auto">자동</option>
          </select>
        </div>
      </div>

      {/* QR 스캐너 설정 */}
      <div className="card">
        <h3>📱 QR 스캐너 설정</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🤖 자동 스캔 모드</span>
            <input
              type="checkbox"
              checked={settings.autoScan}
              onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>📷 카메라 품질</label>
          <select
            value={settings.cameraQuality}
            onChange={(e) => handleSettingChange('cameraQuality', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          >
            <option value="low">낮음 (빠름)</option>
            <option value="medium">보통</option>
            <option value="high">높음 (선명함)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>⏱️ 스캔 타임아웃 (초)</label>
          <input
            type="range"
            min="10"
            max="60"
            value={settings.scanTimeout}
            onChange={(e) => handleSettingChange('scanTimeout', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
            {settings.scanTimeout}초
          </div>
        </div>
      </div>

      {/* 보안 설정 */}
      <div className="card">
        <h3>🔒 보안 설정</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>🚪 자동 로그아웃 (분)</label>
          <input
            type="range"
            min="15"
            max="120"
            value={settings.autoLogout}
            onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
            {settings.autoLogout}분 후 자동 로그아웃
          </div>
        </div>

        <button 
          className="btn btn-warning"
          onClick={() => alert('비밀번호 변경 기능은 준비 중입니다.')}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          🔑 비밀번호 변경
        </button>
      </div>

      {/* 시스템 정보 */}
      <div className="card">
        <h3>ℹ️ 시스템 정보</h3>
        
        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
          <div><strong>앱 버전:</strong> GMP CheckMaster v1.0.0</div>
          <div><strong>빌드 날짜:</strong> 2025-09-05</div>
          <div><strong>개발팀:</strong> drug qrew</div>
          <div><strong>지원:</strong> AWS 해커톤 2025</div>
        </div>

        <button 
          className="btn"
          style={{ background: '#f0f0f0', color: '#595959', width: '100%', marginTop: '12px' }}
          onClick={() => alert('업데이트를 확인 중입니다...')}
        >
          🔄 업데이트 확인
        </button>
      </div>

      {/* 액션 버튼 */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          💾 저장
        </button>
        <button className="btn btn-danger" onClick={handleReset}>
          🔄 초기화
        </button>
      </div>

      {/* 하단 여백 */}
      <div style={{ height: '40px' }}></div>
    </div>
  )
}

export default SettingsPage
