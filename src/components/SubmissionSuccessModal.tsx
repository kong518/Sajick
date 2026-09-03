import React, { useState, useEffect } from 'react';
import { ResignationFormData } from '../types';
import { CheckCircle2, Download, Printer, FileText, Send, XCircle, FileCheck } from 'lucide-react';
import { printDocuments, exportToPdf } from '../utils/pdfExport';

interface SubmissionSuccessModalProps {
  data: ResignationFormData;
  isOpen: boolean;
  onClose: () => void;
  onFinalSubmit?: () => void;
  onGoToAdmin?: () => void;
  onResetNew: () => void;
  isAdmin?: boolean;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  data,
  isOpen,
  onClose,
  onFinalSubmit,
  onGoToAdmin,
  onResetNew,
  isAdmin = false,
}) => {
  // Local state to track whether final submit has been triggered
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmSubmit = () => {
    if (onFinalSubmit) {
      onFinalSubmit();
    }
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {isSubmitted ? (
          /* 1. 제출 완료 상태 */
          <>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                사직서 및 동의서 제출이 완료되었습니다!
              </h3>
              <p className="text-xs text-slate-500">
                수원시장애인종합복지관 사회서비스지원팀에 사직 서류가 안전하게 전송 및 접수되었습니다.
              </p>
            </div>

            {/* Submission Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">신청인(활동지원사)</span>
                <span className="font-bold text-slate-900">{data.name} 님</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">소속</span>
                <span className="text-slate-800">{data.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">사직 일자(마지막 근무일)</span>
                <span className="font-semibold text-blue-700">{data.resignationDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">제출 서류</span>
                <span className="font-semibold text-slate-800">
                  사직서 / 급여 및 퇴직연금 지급 지연 동의서 (2종)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">접수 번호</span>
                <span className="font-mono text-slate-600 text-[11px]">{data.id}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isAdmin ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => exportToPdf(data)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-4 h-4" />
                      PDF 다운로드
                    </button>
                    <button
                      type="button"
                      onClick={() => printDocuments()}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      문서 인쇄
                    </button>
                  </div>

                  <div className="pt-1">
                    {onGoToAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={onGoToAdmin}
                          className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <FileText className="w-4 h-4" />
                          관리자 접수함 확인
                        </button>
                        <button
                          type="button"
                          onClick={onResetNew}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          확인 (완료)
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                      >
                        닫기
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  id="success-confirm-btn"
                  onClick={onResetNew}
                  className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  확인 (제출 완료)
                </button>
              )}
            </div>
          </>
        ) : (
          /* 2. 최종 제출 전 확인 단계 (취소 버튼과 최종제출 버튼 제공) */
          <>
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50">
              <FileCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                사직서 및 동의서 최종 제출
              </h3>
              <p className="text-xs text-slate-500">
                수원시장애인종합복지관 사회서비스지원팀에 사직 서류를 전송하시겠습니까?<br />
                아래 내용을 확인하신 후 [최종제출] 버튼을 눌러주세요.
              </p>
            </div>

            {/* Submission Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">신청인(활동지원사)</span>
                <span className="font-bold text-slate-900">{data.name || '활동지원사'} 님</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">소속</span>
                <span className="text-slate-800">{data.department || '사회서비스지원팀(활동지원사)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">사직 일자(마지막 근무일)</span>
                <span className="font-semibold text-blue-700">{data.resignationDate || '미지정'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">제출 서류</span>
                <span className="font-semibold text-slate-800">
                  사직서 / 급여 및 퇴직연금 지급 지연 동의서 (2종)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">서명 상태</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  자필 전자서명 완료
                </span>
              </div>
            </div>

            {/* [취소] 및 [최종제출] 버튼 2개 나란히 배치 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="modal-cancel-btn"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                취소
              </button>
              <button
                type="button"
                id="modal-final-submit-btn"
                onClick={handleConfirmSubmit}
                className="px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                최종제출
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
