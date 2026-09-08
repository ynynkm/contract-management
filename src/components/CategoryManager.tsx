import React from 'react';
import { ContractItem, User } from '../types';
import { FolderTree, Building, GitBranch, Calendar, Eye, GitCompare } from 'lucide-react';

interface CategoryManagerProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
  onCompareRenewal: (contract: ContractItem) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  contracts,
  currentUser,
  onSelectContract,
  onCompareRenewal,
}) => {
  let accessible = contracts;
  if (currentUser.role === 'team_member') {
    accessible = contracts.filter((c) => c.team === currentUser.team);
  }

  // Group by category, then by counterpart
  const categoryMap: { [category: string]: { [counterpart: string]: ContractItem[] } } = {};

  accessible.forEach((c) => {
    if (!categoryMap[c.category]) {
      categoryMap[c.category] = {};
    }
    if (!categoryMap[c.category][c.counterpart]) {
      categoryMap[c.category][c.counterpart] = [];
    }
    categoryMap[c.category][c.counterpart].push(c);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-zinc-800" />
            <span>카테고리 및 계약상대방별 갱신 트리 구조</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            동일한 계약상대방과 체결된 최초 계약 및 갱신 계약서들이 하나의 스레드로 체계적으로 정리되어 있습니다.
          </p>
        </div>
      </div>

      {Object.keys(categoryMap).length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FolderTree className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">등록된 카테고리가 없습니다</h3>
          <p className="text-xs text-zinc-500">계약서를 등록하면 카테고리별로 자동 분류됩니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categoryMap).map(([category, counterparts]) => (
            <div key={category} className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
              <div className="bg-zinc-100 px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-zinc-700" />
                  <span>{category}</span>
                </h3>
                <span className="text-xs bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-300 font-medium">
                  상대방 {Object.keys(counterparts).length}개사
                </span>
              </div>

              <div className="divide-y divide-zinc-200 p-4 space-y-4">
                {Object.entries(counterparts).map(([counterpart, counterpartContracts]) => {
                  // Sort by version ascending
                  const sorted = [...counterpartContracts].sort((a, b) => a.version - b.version);
                  return (
                    <div key={counterpart} className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-zinc-700" />
                          <span className="font-semibold text-sm text-zinc-900">{counterpart}</span>
                          <span className="text-xs text-zinc-500">({sorted[0].team})</span>
                        </div>
                        <span className="text-xs bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-medium">
                          총 {sorted.length}건의 계약 이력
                        </span>
                      </div>

                      {/* Timeline of versions */}
                      <div className="space-y-2 pl-2">
                        {sorted.map((contract, idx) => (
                          <div
                            key={contract.id}
                            className="bg-white p-3 rounded border border-zinc-200 flex items-center justify-between hover:border-zinc-400 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
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
                                </div>
                                <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {contract.startDate} ~ {contract.endDate}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-zinc-700">{contract.amount}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {contract.version > 1 && (
                                <button
                                  onClick={() => onCompareRenewal(contract)}
                                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                  title="전후 계약 비교 및 노란색 하이라이트"
                                >
                                  <GitCompare className="w-3.5 h-3.5" />
                                  <span>전후 비교</span>
                                </button>
                              )}
                              <button
                                onClick={() => onSelectContract(contract)}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
