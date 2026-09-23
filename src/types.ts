export type Team = '영업1팀' | '인사팀' | '재무팀' | '개발팀' | '법무담당';

export type UserRoleType = 'team_member' | 'legal_manager' | 'legal_supervisor';

export interface User {
  id: string;
  name: string;
  team: Team;
  role: UserRoleType;
}

export type ContractStatus = 
  | 'DRAFT'                       // 작성중
  | 'REVIEW_REQUESTED'            // 법무검토요청
  | 'IN_REVIEW'                   // 법무검토중
  | 'PENDING_SUPERVISOR_APPROVAL' // 법무담당 최종승인대기
  | 'REVIEW_COMPLETED'            // 검토완료 (최종승인됨)
  | 'SIGNED'                      // 날인완료 (체결됨)
  | 'EXPIRED';                    // 만료됨

export type LegalReviewStatus = 'PENDING' | 'IN_REVIEW' | 'PENDING_SUPERVISOR_APPROVAL' | 'APPROVED' | 'REVISION_NEEDED';

export interface AttachedFile {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface LegalReview {
  requestedAt?: string;
  requestedBy?: string;
  background?: string;       // 계약 체결의 배경
  keyContent?: string;       // 주요 내용
  requestDetails?: string;   // 검토 요청사항
  
  teamLeaderApproved?: boolean;       // 부서장(팀장) 승인 여부
  teamLeaderApprovedAt?: string;
  teamLeaderName?: string;

  status: LegalReviewStatus;
  
  reviewerName?: string;     // 법무관리자 이름
  reviewedAt?: string;
  feedback?: string;         // 법무관리자 검토 회신 내용
  reviewFile?: AttachedFile; // 법무관리자 검토 회신 첨부파일

  supervisorName?: string;     // 법무담당 이름
  supervisorFeedback?: string; // 법무담당 수정 및 확인 의견
  supervisorApprovedAt?: string;
  
  isNotified?: boolean;      // 요청자에게 알림 발송 여부
}

export interface SignedDocument {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  isSigned: boolean;
  fileUrl?: string;
}

export interface ContractItem {
  id: string;
  title: string;
  category: string;           // 카테고리
  counterpart: string;        // 계약상대방
  team: Team;                 // 소속 팀
  version: number;            // 1: 최초계약, 2: 1차갱신 등
  parentId?: string;          // 이전 계약 ID (갱신 연결)
  startDate: string;
  endDate: string;
  amount: string;             // 계약금액
  
  contractFile: AttachedFile; // 첨부된 계약서 파일
  previousContractFile?: AttachedFile; // 이전 계약서 파일 (비교용)
  
  status: ContractStatus;
  legalReview: LegalReview;
  signedDocument?: SignedDocument;
  createdAt: string;
  updatedAt: string;
}
