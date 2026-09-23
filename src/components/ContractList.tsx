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
  GitCompare,
  ArrowUpDown,
  RotateCcw
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
  const [selectedCounterpartFilter, setSelectedCounterpartFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'endDate' | 'amount' | 'title'>('latest');

  // Permission filtering: if team member or leader, only show their team's contracts
  let filtered = contracts.filter((c) => {
    if (currentUser.role === 'team_member' || currentUser.role === 'team_leader') {
      return c.team === currentUser.team;
    }
    return true;
  });

  // Extract unique counterparties and categories based on accessible contracts
  const categories = Array.from(new Set(filtered.map((c) => c.category))).filter((x): x is string => Boolean(x));
  const counterparts = Array.from(new Set(filtered.map((c) => c.counterpart))).filter((x): x is string => Boolean(x));

  // Team filter for legal roles
  if (selectedTeamFilter !== 'ALL' && (currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor')) {
    filtered = filtered.filter((c) => c.team === selectedTeamFilter);
  }

  // Category filter
  if (selectedCategoryFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.category === selectedCategoryFilter);
  }

  // Counterparty filter
  if (selectedCounterpartFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.counterpart === selectedCounterpartFilter);
  }

  // Status filter
  if (selectedStatusFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.status === selectedStatusFilter);
  }

  // Search filter
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.counterpart.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.amount.toLowerCase().includes(term) ||
        c.team.toLowerCase().includes(term)
    );
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'endDate') {
      return a.endDate.localeCompare(b.endDate);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'amount') {
      const parseAmount = (val: string) => {
        const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? 0 : num;
      };
      return parseAmount(b.amount) - parseAmount(a.amount);
    }
    // 'latest' default
    return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
  });

  const hasActiveFilters = 
    selectedTeamFilter !== 'ALL' || 
    selectedCategoryFilter !== 'ALL' || 
    selectedCounterpartFilter !== 'ALL' || 
    selectedStatusFilter !== 'ALL';

  const handleResetFilters = () => {
    setSelectedTeamFilter('ALL');
    setSelectedCategoryFilter('ALL');
    setSelectedCounterpartFilter('ALL');
    setSelectedStatusFilter('ALL');
  };

  const getStatusBadge = (status: ContractItem['status']) => {
    switch (status) {
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-white">
            <CheckCircle2 className="w-3 h-3" /> 날인완료
          </span>
        );
      case 'REVIEW_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> 법무검토요청
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> 법무검토중
          </span>
        );
      case 'PENDING_SUPERVISOR_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> 승인대기
          </span>
        );
      case 'REVIEW_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> 검토완료
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-600">
            <AlertCircle className="w-3 h-3" /> 기간만료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
            작성중
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Team Filter (Legal Roles only) */}
          {(currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor') && (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-zinc-500">부서:</span>
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="ALL">전체 부서</option>
                <option value="영업1팀">영업1팀</option>
                <option value="인사팀">인사팀</option>
                <option value="재무팀">재무팀</option>
                <option value="개발팀">개발팀</option>
                <option value="법무담당">법무담당</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-zinc-500">카테고리:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Counterparty Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-zinc-500">상대방:</span>
            <select
              value={selectedCounterpartFilter}
              onChange={(e) => setSelectedCounterpartFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 상대방</option>
              {counterparts.map((cp) => (
                <option key={cp} value={cp}>
                  {cp}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-zinc-500">상태:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 상태</option>
              <option value="REVIEW_REQUESTED">법무검토요청</option>
              <option value="IN_REVIEW">법무검토중</option>
              <option value="PENDING_SUPERVISOR_APPROVAL">승인대기</option>
              <option value="REVIEW_COMPLETED">검토완료</option>
              <option value="SIGNED">날인완료</option>
              <option value="EXPIRED">만료됨</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-zinc-500">정렬:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="latest">최신 등록순</option>
              <option value="endDate">만료일 임박순</option>
              <option value="amount">계약 금액순</option>
              <option value="title">계약서명순</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              title="필터 조건 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-500 shrink-0">
          총 <span className="font-semibold text-zinc-900">{filtered.length}</span>건 조회됨
        </div>
      </div>

      {/* Contract Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">조건에 일치하는 계약서가 없습니다</h3>
          <p className="text-xs text-zinc-500 mb-4">검색어 및 필터를 변경하거나 새 계약서를 등록해주세요.</p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              적용된 필터 해제
            </button>
          )}
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
                      className="hover:bg-zinc-50 transition-colors cursor-pointer"
                      onClick={() => onSelectContract(contract)}
                    >
                      {/* Title & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900">{contract.title}</span>
                          {isRenewal && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              <GitBranch className="w-2.5 h-2.5" /> v{contract.version} 갱신
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
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded font-medium">
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
                        ) : contract.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL' ? (
                          <span className="text-blue-700 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 승인대기
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
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                              title="갱신 계약 전후 비교 (노란색 하이라이트)"
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">비교</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSelectContract(contract)}
                            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
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
