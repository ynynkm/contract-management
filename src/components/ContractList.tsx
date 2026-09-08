import React, { useState } from 'react';
import { ContractItem, Team, User } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Building, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  ChevronRight,
  Eye,
  GitCompare
} from 'lucide-react';

interface ContractListProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
  onCompareRenewal: (contract: ContractItem) => void;
  onRequestReview: (contract: ContractItem) => void;
  searchTerm: string;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  currentUser,
  onSelectContract,
  onCompareRenewal,
  onRequestReview,
  searchTerm,
}) => {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Permission filtering: if team member, only show their team's contracts
  let filtered = contracts.filter((c) => {
    if (currentUser.role === 'team_member') {
      return c.team === currentUser.team;
    }
    return true;
  });

  // Team filter for legal manager
  if (selectedTeamFilter !== 'ALL' && currentUser.role === 'legal_manager') {
    filtered = filtered.filter((c) => c.team === selectedTeamFilter);
  }

  // Status filter
  if (selectedStatusFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.status === selectedStatusFilter);
  }

  // Category filter
  if (selectedCategoryFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.category === selectedCategoryFilter);
  }

  // Search filter
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.counterpart.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.amount.toLowerCase().includes(term)
    );
  }

  const categories = Array.from(new Set(contracts.map((c) => c.category)));

  const getStatusBadge = (status: ContractItem['status']) => {
    switch (status) {
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 text-white">
            <CheckCircle2 className="w-3 h-3" /> 날인완료
          </span>
        );
      case 'REVIEW_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> 법무검토요청
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> 법무검토중
          </span>
        );
      case 'REVIEW_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> 검토완료
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200 text-zinc-600">
            <AlertCircle className="w-3 h-3" /> 기간만료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
            작성중
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Filter (Legal Manager only) */}
          {currentUser.role === 'legal_manager' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-zinc-500">부서:</span>
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="ALL">전체 부서</option>
                <option value="영업1팀">영업1팀</option>
                <option value="인사팀">인사팀</option>
                <option value="재무팀">재무팀</option>
                <option value="개발팀">개발팀</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-zinc-500">카테고리:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-zinc-500">상태:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 상태</option>
              <option value="REVIEW_REQUESTED">법무검토요청</option>
              <option value="IN_REVIEW">법무검토중</option>
              <option value="REVIEW_COMPLETED">검토완료</option>
              <option value="SIGNED">날인완료</option>
              <option value="EXPIRED">만료됨</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          총 <span className="font-semibold text-zinc-900">{filtered.length}</span>건의 계약서 조회됨
        </div>
      </div>

      {/* Contract Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">조건에 일치하는 계약서가 없습니다</h3>
          <p className="text-xs text-zinc-500">검색어 및 필터를 변경하거나 새 계약서를 등록해주세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                  <th className="py-3 px-4">계약서명 / 카테고리</th>
                  <th className="py-3 px-4">계약상대방</th>
                  <th className="py-3 px-4">소속 부서</th>
                  <th className="py-3 px-4">계약 기간</th>
                  <th className="py-3 px-4">금액</th>
                  <th className="py-3 px-4">법무 검토</th>
                  <th className="py-3 px-4">상태</th>
                  <th className="py-3 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm">
                {filtered.map((contract) => {
                  const isRenewal = contract.version > 1;
                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectContract(contract)}
                    >
                      {/* Title & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 group-hover:text-zinc-950">
                            {contract.title}
                          </span>
                          {isRenewal && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                              <GitBranch className="w-3 h-3" /> v{contract.version} 갱신
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{contract.category}</div>
                      </td>

                      {/* Counterpart */}
                      <td className="py-3.5 px-4 text-xs font-medium text-zinc-800">
                        <div className="flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{contract.counterpart}</span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                          {contract.team}
                        </span>
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>
                            {contract.startDate} ~ {contract.endDate}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-900">
                        {contract.amount}
                      </td>

                      {/* Legal Review Status */}
                      <td className="py-3.5 px-4 text-xs">
                        {contract.legalReview.status === 'APPROVED' ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 승인완료
                          </span>
                        ) : contract.legalReview.status === 'REVISION_NEEDED' ? (
                          <span className="text-amber-700 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> 수정요청
                          </span>
                        ) : contract.legalReview.status === 'IN_REVIEW' ? (
                          <span className="text-blue-700 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 검토중
                          </span>
                        ) : (
                          <span className="text-zinc-500">대기중</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">{getStatusBadge(contract.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          {isRenewal && (
                            <button
                              onClick={() => onCompareRenewal(contract)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                              title="갱신 계약 전후 비교 (노란색 하이라이트)"
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">비교</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSelectContract(contract)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            title="상세 보기"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">상세</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
