import React, { useState } from 'react';
import { ContractItem, User } from '../types';
import { CheckCircle2, Building, Calendar, Eye, FileText, Upload, Plus } from 'lucide-react';

interface SignedQueueProps {
  contracts: ContractItem[];
  currentUser: User;
  onSelectContract: (contract: ContractItem) => void;
  onUpdateContract: (contract: ContractItem) => void;
}

export const SignedQueue: React.FC<SignedQueueProps> = ({
  contracts,
  currentUser,
  onSelectContract,
  onUpdateContract,
}) => {
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null);
  const [signedFileName, setSignedFileName] = useState<string>('');

  // Filter signed or approved contracts where team members can upload signed doc
  const accessibleContracts = contracts.filter((c) => {
    const isApprovedOrCompleted = c.status === 'REVIEW_COMPLETED' || c.status === 'SIGNED' || c.legalReview.status === 'APPROVED';
    if (currentUser.role === 'team_member') {
      return isApprovedOrCompleted && c.team === currentUser.team;
    }
    return isApprovedOrCompleted;
  });

  const handleUploadSignedDoc = (contract: ContractItem, e: React.FormEvent) => {
    e.preventDefault();
    if (!signedFileName.trim()) return;

    const updated: ContractItem = {
      ...contract,
      status: 'SIGNED',
      signedDocument: {
        fileName: signedFileName.endsWith('.pdf') ? signedFileName : `${signedFileName}.pdf`,
        fileSize: '2.5 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser.name,
        isSigned: true,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateContract(updated);
    setUploadingContractId(null);
    setSignedFileName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>체결 완료함 (날인본 관리)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {currentUser.role === 'team_member' ? `${currentUser.team} 소속` : '전사'} 최종 승인 완료된 계약 건에 대해 서명/날인 완료된 최종 계약서 파일을 업로드하고 관리합니다.
          </p>
        </div>
        <div className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded font-medium">
          체결 완료 대상 총 <span className="font-bold">{accessibleContracts.length}</span>건
        </div>
      </div>

      {accessibleContracts.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-900 mb-1">체결 완료 대기 중인 계약서가 없습니다</h3>
          <p className="text-xs text-zinc-500">법무 최종 승인이 완료된 계약 건이 이곳에 표시되며, 날인본을 등록할 수 있습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4">계약서명</th>
                <th className="py-3 px-4">소속 부서</th>
                <th className="py-3 px-4">계약상대방</th>
                <th className="py-3 px-4">최종 승인일</th>
                <th className="py-3 px-4">날인본 상태</th>
                <th className="py-3 px-4 text-right">관리 / 업로드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {accessibleContracts.map((contract) => {
                const hasSigned = contract.signedDocument?.isSigned;
                return (
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
                      {hasSigned ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 날인본 등록완료 ({contract.signedDocument?.fileName})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded text-xs font-medium">
                          <Upload className="w-3.5 h-3.5" /> 날인본 미등록 (등록 필요)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {currentUser.role === 'team_member' && !hasSigned && (
                          <button
                            onClick={() => {
                              setUploadingContractId(contract.id);
                              setSignedFileName(`${contract.title}_날인완료본.pdf`);
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>날인본 업로드</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectContract(contract)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>상세 보기</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal inline or popup if uploadingContractId is set */}
      {uploadingContractId && (
        <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 w-full max-w-md p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-900">날인 완료본 계약서 업로드</h3>
            <p className="text-xs text-zinc-500">
              서명이 완료된 최종 계약서 파일명을 입력하고 등록하세요.
            </p>
            <form
              onSubmit={(e) => {
                const targetContract = contracts.find((c) => c.id === uploadingContractId);
                if (targetContract) handleUploadSignedDoc(targetContract, e);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">날인본 파일명</label>
                <input
                  type="text"
                  value={signedFileName}
                  onChange={(e) => setSignedFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadingContractId(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded transition-colors"
                >
                  업로드 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
