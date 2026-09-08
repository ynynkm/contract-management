import React from 'react';
import { ContractItem, User } from '../types';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Building, Calendar, Eye } from 'lucide-react';

interface LegalReviewQueueProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
}

export const LegalReviewQueue: React.FC<LegalReviewQueueProps> = ({
  contracts,
  currentUser,
  onSelectContract,
}) => {
  // Filter contracts that have legal review requested or in review, or if legal manager, show all requests
  let reviewList = contracts.filter((c) => c.status === 'REVIEW_REQUESTED' || c.status === 'IN_REVIEW' || c.legalReview.requestedAt);

  if (currentUser.role === 'team_member') {
    reviewList = reviewList.filter((c) => c.team === currentUser.team);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-800" />
            <span>법무 검토 요청 및 회신 관리</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {currentUser.role === 'legal_manager'
              ? '전사 각 팀에서 요청한 법무 검토 건들을 확인하고 피드백을 회신합니다.'
              : `소속 부서(${currentUser.team})의 법무 검토 요청 진행 현황입니다.`}
          </p>
        </div>
        <div className="text-xs bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded font-medium">
          검토 대상 총 <span className="font-bold">{reviewList.length}</span>건
        </div>
      </div>

      {reviewList.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">진행 중인 법무 검토 요청이 없습니다</h3>
          <p className="text-xs text-zinc-500">새로운 계약서 작성 후 법무 검토를 요청해주세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4">계약서명</th>
                <th className="py-3 px-4">요청 부서 / 담당자</th>
                <th className="py-3 px-4">계약상대방</th>
                <th className="py-3 px-4">요청일</th>
                <th className="py-3 px-4">검토 상태</th>
                <th className="py-3 px-4 text-right">검토 및 회신</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {reviewList.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => onSelectContract(contract)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-900">{contract.title}</div>
                    <div className="text-xs text-zinc-500">{contract.category}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-medium text-zinc-900">{contract.team}</span>
                    <span className="text-zinc-500 block">{contract.legalReview.requestedBy || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-zinc-800">
                    <div className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{contract.counterpart}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{contract.legalReview.requestedAt || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {contract.legalReview.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 승인완료
                      </span>
                    ) : contract.legalReview.status === 'REVISION_NEEDED' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> 수정요청
                      </span>
                    ) : contract.legalReview.status === 'IN_REVIEW' ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                        <Clock className="w-3.5 h-3.5" /> 법무검토중
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-zinc-600 font-medium">
                        <Clock className="w-3.5 h-3.5" /> 검토대기
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectContract(contract)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{currentUser.role === 'legal_manager' ? '검토 및 회신' : '검토 내용 확인'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
