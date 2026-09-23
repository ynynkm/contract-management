import React, { useState, useEffect } from 'react';
import { ContractItem } from '../types';
import { X, GitCompare, Sparkles, Building2, Calendar, FileText, Download } from 'lucide-react';

interface ContractCompareModalProps {
  contract: ContractItem;
  allContracts: ContractItem[];
  onClose: () => void;
}

export const ContractCompareModal: React.FC<ContractCompareModalProps> = ({
  contract,
  allContracts,
  onClose,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary?: string;
    riskLevel?: string;
    keyChanges?: string[];
    highlightSentences?: string[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Find previous contract
  const previousContract = contract.parentId
    ? allContracts.find((c) => c.id === contract.parentId)
    : allContracts.find(
        (c) =>
          c.counterpart === contract.counterpart &&
          c.category === contract.category &&
          c.version === contract.version - 1
      );

  const prevAmount = previousContract?.amount || '(최초 계약 금액 없음)';
  const currAmount = contract.amount;
  const prevBackground = previousContract?.legalReview.background || '(최초 계약 체결)';
  const currBackground = contract.legalReview.background;
  const prevKeyContent = previousContract?.legalReview.keyContent || '(최초 계약 주요 내용)';
  const currKeyContent = contract.legalReview.keyContent;

  // Fetch AI Analysis on mount
  useEffect(() => {
    async function fetchAiAnalysis() {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/ai/analyze-contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractTitle: contract.title,
            amount: currAmount,
            background: currBackground,
            keyContent: currKeyContent,
            previousAmount: prevAmount,
            previousBackground: prevBackground,
            previousKeyContent: prevKeyContent,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiAnalysis(data);
        }
      } catch (err) {
        console.error("AI Analysis failed, using rule-based comparison:", err);
        const amountDiff = currAmount !== prevAmount ? `계약 금액 변동 (${prevAmount} ➔ ${currAmount})` : '계약 금액 동일 유지';
        setAiAnalysis({
          summary: `v${previousContract?.version || 1} 대비 계약 기간 및 주요 내용 갱신이 확인되었습니다. (${amountDiff})`,
          riskLevel: currAmount !== prevAmount ? '주의' : '안전',
          keyChanges: [
            amountDiff,
            `계약 기간: ${previousContract?.startDate || '-'} ~ ${previousContract?.endDate || '-'} ➔ ${contract.startDate} ~ ${contract.endDate}`,
            '신규 체결 배경 및 검토 요청 사항 갱신 반영'
          ],
          highlightSentences: []
        });
      } finally {
        setLoadingAi(false);
      }
    }
    fetchAiAnalysis();
  }, [contract.id]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-zinc-200 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <span>갱신 계약 전·후 비교 분석</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-normal">
                  {contract.counterpart}
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                v{previousContract?.version || 1} ({previousContract?.startDate || '최초'}) vs v{contract.version} ({contract.startDate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Analysis Summary Banner */}
        <div className="bg-zinc-900 text-white px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <span>AI 법무 변경사항 요약</span>
                {aiAnalysis?.riskLevel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-normal ${
                    aiAnalysis.riskLevel === '위험' ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    리스크: {aiAnalysis.riskLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-200 mt-0.5">
                {loadingAi ? 'AI가 전후 계약서 차이점 및 리스크를 분석 중입니다...' : (aiAnalysis?.summary || '변경 계약에 대한 법무 분석이 완료되었습니다.')}
              </p>
            </div>
          </div>
          <div className="text-[11px] bg-zinc-800 text-amber-300 px-3 py-1 rounded border border-zinc-700 shrink-0">
            💡 첨부된 계약서 파일 및 주요 내용 간 변동 사항을 비교합니다.
          </div>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50">
          
          {/* Previous Contract Box */}
          <div className="bg-white rounded-lg border border-zinc-200 p-5 flex flex-col shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>이전 계약서 (v{previousContract?.version || 1})</span>
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{previousContract?.startDate || '-'} ~ {previousContract?.endDate || '-'}</span>
              </div>
            </div>

            {/* Previous Contract File */}
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="font-medium text-zinc-800">
                  {previousContract?.contractFile.fileName || contract.previousContractFile?.fileName || '이전 계약서 원본.pdf'}
                </span>
              </div>
              <span className="text-zinc-500">{previousContract?.contractFile.fileSize || '2.4 MB'}</span>
            </div>

            {/* Amount */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">계약 금액</span>
              <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs font-medium text-zinc-900">
                {prevAmount}
              </div>
            </div>

            {/* Background */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">체결 배경</span>
              <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs text-zinc-700">
                {prevBackground}
              </div>
            </div>

            {/* Key Content */}
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">주요 내용 요약</span>
              <div className="bg-zinc-50 p-3 rounded border border-zinc-200 text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                {prevKeyContent}
              </div>
            </div>
          </div>

          {/* Current / Renewal Contract Box */}
          <div className="bg-white rounded-lg border border-amber-200 p-5 flex flex-col shadow-sm space-y-4 ring-1 ring-amber-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>갱신(현재) 계약서 (v{contract.version})</span>
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{contract.startDate} ~ {contract.endDate}</span>
              </div>
            </div>

            {/* Current Contract File */}
            <div className="bg-amber-50/50 border border-amber-200 p-3 rounded flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-700" />
                <span className="font-medium text-zinc-900">{contract.contractFile.fileName}</span>
              </div>
              <span className="text-zinc-500">{contract.contractFile.fileSize}</span>
            </div>

            {/* Amount (Highlighted if changed) */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">계약 금액 (변동)</span>
              <div className="bg-amber-100/70 p-2.5 rounded border border-amber-300 text-xs font-semibold text-zinc-900">
                {currAmount} {currAmount !== prevAmount && <span className="text-amber-800 text-[10px] ml-1.5 bg-white px-1.5 py-0.5 rounded border border-amber-200">금액 변동</span>}
              </div>
            </div>

            {/* Background */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">체결 배경</span>
              <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs text-zinc-700">
                {currBackground}
              </div>
            </div>

            {/* Key Content */}
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">주요 내용 요약 (갱신 반영)</span>
              <div className="bg-amber-50/40 p-3 rounded border border-amber-200 text-xs text-zinc-900 whitespace-pre-wrap leading-relaxed">
                {currKeyContent}
              </div>
            </div>
          </div>

        </div>

        {/* AI Key Changes bullet points */}
        {aiAnalysis?.keyChanges && aiAnalysis.keyChanges.length > 0 && (
          <div className="px-6 py-3 bg-white border-t border-zinc-200 text-xs text-zinc-700 flex items-center gap-3">
            <span className="font-semibold text-zinc-900 shrink-0">주요 변경 포인트:</span>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.keyChanges.map((change, idx) => (
                <span key={idx} className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded border border-zinc-200">
                  • {change}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-md transition-colors"
          >
            확인 완료
          </button>
        </div>

      </div>
    </div>
  );
};
