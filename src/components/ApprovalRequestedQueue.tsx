import React from 'react';
import { ContractItem, User } from '../types';
import { Clock, Building, Calendar, Eye, CheckSquare, Send } from 'lucide-react';

interface ApprovalRequestedQueueProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
}

export const ApprovalRequestedQueue: React.FC<ApprovalRequestedQueueProps> = ({
  contracts,
  currentUser,
  onSelectContract,
}) => {
  // Contracts where legal manager has completed review and requested supervisor approval
  const requestedList = contracts.filter(
    (c) => c.status === 'PENDING_SUPERVISOR_APPROVAL' || c.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>법무관리자 승인 요청함</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            법무관리자가 검토를 완료한 후 법무담당에게 최종 승인을 요청하여, 아직 최종 승인이 완료되기 전인 계약서 목록입니다.
          </p>
        </div>
        <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded font-medium">
          승인 대기 중 총 <span className="font-bold">{requestedList.length}</span>건
        </div>
      </div>

      {requestedList.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">법무담당 승인 대기 중인 계약 건이 없습니다</h3>
          <p className="text-xs text-zinc-500">법무관리자가 검토 후 승인 요청한 건이 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4">계약서명</th>
                <th className="py-3 px-4">요청 부서</th>
                <th className="py-3 px-4">계약상대방</th>
                <th className="py-3 px-4">법무관리자 검토일</th>
                <th className="py-3 px-4">진행 상태</th>
                <th className="py-3 px-4 text-right">상세 확인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {requestedList.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => onSelectContract(contract)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-900">{contract.title}</div>
                    <div className="text-xs text-zinc-500">{contract.category}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-zinc-900">
                    {contract.team}
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
                      <span>{contract.legalReview.reviewedAt || contract.updatedAt}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium text-[11px]">
                      <CheckSquare className="w-3 h-3" /> 법무담당 최종승인 대기중
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectContract(contract)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>내용 확인</span>
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
