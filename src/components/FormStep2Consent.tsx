import React, { useState } from 'react';
import { ResignationFormData } from '../types';
import { SignaturePad } from './SignaturePad';
import { FileSignature, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface FormStep2ConsentProps {
  formData: ResignationFormData;
  onChange: (updated: Partial<ResignationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const FormStep2Consent: React.FC<FormStep2ConsentProps> = ({
  formData,
  onChange,
  onNext,
  onPrev,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantSignature) {
      setErrorMsg('사직서 신청인 서명을 작성해 주세요.');
      return;
    }
    if (!formData.consentSalaryDelay) {
      setErrorMsg('급여 및 퇴직연금 지급 지연 동의에 체크해 주세요.');
      return;
    }
    if (!formData.consentSignature && !formData.applicantSignature) {
      setErrorMsg('동의서 서명을 작성해 주세요.');
      return;
    }

    // Auto sync consent signature if empty but applicant signed
    if (!formData.consentSignature && formData.applicantSignature) {
      onChange({ consentSignature: formData.applicantSignature });
    }

    // Also auto sync handover signature if empty
    if (!formData.handoverData.handoverSignature && formData.applicantSignature) {
      onChange({
        handoverData: {
          ...formData.handoverData,
          handoverSignature: formData.applicantSignature,
        },
      });
    }

    setErrorMsg(null);
    onNext();
  };

  const reuseApplicantSignatureForConsent = () => {
    if (formData.applicantSignature) {
      onChange({ consentSignature: formData.applicantSignature });
    }
  };

  const resDateObj = formData.resignationDate ? formData.resignationDate.split('-') : ['2026', '  ', '  '];
  const resYear = resDateObj[0] || '2026';
  const resMonth = resDateObj[1] ? String(parseInt(resDateObj[1], 10)) : '  ';
  const resDay = resDateObj[2] ? String(parseInt(resDateObj[2], 10)) : '  ';

  return (
    <form id="step2-form" onSubmit={handleNext} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
          <HelpCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* 1. 사직서 확인 및 서명 섹션 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-700" />
            1. 사직서 (제1페이지) 서명
          </h2>
          <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded border border-blue-300">
            필수 서식
          </span>
        </div>

        {/* 사직 문구 확인 카드 */}
        <div className="bg-slate-50 border border-slate-300 rounded p-5 text-center font-serif text-slate-800 leading-relaxed shadow-inner">
          <div className="text-xs font-sans text-slate-500 font-bold mb-2 uppercase tracking-wide">[사직서 제출 문구]</div>
          <p className="text-base text-slate-900">
            상기 본인은 상기 사유로 인하여 사직서를 제출하오니
            <br />
            허락하여 주시기 바랍니다.
          </p>
          <div className="mt-3 text-xs text-slate-600 font-sans flex flex-wrap items-center justify-center gap-2">
            <span>신청인: <strong className="text-slate-900">{formData.name || '(성명 미입력)'}</strong></span>
            <span>|</span>
            <span>사직일자(마지막 근무일): <strong className="text-blue-900">{formData.resignationDate || '(미선택)'}</strong></span>
            <span>|</span>
            <span>사직사유: <strong className="text-slate-900">{formData.resignationReason}</strong></span>
          </div>
        </div>

        {/* 사직서 서명 패드 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            사직서 신청인 전자서명 <span className="text-rose-500">*</span>
          </label>
          <SignaturePad
            value={formData.applicantSignature}
            onChange={(sig) => {
              onChange({
                applicantSignature: sig,
                // auto populate consent & handover signature if they are empty
                consentSignature: formData.consentSignature || sig,
                handoverData: {
                  ...formData.handoverData,
                  handoverSignature: formData.handoverData.handoverSignature || sig,
                },
              });
            }}
            title="자필 서명"
            required
          />
        </div>
      </div>

      {/* 2. 급여 및 퇴직연금 지급 지연 동의서 섹션 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-800" />
            2. 급여 및 퇴직연금 지급 지연 동의서 (제2페이지)
          </h2>
          <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-300">
            필수 동의
          </span>
        </div>

        {/* 동의 내용 본문 */}
        <div className="bg-slate-50 border border-slate-300 rounded p-5 text-slate-800 text-sm leading-relaxed">
          <p className="font-serif text-slate-900 text-base leading-relaxed text-justify mb-3">
            &ldquo;장애인활동지원사업 특성상 근로 계약서에 명시된 바와 같이 급여가 1일에서 말일까지 근로 후 익월 15일에 지급되고 있어 사직서 제출과 관계없이 급여는 익월 15일에 지급되며 퇴직연금은 최종 급여지급일 이후 15일 이내(
            <span className="inline-flex items-center mx-1">
              <input
                type="text"
                id="input-pensionMonth"
                value={formData.consentPensionMonth}
                onChange={(e) => onChange({ consentPensionMonth: e.target.value })}
                className="w-12 text-center py-0.5 px-1 bg-white border border-slate-400 rounded font-bold text-blue-900"
              />
              <span className="font-bold">월 30일 이내</span>
            </span>
            )에 지급이 지연 처리됨에 동의합니다.&rdquo;
          </p>
          <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>활동지원급여의 정산 및 퇴직연금 금융기관 입금 절차에 따른 법적 안내입니다.</span>
          </div>
        </div>

        {/* 동의 체크박스 */}
        <label className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-200 rounded cursor-pointer hover:bg-blue-50 transition">
          <input
            type="checkbox"
            id="checkbox-salary-delay"
            checked={formData.consentSalaryDelay}
            onChange={(e) => onChange({ consentSalaryDelay: e.target.checked })}
            className="w-5 h-5 text-blue-700 rounded border-slate-400 focus:ring-blue-600"
          />
          <span className="text-sm font-bold text-slate-900">
            [필수] 위 급여 및 퇴직연금 지급 지연 안내 내용을 충분히 확인하였으며 이에 동의합니다.
          </span>
        </label>

        {/* 동의서 서명 패드 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            동의인 전자서명 <span className="text-rose-500">*</span>
          </label>
          <SignaturePad
            value={formData.consentSignature}
            onChange={(sig) => onChange({ consentSignature: sig })}
            title="동의인 서명"
            required
            showReuseOption={Boolean(formData.applicantSignature && formData.consentSignature !== formData.applicantSignature)}
            existingSignaturePreview={formData.applicantSignature}
            onReuseExisting={reuseApplicantSignatureForConsent}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          id="step2-prev-btn"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm rounded transition flex items-center gap-2 bg-white shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계
        </button>

        <button
          type="submit"
          id="step2-next-btn"
          className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded shadow-md hover:shadow-lg transition flex items-center gap-2"
        >
          다음: 3단계 최종 서류 확인 및 제출 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
