import React, { useState } from 'react';
import { User } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  Briefcase, 
  FileCheck2,
  Users
} from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('finance@company.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'direct'>('quick');

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setErrorMsg('등록되지 않은 이메일 계정입니다. 아래 빠른 로그인 프리셋을 이용해보세요.');
    }
  };

  const getRoleBadge = (role: string, position: string) => {
    if (role === 'legal_supervisor') {
      return <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">최종 승인권자 ({position})</span>;
    }
    if (role === 'legal_manager') {
      return <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">검토 관리자 ({position})</span>;
    }
    if (role === 'team_leader') {
      return <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">부서 총괄 ({position})</span>;
    }
    return <span className="text-[10px] bg-zinc-100 text-zinc-700 font-medium px-2 py-0.5 rounded">부서 실무 ({position})</span>;
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white shadow-md mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            사내 계약 관리 및 법무 결재 시스템
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            부서별 데이터 격리(RBAC) 및 법무 2단계 검토·결재 워크플로우를 제공하는 통합 계약 관리 플랫폼입니다.
          </p>
        </div>

        {/* Login Container */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-lg rounded-xl border border-zinc-200">
          {/* Tab Selection */}
          <div className="flex border-b border-zinc-200 mb-6">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>부서·직무별 원클릭 빠른 로그인 (권장)</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>이메일 / 비밀번호 직접 로그인</span>
            </button>
          </div>

          {/* Quick Role Selection Mode */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-500 mb-2">
                테스트하고자 하는 부서와 역할을 클릭하면 해당 계정의 실제 권한으로 즉시 로그인됩니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map((u) => {
                  const isLegal = u.role === 'legal_manager' || u.role === 'legal_supervisor';
                  const isLeader = u.role === 'team_leader';

                  return (
                    <button
                      key={u.id}
                      onClick={() => onLogin(u)}
                      className="text-left p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-900 hover:shadow-sm bg-zinc-50/50 hover:bg-white transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isLegal ? 'bg-purple-100 text-purple-900' :
                              isLeader ? 'bg-amber-100 text-amber-900' : 'bg-zinc-200 text-zinc-800'
                            }`}>
                              {u.name.slice(0, 1)}
                            </div>
                            <div>
                              <span className="font-semibold text-zinc-900 text-xs sm:text-sm group-hover:text-zinc-900">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-zinc-500 ml-1.5">
                                {u.team}
                              </span>
                            </div>
                          </div>
                          {getRoleBadge(u.role, u.position)}
                        </div>

                        <div className="text-[11px] text-zinc-500 pl-9 mb-1">
                          {u.email}
                        </div>

                        {/* Permission description */}
                        <div className="text-[11px] text-zinc-600 pl-9 line-clamp-1">
                          {u.role === 'legal_supervisor' && '전사 법무 최종 승인 및 반려, 알림 발송 권한'}
                          {u.role === 'legal_manager' && '전사 검토 요청 접수, 계약서 수정본 업로드 및 결재 상신'}
                          {u.role === 'team_leader' && `${u.team} 계약서 전체 열람, 부서 내부 승인 및 총괄`}
                          {u.role === 'team_member' && `${u.team} 계약서 열람, 신규 등록, 법무 검토 요청, 날인 등록`}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-end text-[11px] font-medium text-zinc-700 group-hover:text-zinc-900">
                        <span>계정으로 접속하기</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Credential Form Mode */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  사내 업무 이메일
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="예: finance@company.com"
                    className="block w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-md text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  데모 계정: finance@company.com, sales@company.com, legal.mgr@company.com 등
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  비밀번호
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-md text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-zinc-600">
                  <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                  <span>로그인 상태 유지</span>
                </label>
                <span className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                  비밀번호 초기화
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-md text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>로그인</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* RBAC Explanation Card */}
          <div className="mt-6 pt-5 border-t border-zinc-200">
            <h4 className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>시스템 내 부서별 권한 격리 (RBAC) 구조 안내</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <div>
                <strong className="text-zinc-800">동일 부서 공유:</strong> 재무팀 계약서는 재무팀원과 재무팀장만 조회 및 공동 작업이 가능합니다.
              </div>
              <div>
                <strong className="text-zinc-800">타 부서 격리:</strong> 영업팀이나 인사팀 등 타 부서의 계약서는 접근이 원천 차단됩니다.
              </div>
              <div>
                <strong className="text-zinc-800">법무관리자:</strong> 각 부서에서 검토 요청된 계약서를 접수하여 검토 의견 및 파일을 첨부합니다.
              </div>
              <div>
                <strong className="text-zinc-800">법무담당:</strong> 최종 법무 승인 권한자로서 검토본을 확인하고 최종 승인을 완료합니다.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
