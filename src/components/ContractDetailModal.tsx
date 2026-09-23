import React, { useState, useRef } from 'react';
import { ContractItem, User } from '../types';
import { 
  X, 
  Building, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  GitBranch, 
  GitCompare, 
  MessageSquare, 
  Paperclip, 
  Upload, 
  CheckSquare, 
  BellRing,
  FileUp,
  Save,
  Trash2,
  RefreshCw,
  Send,
  CornerDownRight,
  Sparkles
} from 'lucide-react';

interface ContractDetailModalProps {
  contract: ContractItem;
  currentUser: User;
  onClose: () => void;
  onUpdateContract: (updated: ContractItem) => void;
  onOpenCompare: (contract: ContractItem) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  currentUser,
  onClose,
  onUpdateContract,
  onOpenCompare,
}) => {
  const [requestMemo, setRequestMemo] = useState(contract.legalReview.requestMemo || '');
  const [legalFeedback, setLegalFeedback] = useState(contract.legalReview.feedback || '');
  
  // Review file state (법무관리자 검토 회신 첨부파일)
  const [reviewFile, setReviewFile] = useState<{
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    uploadedBy: string;
  } | null>(
    contract.legalReview.reviewFile || {
      fileName: `${contract.title}_법무검토의견서.pdf`,
      fileSize: '1.4 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name,
    }
  );

  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  const signedFileInputRef = useRef<HTMLInputElement>(null);

  // Legal supervisor state
  const [supervisorFeedback, setSupervisorFeedback] = useState(contract.legalReview.supervisorFeedback || '');
  
  // Signed Document state
  const [signedFileName, setSignedFileName] = useState(contract.signedDocument?.fileName || '');
  const [signedFileSize, setSignedFileSize] = useState(contract.signedDocument?.fileSize || '3.2 MB');

  const isLegalManager = currentUser.role === 'legal_manager';
  const isLegalSupervisor = currentUser.role === 'legal_supervisor';
  const isMyTeam = contract.team === currentUser.team;

  // Real file upload handler for legal review file
  const handleReviewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const displaySize = file.size > 0 ? `${sizeInMb} MB` : '1.4 MB';
      setReviewFile({
        fileName: file.name,
        fileSize: displaySize,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser.name,
      });
    }
  };

  // Real file upload handler for signed document
  const handleSignedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setSignedFileName(file.name);
      setSignedFileSize(file.size > 0 ? `${sizeInMb} MB` : '2.8 MB');
    }
  };

  // Quick feedback template buttons for Legal Manager
  const applyFeedbackTemplate = (template: string) => {
    if (!legalFeedback.trim()) {
      setLegalFeedback(template);
    } else {
      setLegalFeedback(prev => `${prev}\n${template}`);
    }
  };

  // Team Leader internal review approval
  const handleTeamLeaderApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    const updated: ContractItem = {
      ...contract,
      legalReview: {
        ...contract.legalReview,
        teamLeaderApproved: true,
        teamLeaderApprovedAt: new Date().toISOString().split('T')[0],
        teamLeaderName: `${currentUser.name} (팀장)`,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert(`[${currentUser.team}] 부서장(팀장) 승인이 완료되었습니다. 법무 검토 결재선으로 상신됩니다.`);
  };

  // 1. Request Legal Review (Team Member)
  const handleRequestReview = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ContractItem = {
      ...contract,
      status: 'REVIEW_REQUESTED',
      legalReview: {
        ...contract.legalReview,
        requestedAt: new Date().toISOString().split('T')[0],
        requestedBy: `${currentUser.name} (${currentUser.team})`,
        requestMemo,
        status: 'PENDING',
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert('법무담당에게 계약서 검토 요청이 접수되었습니다.');
  };

  // 2-A. Legal Manager: Save Draft / In Review (검토 중 저장)
  const handleSaveInReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!legalFeedback.trim()) {
      alert('검토 중인 의견을 간단히 입력해주세요.');
      return;
    }
    const updated: ContractItem = {
      ...contract,
      status: 'IN_REVIEW',
      legalReview: {
        ...contract.legalReview,
        status: 'IN_REVIEW',
        reviewerName: `${currentUser.name} (법무관리자)`,
        reviewedAt: new Date().toISOString().split('T')[0],
        feedback: legalFeedback,
        reviewFile: reviewFile || undefined,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert('검토 내용 및 첨부파일이 저장되었으며, 계약 상태가 [법무검토중]으로 갱신되었습니다.');
  };

  // 2-B. Legal Manager: Request revision from team (보완/수정 요청)
  const handleRequestRevision = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!legalFeedback.trim()) {
      alert('요청 부서에 전달할 수정 및 보완 사유를 검토 의견에 작성해주세요.');
      return;
    }
    const updated: ContractItem = {
      ...contract,
      status: 'REVIEW_REQUESTED',
      legalReview: {
        ...contract.legalReview,
        status: 'REVISION_NEEDED',
        reviewerName: `${currentUser.name} (법무관리자)`,
        reviewedAt: new Date().toISOString().split('T')[0],
        feedback: legalFeedback,
        reviewFile: reviewFile || undefined,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert(`요청 부서(${contract.team})에 계약서 수정 및 보완 요청이 전달되었습니다.`);
  };

  // 2-C. Legal Manager: Complete review & submit for final supervisor approval (법무담당 최종 승인 요청)
  const handleLegalManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalFeedback.trim()) {
      alert('법무 검토 의견을 입력해주세요.');
      return;
    }
    const updated: ContractItem = {
      ...contract,
      status: 'PENDING_SUPERVISOR_APPROVAL',
      legalReview: {
        ...contract.legalReview,
        status: 'PENDING_SUPERVISOR_APPROVAL',
        reviewerName: `${currentUser.name} (법무관리자)`,
        reviewedAt: new Date().toISOString().split('T')[0],
        feedback: legalFeedback,
        reviewFile: reviewFile || {
          fileName: `${contract.title}_법무검토의견서.pdf`,
          fileSize: '1.4 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name,
        }
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert('법무 검토 회신 및 검토본 파일이 저장되었으며, 법무담당에게 최종 승인 결재가 요청되었습니다.');
  };

  // 3. Legal Supervisor verifies, modifies, and gives final approval (triggers notification to requester)
  const handleSupervisorApproval = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ContractItem = {
      ...contract,
      status: 'REVIEW_COMPLETED',
      legalReview: {
        ...contract.legalReview,
        status: 'APPROVED',
        supervisorName: `${currentUser.name} (법무담당)`,
        supervisorFeedback: supervisorFeedback || '법무관리자 검토 내용 확인 및 최종 승인 완료.',
        supervisorApprovedAt: new Date().toISOString().split('T')[0],
        isNotified: true,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert(`법무담당 최종 승인이 완료되었습니다. 검토 요청자(${contract.legalReview.requestedBy || contract.team})에게 승인 완료 알림이 발송되었습니다.`);
  };

  // 4. Register Signed Document (날인본 등록)
  const handleRegisterSignedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFileName = signedFileName || `${contract.title}_날인완료본.pdf`;
    const updated: ContractItem = {
      ...contract,
      status: 'SIGNED',
      signedDocument: {
        fileName: finalFileName,
        fileSize: signedFileSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser.name,
        isSigned: true,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert('계약 체결 날인본이 성공적으로 등록되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-zinc-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              {contract.team.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-zinc-900">{contract.title}</h2>
                {contract.version > 1 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                    <GitBranch className="w-3 h-3" /> v{contract.version} 갱신 계약
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                카테고리: {contract.category} | 소속부서: {contract.team}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {contract.version > 1 && (
              <button
                onClick={() => onOpenCompare(contract)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
              >
                <GitCompare className="w-4 h-4" /> 갱신 계약 비교
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-xs">
            <div>
              <span className="text-zinc-500 block mb-1">계약상대방</span>
              <span className="font-semibold text-zinc-900 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-zinc-400" /> {contract.counterpart}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">계약 기간</span>
              <span className="font-semibold text-zinc-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {contract.startDate} ~ {contract.endDate}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">계약 금액</span>
              <span className="font-semibold text-zinc-900">{contract.amount}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">현재 상태</span>
              <span className="font-semibold text-zinc-900">
                {contract.status === 'PENDING_SUPERVISOR_APPROVAL' ? '법무담당승인대기' : 
                 contract.status === 'REVIEW_REQUESTED' ? '법무검토요청' :
                 contract.status === 'IN_REVIEW' ? '법무검토중' :
                 contract.status === 'REVIEW_COMPLETED' ? '최종승인완료' :
                 contract.status === 'SIGNED' ? '날인완료' : contract.status}
              </span>
            </div>
          </div>

          {/* Attached Contract File Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-zinc-600" /> 요청 부서 첨부 계약서 원본
            </h3>
            <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white border border-zinc-200 rounded text-zinc-800">
                  <FileText className="w-5 h-5 text-zinc-700" />
                </div>
                <div>
                  <div className="font-medium text-zinc-900 text-sm">{contract.contractFile.fileName}</div>
                  <div className="text-xs text-zinc-500">
                    용량: {contract.contractFile.fileSize} | 등록일: {contract.contractFile.uploadedAt} | 등록자: {contract.contractFile.uploadedBy}
                  </div>
                </div>
              </div>
              <button
                onClick={() => alert(`계약서 파일(${contract.contractFile.fileName}) 다운로드/미리보기`)}
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> 원본 다운로드
              </button>
            </div>
          </div>

          {/* Background & Key Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">계약 체결 배경</h4>
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {contract.legalReview.background || '등록된 체결 배경이 없습니다.'}
              </p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">주요 내용 요약</h4>
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {contract.legalReview.keyContent || '등록된 주요 내용이 없습니다.'}
              </p>
            </div>
          </div>

          {contract.legalReview.requestDetails && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-1">
              <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">법무 검토 요청사항</h4>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {contract.legalReview.requestDetails}
              </p>
            </div>
          )}

          {/* Legal Review Process Section */}
          <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-800" />
                <span>법무 검토 및 승인 프로세스</span>
              </h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                contract.legalReview.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                contract.legalReview.status === 'REVISION_NEEDED' ? 'bg-amber-100 text-amber-800' :
                contract.legalReview.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-zinc-100 text-zinc-700'
              }`}>
                {contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' ? '법무담당 최종승인 대기' :
                 contract.legalReview.status === 'APPROVED' ? '최종 승인 완료' :
                 contract.legalReview.status === 'IN_REVIEW' ? '법무 검토 진행중' :
                 contract.legalReview.status === 'REVISION_NEEDED' ? '수정 및 보완 요청됨' : '검토 요청 대기'}
              </span>
            </div>

            {/* Request Info & Existing Feedback Timeline */}
            {contract.legalReview.requestedAt && (
              <div className="text-xs bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-3">
                <div className="flex justify-between text-zinc-500 pb-2 border-b border-zinc-200">
                  <span>검토 요청자: <strong className="text-zinc-800">{contract.legalReview.requestedBy}</strong></span>
                  <span>요청일: {contract.legalReview.requestedAt}</span>
                </div>
                {contract.legalReview.requestMemo && (
                  <div className="text-zinc-800">
                    <span className="font-semibold text-zinc-600 block mb-0.5">요청 메모:</span>
                    <p className="bg-white p-2 rounded border border-zinc-200 text-zinc-800">
                      {contract.legalReview.requestMemo}
                    </p>
                  </div>
                )}

                {/* Team Leader Internal Approval Status */}
                {contract.legalReview.teamLeaderApproved && (
                  <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded text-amber-950 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>부서장(팀장) 사전 검토 및 내부 승인 완료 ({contract.legalReview.teamLeaderName})</span>
                    </div>
                    <span className="text-[11px] text-amber-700">{contract.legalReview.teamLeaderApprovedAt}</span>
                  </div>
                )}

                {/* Previously recorded Legal Manager Feedback */}
                {contract.legalReview.feedback && (
                  <div className="pt-2 text-zinc-900 space-y-2">
                    <div className="font-semibold text-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-700" /> 
                        <span>법무관리자 검토 회신 ({contract.legalReview.reviewerName}, {contract.legalReview.reviewedAt}):</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-zinc-200 text-zinc-800 whitespace-pre-wrap leading-relaxed">
                      {contract.legalReview.feedback}
                    </div>

                    {/* Attached Review File Card */}
                    {contract.legalReview.reviewFile && (
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-zinc-200 mt-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <Paperclip className="w-4 h-4 text-zinc-600" />
                          <div>
                            <span className="font-semibold text-zinc-900">{contract.legalReview.reviewFile.fileName}</span>
                            <span className="text-zinc-500 ml-2">
                              ({contract.legalReview.reviewFile.fileSize}, 등록자: {contract.legalReview.reviewFile.uploadedBy})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`법무 검토 회신 파일 다운로드: ${contract.legalReview.reviewFile?.fileName}`)}
                          className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-xs font-medium text-zinc-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> 검토본 다운로드
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Legal Supervisor Approval Details */}
                {contract.legalReview.supervisorApprovedAt && (
                  <div className="pt-3 border-t border-zinc-200 text-zinc-900 space-y-2">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                      <span>법무담당 최종 승인 완료 ({contract.legalReview.supervisorName}, {contract.legalReview.supervisorApprovedAt})</span>
                    </div>
                    <p className="bg-emerald-50/60 p-3 rounded border border-emerald-200 text-emerald-950 font-medium">
                      {contract.legalReview.supervisorFeedback}
                    </p>
                    {contract.legalReview.isNotified && (
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <BellRing className="w-3.5 h-3.5 text-emerald-600" /> 각 부서 검토 요청자({contract.team})에게 최종 승인 알림이 발송되었습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACTION WORKSPACE FOR LEGAL MANAGER: Review input, file upload, & execution buttons */}
            {isLegalManager && contract.legalReview.status !== 'APPROVED' && (
              <form onSubmit={handleLegalManagerSubmit} className="space-y-4 pt-3 border-t border-zinc-200">
                {/* Authority Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-2">
                      <span>법무관리자 검토 작성 및 파일 업로드 권한 활성화</span>
                      <span className="text-[11px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-normal">
                        담당: {currentUser.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      계약서에 대한 검토 의견을 작성하고, 검토를 마친 계약서 수정본 또는 법무 의견서 파일을 첨부한 뒤 법무담당에게 최종 승인을 요청할 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 1. Review File Upload Component with Real File Input Button */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-zinc-700" />
                    <span>검토한 계약서 / 법무의견서 파일 첨부 (업로드)</span>
                  </label>

                  {/* Hidden real file input */}
                  <input
                    type="file"
                    ref={reviewFileInputRef}
                    onChange={handleReviewFileUpload}
                    accept=".pdf,.doc,.docx,.hwp,.hwpx,.xlsx"
                    className="hidden"
                  />

                  {/* Upload Card */}
                  <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-lg p-4 transition-colors hover:border-zinc-400">
                    {reviewFile ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-md border border-zinc-200 shadow-xs">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 text-blue-700 rounded border border-blue-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                              <span>{reviewFile.fileName}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                파일 첨부됨
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              크기: {reviewFile.fileSize} | 등록자: {reviewFile.uploadedBy} | 등록일: {reviewFile.uploadedAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => reviewFileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>파일 변경</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewFile(null)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="첨부 파일 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => reviewFileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center py-4 cursor-pointer text-center"
                      >
                        <FileUp className="w-8 h-8 text-zinc-400 mb-2" />
                        <div className="text-xs font-medium text-zinc-800">
                          이곳을 클릭하여 검토 완료된 계약서 또는 법무의견서 파일을 첨부하세요
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          PDF, DOCX, HWP 형식 지원 (최대 50MB)
                        </div>
                        <button
                          type="button"
                          className="mt-3 px-3 py-1.5 bg-white border border-zinc-300 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100 flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>PC에서 파일 선택</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Legal Feedback Textarea & Fast Templates */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-zinc-700" />
                      <span>법무관리자 검토 의견 및 조항 수정 권고안</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">필수 입력 항목</span>
                  </div>

                  {/* Fast Template Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-zinc-500 font-medium mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> 빠른 입력:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyFeedbackTemplate('제반 조항이 사내 표준 계약 가이드라인에 부합하여 승인을 권고합니다.')}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 transition-colors"
                    >
                      표준 조항 적합(승인 권고)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFeedbackTemplate('제5조 손해배상 책임 한도 조항에 대해 당사 귀책 사유로 인한 직접 손해로 한정하도록 수정을 권고합니다.')}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 transition-colors"
                    >
                      손해배상 한도 보완
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFeedbackTemplate('제10조 분쟁 관할 법원을 서울중앙지방법원(당사 본사 소재지)으로 수정 조치 요망합니다.')}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 transition-colors"
                    >
                      관할 법원 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFeedbackTemplate('계약 기간 및 대금 지급 기한 조항에 대한 추가 협의가 필요하여 보완을 요청합니다.')}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 transition-colors"
                    >
                      조건 재협상(보완)
                    </button>
                  </div>

                  <textarea
                    value={legalFeedback}
                    onChange={(e) => setLegalFeedback(e.target.value)}
                    placeholder="검토 의견, 조항 수정 권고안, 법률적 리스크 검토 결과를 상세히 작성하세요..."
                    className="w-full bg-white border border-zinc-300 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
                    rows={4}
                    required
                  />
                </div>

                {/* 3. Action Execution Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    {/* Action 1: Save Draft (IN_REVIEW) */}
                    <button
                      type="button"
                      onClick={handleSaveInReview}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                      title="검토 의견과 파일을 임시 저장하고 [법무검토중] 상태로 둡니다"
                    >
                      <Save className="w-3.5 h-3.5 text-zinc-600" />
                      <span>검토 내용 임시 저장</span>
                    </button>

                    {/* Action 2: Request Revision from Requester */}
                    <button
                      type="button"
                      onClick={handleRequestRevision}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                      title="요청 부서로 수정/보완을 반려 요청합니다"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>요청 부서에 보완 요청</span>
                    </button>
                  </div>

                  {/* Action 3: Primary Action - Submit for Supervisor Final Approval */}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>법무담당에게 최종 승인 요청하기</span>
                  </button>
                </div>
              </form>
            )}

            {/* ACTION WORKSPACE FOR LEGAL SUPERVISOR: Final Approval */}
            {isLegalSupervisor && contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' && (
              <form onSubmit={handleSupervisorApproval} className="space-y-3 pt-3 border-t border-zinc-200 bg-emerald-50/60 p-4 rounded-lg border border-emerald-200">
                <div className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>법무담당 최종 결재 및 승인</span>
                </div>
                <p className="text-[11px] text-zinc-600">
                  법무관리자가 작성한 검토 의견 및 첨부된 검토본 파일을 확인하시고, 최종 승인 의견을 입력한 후 승인 결재를 완료하세요.
                </p>
                <textarea
                  value={supervisorFeedback}
                  onChange={(e) => setSupervisorFeedback(e.target.value)}
                  placeholder="법무담당 최종 승인 의견을 입력하세요 (예: 법무관리자 검토 결과 적합하여 최종 승인합니다)."
                  className="w-full bg-white border border-emerald-300 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  rows={2}
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-5 py-2.5 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> 최종 승인 및 요청자에게 알림 발송
                </button>
              </form>
            )}

            {/* ACTION WORKSPACE FOR TEAM LEADER: Internal Approval */}
            {currentUser.role === 'team_leader' && isMyTeam && !contract.legalReview.teamLeaderApproved && (
              <div className="pt-3 border-t border-zinc-200">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-amber-700" />
                      <span>부서장(팀장) 계약서 사전 검토 및 내부 승인 권한</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      소속 팀원({contract.legalReview.requestedBy || contract.team})이 작성한 계약서 내용을 확인하고 팀장 승인을 완료합니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTeamLeaderApprove}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0 ml-3"
                  >
                    팀장 사전 승인하기
                  </button>
                </div>
              </div>
            )}

            {/* ACTION WORKSPACE FOR TEAM MEMBER: Request legal review if not requested yet */}
            {!isLegalManager && !isLegalSupervisor && isMyTeam && (!contract.legalReview.requestedAt || contract.legalReview.status === 'PENDING') && (
              <form onSubmit={handleRequestReview} className="space-y-3 pt-2">
                <label className="block text-xs font-medium text-zinc-700">법무담당 검토 요청 메모</label>
                <textarea
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                  placeholder="법무담당에게 검토를 요청할 특이사항이나 중점 검토 조항을 입력하세요..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  rows={2}
                />
                <button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>법무담당 검토 요청하기</span>
                </button>
              </form>
            )}
          </div>

          {/* Signed Document Registration Section (날인본 등록) */}
          <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-zinc-700" />
                <span>계약 체결 날인본 등록 및 관리</span>
              </h3>
              {contract.signedDocument?.isSigned ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 날인본 등록 완료
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded">
                  날인본 미등록
                </span>
              )}
            </div>

            {contract.signedDocument?.isSigned ? (
              <div className="bg-zinc-50 p-3.5 rounded-md border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-semibold text-zinc-900">{contract.signedDocument.fileName}</span>
                    <span className="text-zinc-500 ml-2">({contract.signedDocument.fileSize}, 업로드일: {contract.signedDocument.uploadedAt})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`날인본 파일(${contract.signedDocument?.fileName}) 다운로드`)}
                  className="px-3 py-1.5 bg-white border border-zinc-300 rounded hover:bg-zinc-100 text-zinc-700 font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> 다운로드
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSignedDoc} className="space-y-3 pt-2">
                <p className="text-xs text-zinc-500">
                  법무 최종 승인이 완료된 계약서에 대해 양측 대표자 서명/날인이 완료된 최종 PDF 파일을 등록하세요.
                </p>

                <input
                  type="file"
                  ref={signedFileInputRef}
                  onChange={handleSignedFileUpload}
                  accept=".pdf"
                  className="hidden"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={signedFileName}
                    onChange={(e) => setSignedFileName(e.target.value)}
                    placeholder="날인본 파일명 (예: 계약서_최종날인본.pdf)"
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => signedFileInputRef.current?.click()}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-md border border-zinc-300 flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>파일 선택</span>
                  </button>
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shrink-0"
                  >
                    날인본 등록 완료
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-medium px-4 py-2 rounded-md transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
