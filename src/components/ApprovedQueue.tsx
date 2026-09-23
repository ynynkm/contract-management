import React from 'react';
import { ContractItem, User } from '../types';
import { CheckCircle2, Building, Calendar, Eye, FileText, CheckSquare } from 'lucide-react';

interface ApprovedQueueProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
}

export const ApprovedQueue: React.FC<ApprovedQueueProps> = ({
  contracts,
  currentUser,
  onSelectContract,
}) => {
  // Filter approved contracts
  const approvedList = contracts.filter((c) => {
    const isApproved = c.status === 'REVIEW_COMPLETED' || c.status === 'SIGNED' || c.legalReview.status === 'APPROVED';
    if (currentUser.role === 'team_member' || currentUser.role === 'team_leader') {
      return isApproved && c.team === currentUser.team;
    }
    return isApproved;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>최종 승인 완료함</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {currentUser.role === 'team_member' || currentUser.role === 'team_leader' ? `${currentUser.team} 소속` : '전사'} 계약 중 법무 검토 및 법무담당 최종 승인이 완료된 계약서 목록입니다.
          </p>
        </div>
        <div className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded font-medium">
          최종 승인 완료 총 <span className="font-bold">{approvedList.length}</span>건
        </div>
      </div>

      {approvedList.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">최종 승인 완료된 계약서가 없습니다</h3>
          <p className="text-xs text-zinc-500">법무 검토와 최종 승인이 완료된 계약 건이 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4">계약서명</th>
                <th className="py-3 px-4">소속 부서</th>
                <th className="py-3 px-4">계약상대방</th>
                <th className="py-3 px-4">법무담당 승인일</th>
                <th className="py-3 px-4">날인 상태</th>
                <th className="py-3 px-4 text-right">상세 확인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {approvedList.map((contract) => (
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
                      <span>{contract.legalReview.supervisorApprovedAt || contract.updatedAt}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {contract.signedDocument?.isSigned ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" /> 날인 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded text-[11px] font-medium">
                        ⏳ 날인 미완료
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectContract(contract)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>상세 보기</span>
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
