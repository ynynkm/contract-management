import React, { useState } from 'react';
import { ContractItem, Team, User } from '../types';
import { X, FilePlus, GitBranch, Paperclip, Upload } from 'lucide-react';

interface ContractFormModalProps {
  currentUser: User;
  allContracts: ContractItem[];
  onClose: () => void;
  onSaveContract: (newContract: ContractItem) => void;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  currentUser,
  allContracts,
  onClose,
  onSaveContract,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [counterpart, setCounterpart] = useState('');
  const [team, setTeam] = useState<Team>(currentUser.team);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState('10,000,000 KRW');
  
  // New fields requested by user
  const [contractFileName, setContractFileName] = useState('계약서_초안_첨부파일.pdf');
  const [background, setBackground] = useState('');
  const [keyContent, setKeyContent] = useState('');
  const [requestDetails, setRequestDetails] = useState('');

  const [isRenewal, setIsRenewal] = useState(false);
  const [parentId, setParentId] = useState('');
  const [previousContractFile, setPreviousContractFile] = useState<{ fileName: string; fileSize: string; uploadedAt: string; uploadedBy: string } | undefined>(undefined);

  const existingCategories = Array.from(new Set(allContracts.map((c) => c.category)));
  const existingCounterparts = Array.from(new Set(allContracts.map((c) => c.counterpart)));

  const handleParentChange = (id: string) => {
    setParentId(id);
    const parent = allContracts.find((c) => c.id === id);
    if (parent) {
      setCounterpart(parent.counterpart);
      setCategory(parent.category);
      setPreviousContractFile(parent.contractFile);
      setTitle(`${parent.counterpart} 계약서 (갱신)`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !counterpart.trim() || !background.trim() || !keyContent.trim()) {
      alert('필수 항목(계약서명, 계약상대방, 계약 체결 배경, 주요 내용)을 모두 입력해주세요.');
      return;
    }

    const parentContract = parentId ? allContracts.find((c) => c.id === parentId) : null;
    const version = parentContract ? parentContract.version + 1 : 1;

    const newContract: ContractItem = {
      id: `cnt-${Date.now()}`,
      title,
      category: category || '일반 계약',
      counterpart,
      team: currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor' ? team : currentUser.team,
      version,
      parentId: parentId || undefined,
      startDate,
      endDate,
      amount,
      contractFile: {
        fileName: contractFileName,
        fileSize: '2.5 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser.name
      },
      previousContractFile: previousContractFile || (parentContract ? parentContract.contractFile : undefined),
      status: 'DRAFT',
      legalReview: {
        background,
        keyContent,
        requestDetails,
        status: 'PENDING',
        requestedBy: `${currentUser.name} (${currentUser.team})`,
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveContract(newContract);
    alert('새 계약서가 성공적으로 등록되었습니다. 법무 검토를 요청하실 수 있습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-zinc-200 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">새 계약서 등록 및 갱신</h2>
              <p className="text-xs text-zinc-500">계약서 파일을 첨부하고 체결 배경과 주요 검토 요청사항을 작성합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Renewal Checkbox */}
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-zinc-700" />
              <span className="text-xs font-semibold text-zinc-900">동일 상대방 갱신 계약서 작성 여부</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRenewal}
                onChange={(e) => {
                  setIsRenewal(e.target.checked);
                  if (!e.target.checked) {
                    setParentId('');
                    setPreviousContractFile(undefined);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
            </label>
          </div>

          {/* If renewal, select parent contract */}
          {isRenewal && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">이전 계약서 선택 (갱신 원본)</label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">-- 이전 계약서를 선택하세요 --</option>
                {allContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.team}] {c.counterpart} - {c.title} (v{c.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">계약서명 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 클라우드 인프라 사용 계약 (2차 갱신)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                required
              />
            </div>

            {/* Counterpart */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">계약상대방 *</label>
              <input
                type="text"
                value={counterpart}
                onChange={(e) => setCounterpart(e.target.value)}
                placeholder="예: (주)클라우드맥스"
                list="counterpart-list"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                required
              />
              <datalist id="counterpart-list">
                {existingCounterparts.map((cp) => (
                  <option key={cp} value={cp} />
                ))}
              </datalist>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">카테고리 *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: IT 인프라 및 소프트웨어"
                list="category-list"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                required
              />
              <datalist id="category-list">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            {/* Team */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">소속 부서</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Team)}
                disabled={currentUser.role === 'team_member'}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-60"
              >
                <option value="영업1팀">영업1팀</option>
                <option value="인사팀">인사팀</option>
                <option value="재무팀">재무팀</option>
                <option value="개발팀">개발팀</option>
                <option value="법무담당">법무담당</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">계약 금액</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="예: 50,000,000 KRW"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">계약 시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">계약 종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Contract File Attachment (Replacing text content) */}
            <div className="space-y-1 sm:col-span-2 bg-zinc-50 border border-zinc-200 p-3.5 rounded-md">
              <label className="block text-xs font-semibold text-zinc-800 mb-1 flex items-center space-x-1.5">
                <Paperclip className="w-4 h-4 text-zinc-600" />
                <span>계약서 파일 첨부 *</span>
              </label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-medium px-3 py-2 rounded-md flex items-center space-x-1.5 transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>파일 선택</span>
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-xs text-zinc-700 font-mono bg-white px-2.5 py-1.5 border border-zinc-200 rounded flex-1">
                  {contractFileName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                원문 조항 텍스트 대신 법무 검토용 계약서 파일(PDF 또는 Word)을 첨부해 주세요.
              </p>
            </div>

            {/* Contract Background (계약 체결의 배경) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">계약 체결의 배경 *</label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="본 계약을 체결하게 된 사업적 배경 및 목적을 기재하세요."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                rows={2}
                required
              />
            </div>

            {/* Key Content (주요 내용) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">주요 내용 요약 *</label>
              <textarea
                value={keyContent}
                onChange={(e) => setKeyContent(e.target.value)}
                placeholder="계약 금액, 기간, 주요 권리 및 의무 등 핵심 내용을 요약하세요."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                rows={3}
                required
              />
            </div>

            {/* Review Request Details (검토 요청사항) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">법무담당 검토 요청사항</label>
              <textarea
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                placeholder="법무담당에서 특별히 검토하거나 수정했으면 하는 조항이나 리스크 요소를 기재하세요."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                rows={2}
              />
            </div>

          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-medium px-4 py-2 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-md transition-colors"
            >
              등록하기
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
