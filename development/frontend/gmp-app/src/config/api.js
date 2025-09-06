// API 설정 - React 환경에서 안전한 방식
const getEnvVar = (name, defaultValue = '') => {
  try {
    return process?.env?.[name] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// API 설정
const API_CONFIG = {
  // 개발 환경 (로컬)
  development: {
    BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:3001'),
    TIMEOUT: parseInt(getEnvVar('REACT_APP_API_TIMEOUT', '10000'))
  },
  
  // 프로덕션 환경 (AWS 배포)
  production: {
    BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', 'https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod'),
    TIMEOUT: parseInt(getEnvVar('REACT_APP_API_TIMEOUT', '15000'))
  },
  
  // 스테이징 환경 (선택사항)
  staging: {
    BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', 'https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod'),
    TIMEOUT: parseInt(getEnvVar('REACT_APP_API_TIMEOUT', '15000'))
  }
};

// 현재 환경 감지
const getCurrentEnvironment = () => {
  // 환경변수 우선 확인
  const envVar = getEnvVar('REACT_APP_ENV');
  if (envVar) {
    return envVar;
  }
  
  // 호스트명으로 환경 감지
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging')) {
    return 'staging';
  }
  
  return 'production';
};

// 현재 환경의 API 설정
const currentEnv = getCurrentEnvironment();
const config = API_CONFIG[currentEnv];

// API 호출 헬퍼 함수
export const apiCall = async (endpoint, options = {}) => {
  const url = `${config.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    timeout: config.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    return await response.json();
  } catch (error) {
    console.error(`API 호출 실패 [${currentEnv}]:`, url, error);
    throw error;
  }
};

// 인증이 필요한 API 호출
export const authenticatedApiCall = async (endpoint, options = {}) => {
  const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
  
  if (!userSession.session_token) {
    throw new Error('인증 토큰이 없습니다');
  }
  
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${userSession.session_token}`
    }
  };
  
  return apiCall(endpoint, authOptions);
};

// 현재 설정 정보 (디버깅용)
export const getApiConfig = () => ({
  environment: currentEnv,
  baseUrl: config.BASE_URL,
  timeout: config.TIMEOUT
});

export default config;
