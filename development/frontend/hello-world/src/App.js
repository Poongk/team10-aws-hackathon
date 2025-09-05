import React from 'react';

function App() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Hello World!</h1>
      <p>GMP CheckMaster AI - 해커톤 테스트 배포</p>
      <p>팀: drug qrew</p>
      <p>배포 시간: {new Date().toLocaleString('ko-KR')}</p>
    </div>
  );
}

export default App;
