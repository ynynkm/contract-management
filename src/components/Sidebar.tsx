import React from 'react';
import { FileText, ShieldCheck, FolderTree, PlusCircle, CheckSquare, CheckCircle2, Send } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenNewModal: () => void;
  contractCount: number;
  pendingReviewCount: number;
  approvedCount: number;
  supervisorApprovalCount: number;
  approvalRequestedCount: number;
  signedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenNewModal,
  contractCount,
  pendingReviewCount,
  approvedCount,
  supervisorApprovalCount,
  approvalRequestedCount,
  signedCount,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* New Contract Button */}
      {currentUser.role === 'team_member' && (
        <button
          onClick={onOpenNewModal}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm py-2.5 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>새 계약서 등록</span>
        </button>
      )}

      {/* Navigation Menu */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          계약서 관리
        </div>

        {/* 1. Contract List */}
        <button
          onClick={() => setActiveTab('list')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>
              {currentUser.role === 'team_member' ? `${currentUser.team} 계약서` : '전체 계약서'}
            </span>
          </div>
          <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
            {contractCount}
          </span>
        </button>

        {/* 2. Legal Review Queue (법무 검토 요청함) */}
        <button
          onClick={() => setActiveTab('legal_queue')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'legal_queue'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>법무 검토 요청함</span>
          </div>
          <div className="flex items-center gap-1">
            {currentUser.role === 'team_member' && approvedCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                {approvedCount}
              </span>
            )}
            {(currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor') && pendingReviewCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                {pendingReviewCount}
              </span>
            )}
          </div>
        </button>

        {/* 3. Legal Manager: 승인 요청함 */}
        {currentUser.role === 'legal_manager' && (
          <button
            onClick={() => setActiveTab('approval_requested_queue')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'approval_requested_queue'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Send className="w-4 h-4 text-zinc-500" />
              <span>승인 요청함</span>
            </div>
            {approvalRequestedCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                {approvalRequestedCount}
              </span>
            )}
          </button>
        )}

        {/* 4. Legal Supervisor Queue */}
        {currentUser.role === 'legal_supervisor' && (
          <button
            onClick={() => setActiveTab('supervisor_queue')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'supervisor_queue'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <CheckSquare className="w-4 h-4 text-zinc-500" />
              <span>승인 요청함</span>
            </div>
            {supervisorApprovalCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                {supervisorApprovalCount}
              </span>
            )}
          </button>
        )}

        {/* 5. Final Approved Queue (최종 승인 완료함) for Legal Manager & Supervisor */}
        {(currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor') && (
          <button
            onClick={() => setActiveTab('approved_queue')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'approved_queue'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
              <span>최종 승인 완료함</span>
            </div>
            {approvedCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                {approvedCount}
              </span>
            )}
          </button>
        )}

        {/* 6. Signed Queue (체결 완료함) for All Roles */}
        <button
          onClick={() => setActiveTab('signed_queue')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'signed_queue'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>체결 완료함</span>
          </div>
          {signedCount > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
              {signedCount}
            </span>
          )}
        </button>

        {/* 7. Category & Counterpart Manager */}
        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <FolderTree className="w-4 h-4 text-zinc-500" />
            <span>카테고리 및 상대방별</span>
          </div>
        </button>
      </div>

      {/* User Context Footer Notice */}
      <div className="mt-auto pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-1 bg-zinc-50 p-3 rounded-md">
        <div className="font-semibold text-zinc-700">권한 안내</div>
        <p>
          {currentUser.role === 'legal_manager'
            ? '법무관리자: 법무 검토 회신, 승인 요청함 및 체결 완료함 관리'
            : currentUser.role === 'legal_supervisor'
            ? '법무담당: 최종 승인 완료함 및 체결 완료함 관리'
            : `${currentUser.team} 소속 계정: 부서장 승인 후 법무 검토 요청 및 체결 완료함 관리`}
        </p>
      </div>
    </aside>
  );
};
