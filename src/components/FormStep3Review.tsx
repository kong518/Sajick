import React, { useState } from 'react';
import { ResignationFormData } from '../types';
import { DocumentPaperPreview } from './DocumentPaperPreview';
import { CheckCircle2, ArrowLeft, Send, Sparkles, FileText } from 'lucide-react';

interface FormStep3ReviewProps {
  formData: ResignationFormData;
  onPrev: () => void;
  onSubmit: () => void;
  onEditStep: (step: 1 | 2) => void;
}

export const FormStep3Review: React.FC<FormStep3ReviewProps> = ({
  formData,
  onPrev,
  onSubmit,
  onEditStep,
}) => {
  const [activePreviewPage, setActivePreviewPage] = useState<1 | 2 | 'all'>('all');

  const isFormComplete =
    Boolean(formData.name) &&
    Boolean(formData.resignationDate) &&
    Boolean(formData.applicantSignature) &&
    formData.consentSalaryDelay;

  return (
    <div className="space-y-6">
      {/* Top Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">3단계: 최종 서류 확인 및 제출</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              작성하신 사직서 및 급여지연 동의서(2종) 내용과 전자서명을 최종 점검하신 후 제출해 주세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="final-submit-btn"
              onClick={onSubmit}
              disabled={!isFormComplete}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              최종 제출하기
            </button>
          </div>
        </div>

        {/* 2대 서류 점검 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          {/* 1. 사직서 */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-bold text-blue-950 mb-2">
                <span className="flex items-center gap-1 text-sm">
                  <FileText className="w-4 h-4 text-blue-700" />
                  제1장: 사직서
                </span>
                <button
                  type="button"
                  onClick={() => onEditStep(1)}
                  className="text-xs text-blue-800 hover:underline font-bold"
                >
                  수정
                </button>
              </div>
              <div className="text-slate-700 space-y-1">
                <p>성명: <strong>{formData.name || '(미입력)'}</strong></p>
                <p>소속: {formData.department}</p>
                <p>사직 일자(마지막 근무일): <strong className="text-blue-900">{formData.resignationDate}</strong></p>
                <p>사유: {formData.resignationReason}</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200 flex items-center gap-1.5 text-blue-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>신청인 자필 전자서명 완료</span>
            </div>
          </div>

          {/* 2. 지연지급 동의서 */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                <span className="flex items-center gap-1 text-sm">
                  <FileText className="w-4 h-4 text-slate-700" />
                  제2장: 급여 및 퇴직연금 지급 지연 동의서
                </span>
                <button
                  type="button"
                  onClick={() => onEditStep(2)}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  수정
                </button>
              </div>
              <div className="text-slate-700 space-y-1">
                <p>동의 상태: <strong className="text-emerald-700">지급 지연 규정 확인 및 동의 완료</strong></p>
                <p>퇴직연금 지급 예정: <strong>{formData.consentPensionMonth}월 30일 이내</strong></p>
                <p>수신처: 수원시장애인종합복지관</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-300 flex items-center gap-1.5 text-blue-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>동의인 자필 전자서명 완료</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page View Selector Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-700" />
          사직 서류 1:1 실물 미리보기
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActivePreviewPage('all')}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activePreviewPage === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            전체 2장 보기
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewPage(1)}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activePreviewPage === 1
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. 사직서
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewPage(2)}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activePreviewPage === 2
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. 지급지연 동의서
          </button>
        </div>
      </div>

      {/* 1:1 Actual Document Render Container (Only Page 1 & Page 2 for resignation) */}
      <div className="bg-slate-200/90 p-4 md:p-8 rounded-xl border border-slate-300 overflow-x-auto flex justify-center shadow-inner">
        <DocumentPaperPreview
          data={formData}
          page={activePreviewPage === 'all' ? 'resignation' : activePreviewPage}
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> 이전 단계
          </button>
        </div>

        <button
          type="button"
          id="step3-bottom-submit-btn"
          onClick={onSubmit}
          disabled={!isFormComplete}
          className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-lg flex items-center gap-2 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          최종 전자서명 제출
        </button>
      </div>
    </div>
  );
};
