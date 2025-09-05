const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('QR Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/qr/generate' && method === 'POST') {
      return await generateQR(event);
    }
    
    if (path === '/qr/verify' && method === 'POST') {
      return await verifyQR(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('QR Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function generateQR(event) {
  const { user_id, record_id } = JSON.parse(event.body);
  
  const qrData = {
    qr_code: `QR-${user_id}-${Date.now()}`,
    user_id,
    record_id,
    expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8시간 후
    access_level: 'production_area'
  };
  
  return successResponse(qrData, 'QR code generated');
}

async function verifyQR(event) {
  const { qr_code } = JSON.parse(event.body);
  
  // Mock 검증 로직
  if (qr_code.startsWith('QR-')) {
    return successResponse({
      valid: true,
      user_id: qr_code.split('-')[1],
      access_granted: true,
      verified_at: new Date().toISOString()
    }, 'QR code verified');
  }
  
  return errorResponse(400, 'Invalid QR code');
}
