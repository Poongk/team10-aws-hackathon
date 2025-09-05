// 표준 응답 형식
const createResponse = (statusCode, data, message = null) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: statusCode < 400,
      data,
      message,
      timestamp: new Date().toISOString()
    })
  };
};

const successResponse = (data, message = 'Success') => createResponse(200, data, message);
const errorResponse = (statusCode, message, data = null) => createResponse(statusCode, data, message);

module.exports = { createResponse, successResponse, errorResponse };
