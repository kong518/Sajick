import React from 'react';
import { HelpCircle, FileText, CheckCircle, ShieldAlert, PhoneCall, Building2 } from 'lucide-react';

interface GuideTabProps {
  onStartWrite: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({ onStartWrite }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              활동지원사 사직서 및 업무 인수인계 제출 안내
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              수원시장애인종합복지관 사회서비스지원팀
            </p>
          </div>
        </div>
      </div>

      {/* 서류 구성 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-sm">사직서 (제1페이지)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            소속, 성명, 생년월일, 입사일자, 사직사유, 사직일자(마지막 근무일)를 기재하고 신청인 전자서명을 진행합니다.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-sm">급여·퇴직연금 동의서 (제2페이지)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            활동지원사업 급여 정산(익월 15일) 및 퇴직연금 지급 지연 안내 규정에 대한 확인 및 동의 전자서명을 진행합니다.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm space-y-2">
          <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
            ★
          </div>
          <h3 className="font-bold text-blue-950 text-sm">업무 인계·인수서 (별도 탭 서명)</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            상단의 [업무 인수인계서 작성] 탭에서 인계자(퇴사 활동지원사)와 인수자(후임/전담관리인력)가 각각 독립된 화면에서 서명을 등록할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 제출 절차 가이드 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-700" />
          사직서 제출 및 퇴직 절차
        </h3>

        <ol className="relative border-l border-blue-300 ml-3 space-y-6 text-xs">
          <li className="mb-2 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-700 text-white rounded-full -left-3 ring-4 ring-white font-bold text-[11px]">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-sm">사직 의사 사전 협의</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              사직 희망일 최소 14일~30일 전 사회서비스지원팀 전담관리인력(사회복지사)과 사전 일정 및 이용자 인수인계를 협의합니다.
            </p>
          </li>

          <li className="mb-2 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-700 text-white rounded-full -left-3 ring-4 ring-white font-bold text-[11px]">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-sm">온라인 전자서명 및 제출</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              본 시스템에서 스마트폰 터치 또는 마우스로 사직서 3종 양식을 작성하고 전자서명 후 원클릭 제출합니다.
            </p>
          </li>

          <li className="mb-2 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-700 text-white rounded-full -left-3 ring-4 ring-white font-bold text-[11px]">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-sm">단말기 및 비품 반납 &amp; 최종 결재</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              최종 근무일까지의 바우처 결제를 완료하고, 단말기 및 서류를 복지관에 반납하면 담당자 및 팀장 결재가 완료됩니다.
            </p>
          </li>
        </ol>

        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onStartWrite}
            className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded shadow-sm hover:shadow transition"
          >
            사직서 및 인수인계서 작성 시작하기 &rarr;
          </button>
        </div>
      </div>

      {/* 기관 연락처 */}
      <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-800 shrink-0" />
          <div>
            <div className="font-bold text-slate-900 text-sm">수원시장애인종합복지관 사회서비스지원팀</div>
            <div className="text-slate-600 mt-0.5">
              경기도 수원시 영통구 창룡대로 260 | 장애인활동지원사업 전담인력
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded border border-slate-300 font-bold text-slate-800">
          <PhoneCall className="w-4 h-4 text-blue-700" />
          문의: 031-207-7979
        </div>
      </div>
    </div>
  );
};
