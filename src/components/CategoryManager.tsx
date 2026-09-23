import React, { useState } from 'react';
import { ContractItem, User } from '../types';
import { 
  FolderTree, 
  Building2, 
  GitBranch, 
  Calendar, 
  Eye, 
  GitCompare, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Building, 
  RotateCcw,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface CategoryManagerProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
  onCompareRenewal: (contract: ContractItem) => void;
  searchTerm?: string;
  onUpdateContract?: (contract: ContractItem) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  contracts,
  currentUser,
  onSelectContract,
  onCompareRenewal,
  searchTerm: globalSearch = '',
}) => {
  const [viewMode, setViewMode] = useState<'category' | 'counterpart'>('category');
  const [localSearch, setLocalSearch] = useState<string>(globalSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCounterpart, setSelectedCounterpart] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  
  // Track open/collapsed state of cards
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Base accessible list by team permission
  let accessible = contracts;
  if (currentUser.role === 'team_member' || currentUser.role === 'team_leader') {
    accessible = contracts.filter((c) => c.team === currentUser.team);
  }

  // Extract unique filter options
  const allCategories = Array.from(new Set(accessible.map((c) => c.category))).filter((x): x is string => Boolean(x));
  const allCounterparts = Array.from(new Set(accessible.map((c) => c.counterpart))).filter((x): x is string => Boolean(x));
  const allTeams = Array.from(new Set(accessible.map((c) => c.team))).filter((x): x is string => Boolean(x));

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    setCollapsedSections({});
  };

  const collapseAll = () => {
    const allKeys: Record<string, boolean> = {};
    if (viewMode === 'category') {
      allCategories.forEach(cat => {
        allKeys[cat] = true;
      });
    } else {
      allCounterparts.forEach(cp => {
        allKeys[cp] = true;
      });
    }
    setCollapsedSections(allKeys);
  };

  // Apply filters
  let filtered = accessible;

  if (selectedCategory !== 'ALL') {
    filtered = filtered.filter((c) => c.category === selectedCategory);
  }
  if (selectedCounterpart !== 'ALL') {
    filtered = filtered.filter((c) => c.counterpart === selectedCounterpart);
  }
  if (selectedTeam !== 'ALL') {
    filtered = filtered.filter((c) => c.team === selectedTeam);
  }

  const activeSearch = localSearch.trim().toLowerCase();
  if (activeSearch !== '') {
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(activeSearch) ||
        c.counterpart.toLowerCase().includes(activeSearch) ||
        c.category.toLowerCase().includes(activeSearch) ||
        c.amount.toLowerCase().includes(activeSearch) ||
        c.team.toLowerCase().includes(activeSearch)
    );
  }

  // 1. Group by Category -> Counterpart
  const categoryMap: { [category: string]: { [counterpart: string]: ContractItem[] } } = {};
  filtered.forEach((c) => {
    if (!categoryMap[c.category]) {
      categoryMap[c.category] = {};
    }
    if (!categoryMap[c.category][c.counterpart]) {
      categoryMap[c.category][c.counterpart] = [];
    }
    categoryMap[c.category][c.counterpart].push(c);
  });

  // 2. Group by Counterpart -> Category
  const counterpartMap: { [counterpart: string]: { [category: string]: ContractItem[] } } = {};
  filtered.forEach((c) => {
    if (!counterpartMap[c.counterpart]) {
      counterpartMap[c.counterpart] = {};
    }
    if (!counterpartMap[c.counterpart][c.category]) {
      counterpartMap[c.counterpart][c.category] = [];
    }
    counterpartMap[c.counterpart][c.category].push(c);
  });

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCounterpart('ALL');
    setSelectedTeam('ALL');
    setLocalSearch('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedCounterpart !== 'ALL' || selectedTeam !== 'ALL' || localSearch.trim() !== '';

  // Summary Metrics
  const totalRenewalContracts = filtered.filter((c) => c.version > 1).length;
  const totalSignedContracts = filtered.filter((c) => c.signedDocument?.isSigned || c.status === 'SIGNED').length;

  const renderStatusBadge = (contract: ContractItem) => {
    if (contract.signedDocument?.isSigned || contract.status === 'SIGNED') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3" /> 날인 완료
        </span>
      );
    }
    if (contract.status === 'REVIEW_COMPLETED' || contract.legalReview?.status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3" /> 승인 완료
        </span>
      );
    }
    if (contract.status === 'PENDING_SUPERVISOR_APPROVAL' || contract.legalReview?.status === 'PENDING_SUPERVISOR_APPROVAL') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium">
          <Clock className="w-3 h-3" /> 승인 대기
        </span>
      );
    }
    if (contract.status === 'IN_REVIEW' || contract.legalReview?.status === 'IN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-medium">
          <Clock className="w-3 h-3" /> 검토중
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[11px] font-medium">
        작성중
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-zinc-800" />
            <span>카테고리 및 계약상대방별 체결·갱신 관리</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            카테고리별 분류 및 계약상대방별 계약 이력(최초 계약부터 갱신 계약까지)을 한눈에 파악하고 전후 비교를 수행할 수 있습니다.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
          <button
            onClick={() => setViewMode('category')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'category'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>카테고리 기준 보기</span>
          </button>
          <button
            onClick={() => setViewMode('counterpart')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'counterpart'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>상대방(거래처) 기준 보기</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-zinc-400" />
            <span>분류 카테고리</span>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">
            {Object.keys(categoryMap).length} <span className="text-xs font-normal text-zinc-500">개 분류</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>계약 상대방</span>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">
            {Object.keys(counterpartMap).length} <span className="text-xs font-normal text-zinc-500">개사</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-amber-500" />
            <span>갱신 계약 건수</span>
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {totalRenewalContracts} <span className="text-xs font-normal text-zinc-500">건</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>체결(날인) 완료</span>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {totalSignedContracts} <span className="text-xs font-normal text-zinc-500">건</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="계약서명, 상대방, 내용 검색..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 카테고리 ({allCategories.length})</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Counterpart Dropdown */}
            <select
              value={selectedCounterpart}
              onChange={(e) => setSelectedCounterpart(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ALL">전체 상대방 ({allCounterparts.length})</option>
              {allCounterparts.map((cp) => (
                <option key={cp} value={cp}>{cp}</option>
              ))}
            </select>

            {/* Team Dropdown (For Legal Roles) */}
            {(currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor') && (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="ALL">전체 부서</option>
                {allTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>필터 초기화</span>
              </button>
            )}
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={expandAll}
              className="text-xs text-zinc-600 hover:text-zinc-900 px-2 py-1 hover:bg-zinc-100 rounded"
            >
              전체 펼치기
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-zinc-600 hover:text-zinc-900 px-2 py-1 hover:bg-zinc-100 rounded"
            >
              전체 접기
            </button>
          </div>
        </div>
      </div>

      {/* Main List Rendering */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center shadow-sm">
          <FolderTree className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">검색 조건에 일치하는 계약서가 없습니다</h3>
          <p className="text-xs text-zinc-500 mb-4">선택하신 카테고리 또는 상대방 필터 조건을 다시 확인해주세요.</p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            필터 조건 초기화
          </button>
        </div>
      ) : viewMode === 'category' ? (
        /* MODE 1: Grouped by Category */
        <div className="space-y-5">
          {Object.entries(categoryMap).map(([category, counterparts]) => {
            const isCategoryCollapsed = !!collapsedSections[category];
            const totalContractsInCat = Object.values(counterparts).reduce((sum, list) => sum + list.length, 0);

            return (
              <div key={category} className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
                {/* Category Header */}
                <div
                  onClick={() => toggleSection(category)}
                  className="bg-zinc-100 px-5 py-3 border-b border-zinc-200 flex items-center justify-between cursor-pointer hover:bg-zinc-200/70 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    {isCategoryCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-700" />
                    )}
                    <FolderTree className="w-4 h-4 text-zinc-800" />
                    <h3 className="text-sm font-semibold text-zinc-900">{category}</h3>
                    <span className="text-xs text-zinc-500">
                      (상대방 {Object.keys(counterparts).length}개사 / 계약 {totalContractsInCat}건)
                    </span>
                  </div>
                  <span className="text-[11px] bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-300 font-medium">
                    {isCategoryCollapsed ? '펼치기' : '접기'}
                  </span>
                </div>

                {/* Counterparts inside Category */}
                {!isCategoryCollapsed && (
                  <div className="p-5 space-y-4 divide-y divide-zinc-100">
                    {Object.entries(counterparts).map(([counterpart, counterpartContracts]) => {
                      const sorted = [...counterpartContracts].sort((a, b) => a.version - b.version);
                      const hasRenewal = sorted.length > 1;

                      return (
                        <div key={counterpart} className="pt-4 first:pt-0 space-y-3">
                          {/* Counterpart Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-zinc-700" />
                              <span className="font-semibold text-sm text-zinc-900">{counterpart}</span>
                              <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                                {sorted[0]?.team}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              {hasRenewal && (
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-[11px]">
                                  🔄 갱신 계약 {sorted.length - 1}회 진행됨
                                </span>
                              )}
                              <span className="text-zinc-600 font-medium">
                                총 {sorted.length}건의 계약 이력
                              </span>
                            </div>
                          </div>

                          {/* Version Tree Timeline */}
                          <div className="pl-4 sm:pl-6 space-y-3 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
                            {sorted.map((contract, idx) => (
                              <div
                                key={contract.id}
                                className="relative bg-white p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                              >
                                <div className="flex items-start sm:items-center space-x-3">
                                  {/* Version Pill */}
                                  <span
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      contract.version === 1
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-amber-500 text-white shadow-xs'
                                    }`}
                                  >
                                    v{contract.version}
                                  </span>

                                  <div>
                                    <div className="font-medium text-xs text-zinc-900 flex items-center gap-2">
                                      <span className="font-semibold">{contract.title}</span>
                                      {idx > 0 && (
                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                          v{sorted[idx - 1].version} 갱신본
                                        </span>
                                      )}
                                      {renderStatusBadge(contract)}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-2 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-zinc-400" />
                                        {contract.startDate} ~ {contract.endDate}
                                      </span>
                                      <span>•</span>
                                      <span className="font-semibold text-zinc-800">{contract.amount}</span>
                                      <span>•</span>
                                      <span className="text-zinc-500">담당: {contract.team}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                                  {contract.version > 1 && (
                                    <button
                                      onClick={() => onCompareRenewal(contract)}
                                      className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                      title="이전 계약과 전·후 비교 분석"
                                    >
                                      <GitCompare className="w-3.5 h-3.5" />
                                      <span>전후 비교</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onSelectContract(contract)}
                                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>상세 보기</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 2: Grouped by Counterparty */
        <div className="space-y-5">
          {Object.entries(counterpartMap).map(([counterpart, categories]) => {
            const isCounterpartCollapsed = !!collapsedSections[counterpart];
            const allContractsForCp = Object.values(categories).flat();
            const totalCount = allContractsForCp.length;
            const primaryTeam = allContractsForCp[0]?.team || '-';

            return (
              <div key={counterpart} className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
                {/* Counterpart Header */}
                <div
                  onClick={() => toggleSection(counterpart)}
                  className="bg-zinc-100 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between cursor-pointer hover:bg-zinc-200/70 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    {isCounterpartCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-700" />
                    )}
                    <Building2 className="w-4 h-4 text-zinc-900" />
                    <h3 className="text-sm font-bold text-zinc-900">{counterpart}</h3>
                    <span className="text-xs bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-medium">
                      {primaryTeam}
                    </span>
                    <span className="text-xs text-zinc-500">
                      (카테고리 {Object.keys(categories).length}개 분야 / 누적 계약 {totalCount}건)
                    </span>
                  </div>
                  <span className="text-[11px] bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-300 font-medium">
                    {isCounterpartCollapsed ? '펼치기' : '접기'}
                  </span>
                </div>

                {/* Categories inside Counterpart */}
                {!isCounterpartCollapsed && (
                  <div className="p-5 space-y-4 divide-y divide-zinc-100">
                    {Object.entries(categories).map(([category, catContracts]) => {
                      const sorted = [...catContracts].sort((a, b) => a.version - b.version);
                      return (
                        <div key={category} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between pb-1">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-800">
                              <FolderTree className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{category}</span>
                            </div>
                            <span className="text-[11px] text-zinc-500 font-normal">
                              이 카테고리 내 계약 {sorted.length}건
                            </span>
                          </div>

                          {/* Version Tree */}
                          <div className="space-y-2 pl-2">
                            {sorted.map((contract, idx) => (
                              <div
                                key={contract.id}
                                className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                              >
                                <div className="flex items-center space-x-3">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      contract.version === 1 ? 'bg-zinc-900 text-white' : 'bg-amber-500 text-white'
                                    }`}
                                  >
                                    v{contract.version}
                                  </span>
                                  <div>
                                    <div className="font-medium text-xs text-zinc-900 flex items-center gap-2">
                                      <span>{contract.title}</span>
                                      {idx > 0 && (
                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                          갱신 계약
                                        </span>
                                      )}
                                      {renderStatusBadge(contract)}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-zinc-400" />
                                        {contract.startDate} ~ {contract.endDate}
                                      </span>
                                      <span>•</span>
                                      <span className="font-semibold text-zinc-700">{contract.amount}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                                  {contract.version > 1 && (
                                    <button
                                      onClick={() => onCompareRenewal(contract)}
                                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                      title="이전 계약과 전·후 비교"
                                    >
                                      <GitCompare className="w-3.5 h-3.5" />
                                      <span>전후 비교</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onSelectContract(contract)}
                                    className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>상세</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
