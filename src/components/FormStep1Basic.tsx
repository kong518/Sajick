import React from 'react';
import { ResignationFormData } from '../types';
import { User, Calendar, Building, AlertCircle, Phone, Info } from 'lucide-react';

interface FormStep1BasicProps {
  formData: ResignationFormData;
  onChange: (updated: Partial<ResignationFormData>) => void;
  onNext: () => void;
}

const COMMON_REASONS = [
  '개인사유',
  '건강상의 사유',
  '정년퇴직',
  '기타 (직접 입력)',
];

export const FormStep1Basic: React.FC<FormStep1BasicProps> = ({
  formData,
  onChange,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    if (!formData.birthDate) {
      alert('생년월일을 입력해 주세요.');
      return;
    }
    if (!formData.hireDate) {
      alert('입사일자를 입력해 주세요.');
      return;
    }
    if (!formData.resignationDate) {
      alert('사직 일자(마지막 근무일)를 입력해 주세요.');
      return;
    }
    onNext();
  };

  // Sync handover name and dates automatically
  const handleNameChange = (name: string) => {
    onChange({
      name,
      handoverData: {
        ...formData.handoverData,
        handoverPersonName: name,
      },
    });
  };

  const handleResignationDateChange = (date: string) => {
    // Also update retirement delay month
    let pensionMonth = formData.consentPensionMonth;
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const resignationMonth = parseInt(parts[1], 10);
        const nextMonth = (resignationMonth % 12) + 1;
        pensionMonth = String(nextMonth);
      }
    }

    onChange({
      resignationDate: date,
      consentPensionMonth: pensionMonth,
      handoverData: {
        ...formData.handoverData,
        handoverDate: date,
        takeoverDate: date,
      },
    });
  };

  return (
    <form id="step1-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" />
            1단계: 기본 인적사항 및 사직 정보 입력
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Step 1 / 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 소속 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              소속
            </label>
            <input
              type="text"
              id="input-dept"
              value={formData.department}
              onChange={(e) => onChange({ department: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">기본값: 사회서비스지원팀(활동지원사)</p>
          </div>

          {/* 성명 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              성명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition"
              required
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              생년월일 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="input-birthDate"
              value={formData.birthDate}
              onChange={(e) => onChange({ birthDate: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition"
              required
            />
          </div>

          {/* 입사일자 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              입사일자 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="input-hireDate"
              value={formData.hireDate}
              onChange={(e) => onChange({ hireDate: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition"
              required
            />
          </div>

          {/* 사직 일자(마지막 근무일) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              사직 일자(마지막 근무일) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="input-resignationDate"
              value={formData.resignationDate}
              onChange={(e) => handleResignationDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border-2 border-blue-600 bg-blue-50/20 rounded text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ※ 마지막 근무일 기준 사직서 및 업무 인계·인수서의 날짜로 자동 연동됩니다.
            </p>
          </div>
        </div>

        {/* 사직 사유 선택 */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            사직 사유 <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {COMMON_REASONS.map((reason) => {
              const isSelected = formData.resignationReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  id={`reason-btn-${reason}`}
                  onClick={() => onChange({ resignationReason: reason })}
                  className={`px-3 py-2.5 text-xs font-medium rounded border text-center transition-all ${
                    isSelected
                      ? 'border-blue-700 bg-blue-700 text-white font-bold shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          {(formData.resignationReason === '기타 (직접 입력)' || formData.resignationReasonDetail) && (
            <div>
              <input
                type="text"
                id="input-resignationReasonDetail"
                value={formData.resignationReasonDetail}
                onChange={(e) => onChange({ resignationReasonDetail: e.target.value })}
                placeholder="사직사유 구체적 내용 (직접 입력)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end items-center gap-3">
        <button
          type="submit"
          id="step1-next-btn"
          className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          다음: 사직서 & 동의서 서명하기 &rarr;
        </button>
      </div>
    </form>
  );
};
