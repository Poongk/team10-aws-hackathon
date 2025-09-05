import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import MVPLayout from './components/MVPLayout';
import DesktopLayout from './components/DesktopLayout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* 기존 모바일 프레임 */}
        <Route path="/mobile/*" element={<MobileLayout />} />
        
        {/* 새로운 MVP 프레임 */}
        <Route path="/mvp/*" element={<MVPLayout />} />
        
        {/* 데스크톱 전체 화면 */}
        <Route path="/desktop/*" element={<DesktopLayout />} />
        
        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/mvp/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
