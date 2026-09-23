import { ContractItem, User } from '../types';

export const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'cnt-101',
    title: '클라우드 인프라 사용 계약 (최초)',
    category: 'IT 인프라 및 소프트웨어',
    counterpart: '(주)클라우드맥스',
    team: '영업1팀',
    version: 1,
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    amount: '50,000,000 KRW',
    contractFile: {
      fileName: '클라우드인프라_원본계약서_v1.pdf',
      fileSize: '2.4 MB',
      uploadedAt: '2023-12-15',
      uploadedBy: '김영업'
    },
    status: 'REVIEW_COMPLETED',
    legalReview: {
      requestedAt: '2023-12-15',
      requestedBy: '김영업 (영업1팀)',
      background: '신규 클라우드 서버 인프라 도입을 위한 전사 표준 서비스 계약 체결',
      keyContent: '월 4,166,666원 지급 및 월간 가동률 99.5% SLA 보장',
      requestDetails: 'SLA 위반 시 위약금 조항 및 관할 법원 조항 검토 요청',
      status: 'APPROVED',
      reviewerName: '최법무 (법무관리자)',
      reviewedAt: '2023-12-18',
      feedback: '제3조 SLA 보장 조항 검토 완료. 관할 법원 본사 소재지로 수정 반영 완료.',
      reviewFile: {
        fileName: '법무검토_의견서_클라우드v1.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2023-12-18',
        uploadedBy: '최법무'
      },
      supervisorName: '한법무담당 (법무담당)',
      supervisorFeedback: '최종 승인합니다. 표준 약관에 부합합니다.',
      supervisorApprovedAt: '2023-12-19',
      isNotified: true
    },
    signedDocument: {
      fileName: '클라우드인프라_계약서_날인본_v1.pdf',
      fileSize: '2.8 MB',
      uploadedAt: '2023-12-20',
      uploadedBy: '김영업',
      isSigned: true
    },
    createdAt: '2023-12-15',
    updatedAt: '2023-12-20'
  },
  {
    id: 'cnt-102',
    title: '클라우드 인프라 사용 계약 (1차 갱신)',
    category: 'IT 인프라 및 소프트웨어',
    counterpart: '(주)클라우드맥스',
    team: '영업1팀',
    version: 2,
    parentId: 'cnt-101',
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    amount: '55,000,000 KRW',
    contractFile: {
      fileName: '클라우드인프라_갱신계약서_v2.pdf',
      fileSize: '2.6 MB',
      uploadedAt: '2024-12-10',
      uploadedBy: '김영업'
    },
    previousContractFile: {
      fileName: '클라우드인프라_원본계약서_v1.pdf',
      fileSize: '2.4 MB',
      uploadedAt: '2023-12-15',
      uploadedBy: '김영업'
    },
    status: 'PENDING_SUPERVISOR_APPROVAL',
    legalReview: {
      requestedAt: '2024-12-10',
      requestedBy: '김영업 (영업1팀)',
      background: '기존 계약 기간 만료에 따른 1년 연장 및 서버 증설에 따른 단가 인상',
      keyContent: '금액 월 4,583,333원으로 인상 (연 5,500만원), SLA 가동률 99.9%로 상향',
      requestDetails: '단가 인상율 적정성 및 상향된 SLA 조건에 따른 법무 검토 요청',
      status: 'PENDING_SUPERVISOR_APPROVAL',
      reviewerName: '최법무 (법무관리자)',
      reviewedAt: '2024-12-12',
      feedback: '서버 증설 내역 확인 완료. 단가 인상율이 물가상승률 범위 내에 있어 승인 권고합니다.',
      reviewFile: {
        fileName: '법무검토_갱신의견서_클라우드v2.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2024-12-12',
        uploadedBy: '최법무'
      }
    },
    createdAt: '2024-12-10',
    updatedAt: '2024-12-12'
  },
  {
    id: 'cnt-201',
    title: '강남 오피스 임대차 계약',
    category: '부동산 임대차',
    counterpart: '(주)서울디벨로퍼',
    team: '재무팀',
    version: 1,
    startDate: '2023-03-01',
    endDate: '2026-02-28',
    amount: '120,000,000 KRW (보증금 3억)',
    contractFile: {
      fileName: '강남오피스_임대차계약서_원본.pdf',
      fileSize: '4.1 MB',
      uploadedAt: '2023-02-10',
      uploadedBy: '이재무'
    },
    status: 'REVIEW_COMPLETED',
    legalReview: {
      requestedAt: '2023-02-10',
      requestedBy: '이재무 (재무팀)',
      background: '신규 강남구 오피스 사옥 이전 임대차 계약 체결',
      keyContent: '보증금 3억원, 월 임대료 1천만원, 36개월 임대차',
      requestDetails: '원상복구 범위 및 중도 해지 조항에 대한 법무 검토 요청',
      status: 'APPROVED',
      reviewerName: '최법무 (법무관리자)',
      reviewedAt: '2023-02-14',
      feedback: '원상복구 범위에 대한 특약 조항 수정 완료 후 체결 요망.',
      reviewFile: {
        fileName: '임대차계약_법무검토의견.pdf',
        fileSize: '1.5 MB',
        uploadedAt: '2023-02-14',
        uploadedBy: '최법무'
      },
      supervisorName: '한법무담당 (법무담당)',
      supervisorFeedback: '임대차 보증금 반환 보증 여부 확인 후 최종 승인함.',
      supervisorApprovedAt: '2023-02-15',
      isNotified: true
    },
    signedDocument: {
      fileName: '강남오피스_임대차계약서_날인본.pdf',
      fileSize: '4.3 MB',
      uploadedAt: '2023-02-20',
      uploadedBy: '이재무',
      isSigned: true
    },
    createdAt: '2023-02-10',
    updatedAt: '2023-02-20'
  },
  {
    id: 'cnt-301',
    title: '임직원 건강검진 위탁 계약',
    category: '복리후생 및 의료',
    counterpart: '한국메디컬헬스케어',
    team: '인사팀',
    version: 1,
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    amount: '30,000,000 KRW',
    contractFile: {
      fileName: '건강검진위탁계약서_v1.pdf',
      fileSize: '1.8 MB',
      uploadedAt: '2024-03-10',
      uploadedBy: '박인사'
    },
    status: 'REVIEW_COMPLETED',
    legalReview: {
      requestedAt: '2024-03-10',
      requestedBy: '박인사 (인사팀)',
      background: '임직원 종합건강검진 복리후생 제휴 의료기관 위탁 계약',
      keyContent: '재직 임직원 150명 대상, 1인당 20만원 일괄 정산',
      requestDetails: '개인정보 제3자 제공 동의 및 의료 사고 면책 조항 검토',
      status: 'APPROVED',
      reviewerName: '최법무 (법무관리자)',
      reviewedAt: '2024-03-12',
      feedback: '개인정보 보호법 준수 조항 추가 확인됨. 승인.',
      supervisorName: '한법무담당 (법무담당)',
      supervisorFeedback: '승인 완료.',
      supervisorApprovedAt: '2024-03-13',
      isNotified: true
    },
    signedDocument: {
      fileName: '건강검진위탁계약_날인본.pdf',
      fileSize: '1.9 MB',
      uploadedAt: '2024-03-15',
      uploadedBy: '박인사',
      isSigned: true
    },
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15'
  },
  {
    id: 'cnt-302',
    title: '임직원 건강검진 위탁 계약 (1차 갱신)',
    category: '복리후생 및 의료',
    counterpart: '한국메디컬헬스케어',
    team: '인사팀',
    version: 2,
    parentId: 'cnt-301',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    amount: '35,000,000 KRW',
    contractFile: {
      fileName: '건강검진위탁계약서_v2.pdf',
      fileSize: '2.0 MB',
      uploadedAt: '2025-03-02',
      uploadedBy: '박인사'
    },
    previousContractFile: {
      fileName: '건강검진위탁계약서_v1.pdf',
      fileSize: '1.8 MB',
      uploadedAt: '2024-03-10',
      uploadedBy: '박인사'
    },
    status: 'IN_REVIEW',
    legalReview: {
      requestedAt: '2025-03-02',
      requestedBy: '박인사 (인사팀)',
      background: '임직원 수 증가(150명 -> 170명) 및 프리미엄 수면내시경 항목 추가에 따른 갱신 계약',
      keyContent: '대상 170명, 1인당 20만 6천원, 수면내시경 기본 포함',
      requestDetails: '단가 변동 및 추가 검진 항목에 대한 법무 검토 요청',
      status: 'IN_REVIEW',
      reviewerName: '최법무 (법무관리자)',
      feedback: '검토 진행 중입니다. 수면내시경 관련 의료 사고 책임 면책 조항 보완 필요.'
    },
    createdAt: '2025-03-02',
    updatedAt: '2025-03-03'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'usr-1', email: 'sales@company.com', name: '김영업', team: '영업1팀', role: 'team_member', position: '팀원' },
  { id: 'usr-1-lead', email: 'sales.lead@company.com', name: '정영업팀장', team: '영업1팀', role: 'team_leader', position: '팀장' },
  { id: 'usr-3', email: 'finance@company.com', name: '이재무', team: '재무팀', role: 'team_member', position: '팀원' },
  { id: 'usr-3-lead', email: 'finance.lead@company.com', name: '박재무팀장', team: '재무팀', role: 'team_leader', position: '팀장' },
  { id: 'usr-2', email: 'hr@company.com', name: '박인사', team: '인사팀', role: 'team_member', position: '팀원' },
  { id: 'usr-4', email: 'legal.mgr@company.com', name: '최법무', team: '법무담당', role: 'legal_manager', position: '법무관리자' },
  { id: 'usr-5', email: 'legal.head@company.com', name: '한법무담당', team: '법무담당', role: 'legal_supervisor', position: '법무담당' },
];
