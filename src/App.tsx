import React, { useState } from 'react';
import { ContractItem, User } from './types';
import { INITIAL_CONTRACTS, MOCK_USERS } from './data/mockContracts';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContractList } from './components/ContractList';
import { LegalReviewQueue } from './components/LegalReviewQueue';
import { SupervisorQueue } from './components/SupervisorQueue';
import { ApprovedQueue } from './components/ApprovedQueue';
import { ApprovalRequestedQueue } from './components/ApprovalRequestedQueue';
import { SignedQueue } from './components/SignedQueue';
import { CategoryManager } from './components/CategoryManager';
import { ContractDetailModal } from './components/ContractDetailModal';
import { ContractCompareModal } from './components/ContractCompareModal';
import { ContractFormModal } from './components/ContractFormModal';

export default function App() {
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default: 김영업 (영업1팀)
  const [activeTab, setActiveTab] = useState<string>('list'); // 'list' | 'legal_queue' | 'supervisor_queue' | 'approval_requested_queue' | 'approved_queue' | 'signed_queue' | 'categories'
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [compareContract, setCompareContract] = useState<ContractItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // Update contract handler
  const handleUpdateContract = (updated: ContractItem) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedContract(updated);
  };

  // Save new contract handler
  const handleSaveContract = (newContract: ContractItem) => {
    setContracts((prev) => [newContract, ...prev]);
  };

  // Filter accessible contracts for counts
  const accessibleContracts = contracts.filter((c) => {
    if (currentUser.role === 'team_member') {
      return c.team === currentUser.team;
    }
    return true;
  });

  const pendingReviewCount = accessibleContracts.filter(
    (c) => c.status === 'REVIEW_REQUESTED' || c.status === 'IN_REVIEW' || (c.legalReview.requestedAt && c.legalReview.status !== 'APPROVED')
  ).length;

  const approvedCount = accessibleContracts.filter(
    (c) => c.status === 'REVIEW_COMPLETED' || c.status === 'SIGNED' || c.legalReview.status === 'APPROVED'
  ).length;

  const supervisorApprovalCount = contracts.filter(
    (c) => c.status === 'PENDING_SUPERVISOR_APPROVAL' || c.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL'
  ).length;

  const approvalRequestedCount = contracts.filter(
    (c) => c.status === 'PENDING_SUPERVISOR_APPROVAL' || c.legalReview.status === 'PENDING_SUPERVISOR_APPROVAL'
  ).length;

  const signedCount = accessibleContracts.filter(
    (c) => c.signedDocument?.isSigned || c.status === 'SIGNED'
  ).length;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        users={MOCK_USERS}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pendingCount={
          currentUser.role === 'legal_supervisor'
            ? supervisorApprovalCount
            : currentUser.role === 'legal_manager'
            ? approvalRequestedCount
            : pendingReviewCount
        }
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          contractCount={accessibleContracts.length}
          pendingReviewCount={pendingReviewCount}
          approvedCount={approvedCount}
          supervisorApprovalCount={supervisorApprovalCount}
          approvalRequestedCount={approvalRequestedCount}
          signedCount={signedCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'list' && (
            <ContractList
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
              onCompareRenewal={setCompareContract}
              onRequestReview={setSelectedContract}
              searchTerm={searchTerm}
            />
          )}

          {activeTab === 'legal_queue' && (
            <LegalReviewQueue
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
            />
          )}

          {activeTab === 'approval_requested_queue' && currentUser.role === 'legal_manager' && (
            <ApprovalRequestedQueue
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
            />
          )}

          {activeTab === 'supervisor_queue' && currentUser.role === 'legal_supervisor' && (
            <SupervisorQueue
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
            />
          )}

          {activeTab === 'approved_queue' && (currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor') && (
            <ApprovedQueue
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
            />
          )}

          {activeTab === 'signed_queue' && (
            <SignedQueue
              contracts={contracts}
              currentUser={currentUser}
              onSelectContract={setSelectedContract}
              onUpdateContract={handleUpdateContract}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager contracts={contracts} onSelectContract={setSelectedContract} />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          currentUser={currentUser}
          onClose={() => setSelectedContract(null)}
          onUpdateContract={handleUpdateContract}
          onOpenCompare={(c) => {
            setSelectedContract(null);
            setCompareContract(c);
          }}
        />
      )}

      {compareContract && (
        <ContractCompareModal
          contract={compareContract}
          allContracts={contracts}
          onClose={() => setCompareContract(null)}
        />
      )}

      {isNewModalOpen && (
        <ContractFormModal
          currentUser={currentUser}
          allContracts={contracts}
          onClose={() => setIsNewModalOpen(false)}
          onSaveContract={handleSaveContract}
        />
      )}
    </div>
  );
}
