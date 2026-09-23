import React, { useState } from 'react';
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
  BellRing
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
  const [reviewFileName, setReviewFileName] = useState(contract.legalReview.reviewFile?.fileName || '법무검토_의견서_회신.pdf');
  
  // Legal supervisor state
  const [supervisorFeedback, setSupervisorFeedback] = useState(contract.legalReview.supervisorFeedback || '');
  
  const [signedFileName, setSignedFileName] = useState(contract.signedDocument?.fileName || '');

  const isLegalManager = currentUser.role === 'legal_manager';
  const isLegalSupervisor = currentUser.role === 'legal_supervisor';
  const isMyTeam = contract.team === currentUser.team;

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

  // 2. Legal Manager replies and requests Final Approval from Legal Supervisor
  const handleLegalManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ContractItem = {
      ...contract,
      status: 'PENDING_SUPERVISOR_APPROVAL',
      legalReview: {
        ...contract.legalReview,
        status: 'PENDING_SUPERVISOR_APPROVAL',
        reviewerName: `${currentUser.name} (법무관리자)`,
        reviewedAt: new Date().toISOString().split('T')[0],
        feedback: legalFeedback,
        reviewFile: {
          fileName: reviewFileName,
          fileSize: '1.4 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name,
        }
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateContract(updated);
    alert('법무 검토 회신이 저장되었고, 법무담당에게 최종 승인 요청이 전송되었습니다.');
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
    alert(`법무담당 최종 승인이 완료되었습니다. 검토 요청자(${contract.legalReview.requestedBy || contract.team})에게 알림이 발송되었습니다.`);
  };

  // 4. Register Signed Document (날인본 등록)
  const handleRegisterSignedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const fileName = signedFileName || `${contract.title}_날인완료본.pdf`;
    const updated: ContractItem = {
      ...contract,
      status: 'SIGNED',
      signedDocument: {
        fileName,
        fileSize: '3.2 MB',
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
                {contract.status === 'PENDING_SUPERVISOR_APPROVAL' ? '법무담당승인대기' : contract.status}
              </span>
            </div>
          </div>

          {/* Attached Contract File Section (Replacing raw text) */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-zinc-600" /> 첨부된 계약서 파일
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
                <Download className="w-3.5 h-3.5" /> 계약서 다운로드
              </button>
            </div>
          </div>

          {/* Background & Key Content & Review Request Details */}
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
              <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">법무담당 검토 요청사항</h4>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {contract.legalReview.requestDetails}
              </p>
            </div>
          )}

          {/* Legal Review Section */}
          <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-700" />
                <span>법무 검토 및 승인 프로세스</span>
              </h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                contract.legalReview.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                contract.legalReview.status === 'REVISION_NEEDED' ? 'bg-amber-100 text-amber-800' :
                contract.legalReview.status === 'IN_REVIEW' ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-100 text-zinc-700'
              }`}>
                {contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' ? '법무담당 최종승인 대기중' : `상태: ${contract.legalReview.status}`}
              </span>
            </div>

            {/* Request Info */}
            {contract.legalReview.requestedAt && (
              <div className="text-xs bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2">
                <div className="flex justify-between text-zinc-500">
                  <span>요청자: {contract.legalReview.requestedBy}</span>
                  <span>요청일: {contract.legalReview.requestedAt}</span>
                </div>
                {contract.legalReview.requestMemo && (
                  <div className="text-zinc-800 font-medium">
                    요청 메모: {contract.legalReview.requestMemo}
                  </div>
                )}

                {/* Legal Manager Feedback & Attached Review File */}
                {contract.legalReview.feedback && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 text-zinc-900 space-y-2">
                    <div className="font-semibold text-zinc-900 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-700" /> 
                      법무관리자 검토 회신 ({contract.legalReview.reviewerName}, {contract.legalReview.reviewedAt}):
                    </div>
                    <p className="bg-white p-2.5 rounded border border-zinc-200 text-zinc-800">
                      {contract.legalReview.feedback}
                    </p>
                    {contract.legalReview.reviewFile && (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded border border-zinc-200">
                        <div className="flex items-center space-x-2 text-xs">
                          <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="font-medium text-zinc-800">{contract.legalReview.reviewFile.fileName}</span>
                          <span className="text-zinc-400">({contract.legalReview.reviewFile.fileSize})</span>
                        </div>
                        <button
                          onClick={() => alert(`법무 검토 회신 파일 다운로드: ${contract.legalReview.reviewFile?.fileName}`)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-xs font-medium text-zinc-700 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> 다운로드
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Legal Supervisor Approval Details */}
                {contract.legalReview.supervisorApprovedAt && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 text-zinc-900 space-y-1">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 
                      법무담당 최종 승인 완료 ({contract.legalReview.supervisorName}, {contract.legalReview.supervisorApprovedAt}):
                    </div>
                    <p className="bg-white p-2.5 rounded border border-emerald-200 text-emerald-900 font-medium">
                      {contract.legalReview.supervisorFeedback}
                    </p>
                    {contract.legalReview.isNotified && (
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
                        <BellRing className="w-3.5 h-3.5 text-emerald-600" /> 각 부서 검토 요청자({contract.team})에게 최종 승인 알림이 발송되었습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Form 1: Team requesting legal review */}
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
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
                >
                  법무담당 검토 요청하기
                </button>
              </form>
            )}

            {/* Action Form 2: Legal Manager reviewing & requesting supervisor approval */}
            {isLegalManager && contract.legalReview.status !== 'APPROVED' && (
              <form onSubmit={handleLegalManagerSubmit} className="space-y-3 pt-2 border-t border-zinc-100">
                <div className="font-medium text-xs text-zinc-900">법무관리자 검토 결과 회신 및 파일 첨부</div>
                
                {/* Review File Attachment */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">검토 회신 결과 파일 첨부</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={reviewFileName}
                      onChange={(e) => setReviewFileName(e.target.value)}
                      placeholder="검토 의견서 파일명 (예: 법무검토의견서.pdf)"
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <span className="text-[11px] text-zinc-500 font-mono bg-zinc-100 px-2.5 py-1.5 rounded">1.4 MB</span>
                  </div>
                </div>

                <textarea
                  value={legalFeedback}
                  onChange={(e) => setLegalFeedback(e.target.value)}
                  placeholder="법무 검토 의견 및 조항 수정 권고안을 입력하세요..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" /> 법무담당에게 최종 승인 요청하기
                </button>
              </form>
            )}

            {/* Action Form 3: Legal Supervisor final approval */}
            {isLegalSupervisor && contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' && (
              <form onSubmit={handleSupervisorApproval} className="space-y-3 pt-2 border-t border-zinc-100 bg-emerald-50/50 p-4 rounded-md">
                <div className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>법무담당 최종 승인 및 검토 내용 수정·확인</span>
                </div>
                <p className="text-[11px] text-zinc-600">
                  법무관리자의 검토 내용과 첨부된 의견서 파일을 검토하시고, 필요시 수정 의견을 가미하여 최종 승인을 진행해 주세요. 승인 시 요청 부서로 알림이 자동 발송됩니다.
                </p>
                <textarea
                  value={supervisorFeedback}
                  onChange={(e) => setSupervisorFeedback(e.target.value)}
                  placeholder="법무담당 최종 승인 의견 (수정 사항이 있는 경우 반영하세요)"
                  className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
          </div>

          {/* Signed Document Registration Section (날인본 등록) */}
          <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-zinc-700" />
                <span>계약 체결 날인본 등록</span>
              </h3>
              {contract.signedDocument?.isSigned ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 날인본 등록됨
                </span>
              ) : (
                <span className="text-xs text-zinc-500">미등록</span>
              )}
            </div>

            {contract.signedDocument?.isSigned ? (
              <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-zinc-600" />
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
                  법무 검토가 완료된 계약서에 양측이 서명·날인한 최종 PDF 파일을 업로드하세요.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={signedFileName}
                    onChange={(e) => setSignedFileName(e.target.value)}
                    placeholder="파일명 입력 (예: 계약서_최종날인본.pdf)"
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shrink-0"
                  >
                    날인본 업로드 및 등록
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
