import React, { useState } from 'react';
import {
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ResignationFormData } from '../types';
import { exportToPdf, directPrint } from '../utils/pdfExport';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ResignationFormData;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  formData,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccess(false);
    setErrorMsg('');
    setProgressMsg('공문서 인쇄 준비를 시작합니다...');

    try {
      const ok = await exportToPdf(formData, (msg) => {
        setProgressMsg(msg);
      });

      if (ok) {
        setPdfSuccess(true);
        setTimeout(() => {
          setIsGeneratingPdf(false);
        }, 800);
      } else {
        setErrorMsg('PDF 생성 중 문제가 발생했습니다. 브라우저 인쇄를 이용해 보세요.');
        setIsGeneratingPdf(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('PDF 생성 중 오류가 발생했습니다.');
      setIsGeneratingPdf(false);
    }
  };

  const handleDirectBrowserPrint = () => {
    // Execute browser print
    directPrint();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                공문서 인쇄 및 PDF 출력
              </h3>
              <p className="text-xs text-slate-300">
                수원시장애인종합복지관 사직 서식 3종 (A4 규격)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Document Info Card */}
        <div className="p-5 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5">
            <div className="font-bold flex items-center justify-between text-blue-900">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                출력 대상 서류 (총 3장)
              </span>
              <span className="px-2 py-0.5 bg-blue-200/60 text-blue-800 rounded font-semibold text-[11px]">
                {formData.name || '활동지원사'} 님
              </span>
            </div>
            <div className="text-slate-600 space-y-0.5 pl-5 list-decimal">
              <div>1. 사직서 (상단 결재인 날인본)</div>
              <div>2. 급여 및 퇴직연금 지급 지연 동의서</div>
              <div>3. 업무 인계·인수서 (4개 표 항목 및 서명본)</div>
            </div>
          </div>

          {/* Progress / Status Feedback */}
          {isGeneratingPdf && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span>{progressMsg || '고해상도 공문서를 렌더링 중입니다...'}</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {pdfSuccess && !isGeneratingPdf && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">PDF 파일 다운로드가 완료되었습니다!</p>
                <p className="text-emerald-800 mt-0.5">
                  다운로드된 PDF 파일을 클릭하여 열면 바로 원본 비율 그대로 종이에 인쇄할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action 1: Recommended PDF Download & Print */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-blue-200 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>PDF 다운로드 및 바로 인쇄</span>
                    <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded uppercase">
                      추천
                    </span>
                  </div>
                  <div className="text-[11px] font-normal text-blue-100">
                    원본 양식 비율 100% 동일 · 여백 잘림 없는 A4 3장
                  </div>
                </div>
              </div>
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span className="text-xs bg-blue-600/60 px-2 py-1 rounded text-blue-100">
                  실행 &rarr;
                </span>
              )}
            </button>
          </div>

          {/* Action 2: Direct Browser Print */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDirectBrowserPrint}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <span>브라우저 인쇄 대화상자 직접 호출 (Ctrl + P)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">직접 인쇄 &rarr;</span>
            </button>
            <p className="text-[11px] text-slate-600 mt-1.5 px-1 leading-relaxed">
              * 웹 브라우저 미리보기 환경에서는 브라우저 보안으로 인쇄창이 제한될 수 있습니다. 인쇄창이 열리지 않을 경우 위의 <strong>[PDF 다운로드 및 바로 인쇄]</strong>를 이용하시면 100% 완벽하게 인쇄됩니다.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
