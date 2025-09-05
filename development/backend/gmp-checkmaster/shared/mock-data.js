// 해커톤용 Mock 데이터
const DEMO_USERS = {
  'worker1': { id: 'worker1', name: '김작업', role: 'worker', team: '생산팀A' },
  'operator1': { id: 'operator1', name: '박운영', role: 'operator', team: '운영팀' },
  'supervisor1': { id: 'supervisor1', name: '이책임', role: 'supervisor', team: '생산팀A' },
  'admin1': { id: 'admin1', name: '최관리', role: 'admin', team: 'IT팀' },
  'security1': { id: 'security1', name: '정보안', role: 'security', team: '보안팀' }
};

const HYGIENE_TEMPLATE = {
  template_id: 'hygiene_checklist',
  name: '위생상태점검표',
  type: 'hygiene',
  items: [
    { id: 'symptoms', question: '발열, 설사, 구토 증상이 있나요?', type: 'select', options: ['없음', '있음'] },
    { id: 'respiratory', question: '호흡기 질환은 없나요?', type: 'select', options: ['없음', '있음'] },
    { id: 'wound', question: '신체에 상처가 있나요?', type: 'select', options: ['없음', '있음'] },
    { id: 'clothing', question: '작업복 착용이 적절한가요?', type: 'select', options: ['적절', '부적절'] },
    { id: 'accessories', question: '장신구를 제거했나요?', type: 'select', options: ['제거함', '착용중'] },
    { id: 'hair', question: '두발 상태가 적절한가요?', type: 'select', options: ['적절', '부적절'] },
    { id: 'nails', question: '손톱이 깨끗하고 짧은가요?', type: 'select', options: ['적절', '부적절'] },
    { id: 'makeup', question: '화장을 하지 않았나요?', type: 'select', options: ['안함', '함'] },
    { id: 'personal_items', question: '개인 물품을 반입하지 않았나요?', type: 'select', options: ['반입안함', '반입함'] }
  ]
};

module.exports = { DEMO_USERS, HYGIENE_TEMPLATE };
