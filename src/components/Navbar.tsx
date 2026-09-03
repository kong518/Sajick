import React from 'react';
import { ActiveTab, UserRole } from '../types';
import { FileEdit, FileText, RotateCcw, Printer, Sparkles } from 'lucide-react';
import { printDocuments } from '../utils/pdfExport';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onFillSample: () => void;
  onReset: () => void;
  submissionCount: number;
  currentRole: UserRole;
  onRequestAdminAccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onFillSample,
  onReset,
  currentRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('write')}>
            <div className="w-9 h-9 rounded bg-white flex items-center justify-center text-slate-900 font-bold shadow-xs">
              <span className="text-blue-900 font-extrabold text-base">수</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-200 tracking-tight bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                  수원시장애인종합복지관
                </span>
                <span className="text-[11px] text-slate-400">사회서비스지원팀</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight leading-tight">
                전자 사직서 및 인수인계서 작성
              </h1>
            </div>
          </div>

          {/* Navigation Tabs (Only 2 simple tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/60 text-xs font-semibold">
            <button
              type="button"
              id="tab-write-btn"
              onClick={() => onSelectTab('write')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded transition-all ${
                activeTab === 'write'
                  ? 'bg-blue-700 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              사직서 및 동의서 작성
            </button>

            <button
              type="button"
              id="tab-handover-btn"
              onClick={() => onSelectTab('handover')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded transition-all ${
                activeTab === 'handover'
                  ? 'bg-blue-700 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              업무 인수인계서 작성
            </button>

            {currentRole === 'admin' && (
              <>
                <button
                  type="button"
                  id="tab-preview-btn"
                  onClick={() => onSelectTab('preview')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded transition-all ${
                    activeTab === 'preview'
                      ? 'bg-blue-700 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  실물 서류 확인 (3종)
                </button>
                <button
                  type="button"
                  id="tab-admin-view-btn"
                  onClick={() => onSelectTab('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-amber-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  관리자 접수목록
                </button>
              </>
            )}
          </nav>

          {/* Quick Helper Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="fill-sample-btn"
              onClick={onFillSample}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded text-xs font-bold flex items-center gap-1 shadow-xs transition"
              title="예시 데이터를 자동으로 입력하여 바로 확인해볼 수 있습니다."
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">예시 데이터</span>
            </button>

            <button
              type="button"
              id="reset-form-btn"
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="양식 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentRole === 'admin' && (
              <button
                type="button"
                id="quick-print-btn"
                onClick={() => printDocuments()}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                title="공문서 인쇄"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Nav */}
        <div className="flex md:hidden border-t border-slate-800 py-2 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSelectTab('write')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'write' ? 'bg-blue-700 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            사직서 및 동의서 작성
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('handover')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'handover' ? 'bg-blue-700 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            업무 인수인계서 작성
          </button>
          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-1.5 rounded whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-amber-600 text-white font-bold' : 'text-amber-300 bg-slate-800'
              }`}
            >
              관리자 접수목록
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
