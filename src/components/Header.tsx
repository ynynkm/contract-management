import React from 'react';
import { User } from '../types';
import { Shield, UserCheck, Bell, Search, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  pendingCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  users,
  searchTerm,
  onSearchChange,
  pendingCount,
  onLogout,
}) => {
  const getRoleLabel = (role: string, position?: string) => {
    if (position) return position;
    switch (role) {
      case 'legal_manager':
        return '법무관리자';
      case 'legal_supervisor':
        return '법무담당';
      case 'team_leader':
        return '팀장';
      default:
        return '팀원';
    }
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-zinc-900 text-white rounded-md flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            CM
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 tracking-tight">사내 계약서 관리 시스템</h1>
            <p className="text-xs text-zinc-500">Corporate Contract Management Program</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="계약서명, 상대방, 카테고리 검색..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-4 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
          />
        </div>

        {/* Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Notification Badge */}
          <div className="relative">
            <button className="p-2 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Role / User Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5">
            {currentUser.role === 'legal_manager' || currentUser.role === 'legal_supervisor' ? (
              <Shield className="w-4 h-4 text-zinc-800" />
            ) : (
              <UserCheck className="w-4 h-4 text-zinc-600" />
            )}
            <div className="text-left text-xs">
              <div className="font-medium text-zinc-900 flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-normal">
                  {currentUser.team}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                {getRoleLabel(currentUser.role, currentUser.position)}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = users.find((u) => u.id === e.target.value);
                if (found) onSwitchUser(found);
              }}
              className="ml-2 bg-transparent text-xs text-zinc-600 focus:outline-none cursor-pointer border-l border-zinc-200 pl-2"
              title="권한 및 사용자 전환"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.team} - {getRoleLabel(u.role, u.position)})
                </option>
              ))}
            </select>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
