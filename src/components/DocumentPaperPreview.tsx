import React, { useState, useEffect, useRef } from 'react';
import { ResignationFormData } from '../types';
import { SuwonWelfareLogo } from './SuwonWelfareLogo';

interface DocumentPaperPreviewProps {
  data: ResignationFormData;
  page?: 1 | 2 | 3 | 'all' | 'resignation';
  scale?: number;
}

// Official Korean Administration Standard Font: 함초롬바탕 (함초롱바탕 / HCR Batang)
export const HAMCHOROM_BATANG_FONT =
  '"HCRBatang", "함초롬바탕", "HamchoromBatang", "함초롱바탕", "Batang", "바탕", "바탕체", "KoPubWorldBatang", "Noto Serif KR", serif';

const formatDateKo = (dateStr: string) => {
  if (!dateStr) return { year: '2026', month: '00', day: '00' };
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return {
      year: parts[0],
      month: String(parseInt(parts[1], 10)).padStart(2, '0'),
      day: String(parseInt(parts[2], 10)).padStart(2, '0'),
    };
  }
  return { year: '2026', month: '00', day: '00' };
};

export const DocumentPaperPreview: React.FC<DocumentPaperPreviewProps> = ({
  data,
  page = 'all',
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width || 800);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth < 826 ? Math.max(0.3, (containerWidth - 16) / 794) : 1;
  const pageScaleStyle = {
    '--page-scale': String(scale),
    '--scaled-width': `${Math.floor(794 * scale)}px`,
    '--scaled-height': `${Math.floor(1123 * scale)}px`,
  } as React.CSSProperties;

  const wrapResponsive = (pageEl: React.ReactNode, pageNum: number) => {
    const isScreenHidden = page !== 'all' && (page as any) !== pageNum && (page === 'resignation' ? pageNum === 3 : true);
    return (
      <div
        className={`responsive-page-scale-wrapper ${isScreenHidden ? 'hidden print:block' : ''}`}
        style={pageScaleStyle}
      >
        <div 
          className="responsive-page-scale-content"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {pageEl}
        </div>
      </div>
    );
  };

  const resDate = formatDateKo(data.resignationDate);
  const formDate = formatDateKo(data.formDate);
  const consentDate = formatDateKo(data.consentDate);
  const handoverConfirmDate = formatDateKo(data.handoverData?.confirmDate || data.formDate);
  const handoverDateObj = formatDateKo(data.handoverData?.handoverDate || data.resignationDate);
  const takeoverDateObj = formatDateKo(data.handoverData?.takeoverDate || data.resignationDate);

  const reasonText = data.resignationReasonDetail
    ? `${data.resignationReason || '개인사유'}(${data.resignationReasonDetail})`
    : data.resignationReason || '개인사유';

  const renderPage1 = () => (
    <div
      id="print-page-1"
      className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-12 md:p-16 flex flex-col justify-between shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-12 w-[210mm] min-h-[297mm] box-border text-[15px] leading-relaxed"
      style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
    >
      {/* Top Section: Approval box & Title */}
      <div className="w-full">
        {/* Approval box at top right */}
        <div className="flex justify-end mb-6">
          <table className="border-collapse border border-black text-center text-xs font-sans">
            <tbody>
              <tr>
                <th className="border border-black px-4 py-1.5 font-medium bg-slate-50 w-16">담당</th>
                <th className="border border-black px-4 py-1.5 font-medium bg-slate-50 w-16">팀장</th>
              </tr>
              <tr className="h-16">
                <td className="border border-black p-1 text-center align-middle relative w-16 h-16">
                  {data.managerApproval?.managerSignature ? (
                    <img
                      src={data.managerApproval.managerSignature}
                      alt="담당 결재"
                      className="max-h-12 max-w-full mx-auto object-contain"
                      style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </td>
                <td className="border border-black p-1 text-center align-top font-sans text-slate-800 text-xs relative w-16 h-16">
                  {data.managerApproval?.teamLeaderSignature ? (
                    <img
                      src={data.managerApproval.teamLeaderSignature}
                      alt="팀장 전결"
                      className="max-h-12 max-w-full mx-auto object-contain"
                      style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="pt-0.5 text-[11px] font-medium text-slate-700">전결</div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-3xl font-bold tracking-[1.2em] indent-[1.2em] text-slate-950 font-serif">
            사 직 서
          </h1>
        </div>

        {/* Applicant Info Section (소속, 성명, 생년월일, 입사일자, 사직사유) */}
        <div className="mt-8 space-y-3 px-4 text-[15px] text-slate-900 font-sans">
          <div className="flex items-center">
            <span className="w-24 font-medium text-slate-800">소&nbsp;&nbsp;&nbsp;속 :</span>
            <span className="font-normal text-slate-900">{data.department || '사회서비스지원팀(활동지원사)'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-slate-800">성&nbsp;&nbsp;&nbsp;명 :</span>
            <span className="font-normal text-slate-900">{data.name || '___________'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-slate-800">생년월일 :</span>
            <span className="font-normal text-slate-900">{data.birthDate || '___________________'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-slate-800">입사일자 :</span>
            <span className="font-normal text-slate-900">{data.hireDate || '___________________'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-slate-800">사직사유 :</span>
            <span className="font-normal text-slate-900">
              {data.resignationReason || '개인사유'}
              {data.resignationReasonDetail ? ` (${data.resignationReasonDetail})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Body Statement */}
      <div className="my-8 px-4 text-center w-full">
        <p className="text-[16px] leading-[2.1] text-slate-950 font-serif">
          상기 본인은 {reasonText}로 인하여 {resDate.year}년 {resDate.month}월 {resDate.day}일부로 사직코자
          <br />
          사직서를 제출하오니 허락하여 주시기 바랍니다.
        </p>
      </div>

      {/* Bottom Submission Date & Signatory (Aligned to right with ends matching) */}
      <div className="mb-2 w-full">
        {/* Submission Date: Right Aligned */}
        <div className="text-[15px] text-slate-900 mb-4 font-serif text-right pr-2">
          <span className="px-1">{formDate.year}</span>년{' '}
          <span className="px-1">{formDate.month}</span>월{' '}
          <span className="px-1">{formDate.day}</span>일
        </div>

        {/* Signatory: Right Aligned, flush with date */}
        <div className="flex justify-end items-center pr-2 mb-6">
          <div className="flex items-center text-[15px]">
            <span className="font-medium text-slate-900 mr-2">신&nbsp;&nbsp;청&nbsp;&nbsp;인 :</span>
            <span className="font-normal text-slate-900 min-w-[60px] text-right tracking-wider">{data.name || '           '}</span>
            <div className="relative inline-flex items-center justify-center ml-2 w-16 h-8">
              <span className="text-slate-800 font-serif text-[13px] font-bold select-none tracking-wider">(인)</span>
              {data.applicantSignature && (
                <img
                  src={data.applicantSignature}
                  alt="신청인 서명"
                  className="absolute inset-0 m-auto max-h-7 max-w-full object-contain pointer-events-none"
                  style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Recipient & Logo */}
        <div className="text-center pt-2 space-y-4">
          <h2 className="text-2xl font-bold tracking-[0.25em] text-slate-950 font-serif">
            수원시장애인종합복지관 귀중
          </h2>
          <div className="flex justify-center pt-2">
            <SuwonWelfareLogo size="md" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div
      id="print-page-2"
      className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-12 md:p-16 flex flex-col justify-between shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-12 w-[210mm] min-h-[297mm] box-border text-[15px] leading-relaxed"
      style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
    >
      {/* Title */}
      <div className="text-center mt-12 mb-8 w-full">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-serif leading-snug">
          급여 및 퇴직연금 지급 지연 동의서
        </h1>
      </div>

      {/* Statement Body */}
      <div className="px-6 md:px-8 text-[15px] leading-[2.1] text-slate-950 text-justify w-full my-auto">
        <p className="indent-6">
          장애인활동지원사업 특성상 근로 계약서에 명시된 바와 같이 급여가 1일에서 말일까지 근로 후
          익월 15일에 지급되고 있어 사직서 제출과 관계없이 급여는 익월 15일에 지급되며 퇴직연금은 최종
          급여지급일 이후 15일 이내({data.consentPensionMonth || ' '}월 30일 이내)에 지급이 지연 처리됨에
          동의합니다.
        </p>
      </div>

      {/* Date & Signatory & Footer */}
      <div className="mb-4 w-full">
        {/* Date: Centered */}
        <div className="text-[15px] text-slate-900 mb-8 font-serif text-center">
          <span className="px-1">{consentDate.year}</span>년{' '}
          <span className="px-1">{consentDate.month}</span>월{' '}
          <span className="px-1">{consentDate.day}</span>일
        </div>

        {/* Signatory: Right Aligned */}
        <div className="flex justify-end items-center pr-2 mb-8">
          <div className="flex items-center text-[15px]">
            <span className="font-medium text-slate-900 mr-2">동&nbsp;의&nbsp;인 :</span>
            <span className="font-normal text-slate-900 min-w-[60px] text-right tracking-wider">{data.name || '           '}</span>
            <div className="relative inline-flex items-center justify-center ml-2 w-16 h-8">
              <span className="text-slate-800 font-serif text-[13px] font-bold select-none tracking-wider">(인)</span>
              {(data.consentSignature || data.applicantSignature) && (
                <img
                  src={data.consentSignature || data.applicantSignature}
                  alt="동의인 서명"
                  className="absolute inset-0 m-auto max-h-7 max-w-full object-contain pointer-events-none"
                  style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Recipient & Logo */}
        <div className="text-center pt-4 space-y-4">
          <h2 className="text-2xl font-bold tracking-[0.25em] text-slate-950 font-serif">
            수원시장애인종합복지관 귀중
          </h2>
          <div className="flex justify-center pt-2">
            <SuwonWelfareLogo size="md" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage3 = () => (
    <div
      id="print-page-3"
      className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-6 md:p-8 flex flex-col justify-between shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-6 w-[210mm] min-h-[297mm] box-border text-[12.5px] leading-normal"
      style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <div className="text-center pt-2 mb-4">
            <div className="inline-block pb-1.5 border-b-[2.5px] border-black px-6">
              <h1 className="text-2xl font-bold tracking-[0.4em] indent-[0.4em] text-slate-950 font-serif">
                업무 인계·인수서
              </h1>
            </div>
          </div>

          {/* Section 1: 인적사항 */}
          <div className="mb-2 font-sans">
            <div className="font-bold text-slate-900 text-xs mb-1 font-serif">1. 인적사항</div>
            <table className="w-full border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="border border-black bg-slate-50/50 py-1.5 px-2 text-center font-bold w-20 text-slate-900">
                    인계자
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800">
                    소속: {data.handoverData?.handoverPersonDept || data.department || '사회서비스지원팀'}
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800">
                    성명: {data.handoverData?.handoverPersonName || data.name}
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800 w-36">
                    인계일: {handoverDateObj.year}.{handoverDateObj.month}.{handoverDateObj.day}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50/50 py-1.5 px-2 text-center font-bold w-20 text-slate-900">
                    인수자
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800">
                    소속: {data.handoverData?.takeoverPersonDept || '사회서비스지원팀'}
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800">
                    성명: {data.handoverData?.takeoverPersonName || '전담관리인력'}
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800 w-36">
                    인수일: {takeoverDateObj.year}.{takeoverDateObj.month}.{takeoverDateObj.day}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50/50 py-1.5 px-2 text-center font-bold w-20 text-slate-900">
                    인계사유
                  </td>
                  <td colSpan={3} className="border border-black py-1.5 px-3 text-slate-800">
                    {data.handoverData?.handoverReason || '사직으로 인한 활동지원 급여제공 업무 인계'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50/50 py-1.5 px-2 text-center font-bold w-20 text-slate-900">
                    수급자명
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800 font-semibold">
                    {data.handoverData?.recipients?.[0]?.recipientName || ''}
                  </td>
                  <td className="border border-black bg-slate-50/50 py-1.5 px-2 text-center font-bold w-20 text-slate-900">
                    주소/연락처
                  </td>
                  <td className="border border-black py-1.5 px-3 text-slate-800">
                    {data.handoverData?.recipients?.[0]?.contactOrAddress || ''}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="text-[10px] text-slate-600 mt-1 pl-1">
              * 인계자는 전담관리인력이나 전임 활동지원인력 가능
            </div>
          </div>

          {/* Section 2: 인계 인수 업무사항 */}
          <div className="mb-2 font-sans">
            <div className="font-bold text-slate-900 text-xs mb-1 font-serif">2. 인계 인수 업무사항</div>
            <table className="w-full border-collapse border border-black text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50/50 text-center text-slate-900 font-medium">
                  <th className="border border-black py-1 px-2 w-1/2">
                    인계 · 인수할 업무사항(급여제공 내용 등)
                  </th>
                  <th className="border border-black py-1 px-2 w-1/2">
                    서비스제공시 유의 사항 및 중요 문제점
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top h-24 whitespace-pre-wrap leading-relaxed text-slate-800 text-[11px]">
                    <div className="text-[10px] text-slate-500 font-medium mb-1 print:hidden">※ 서비스 제공시간(자세하게)</div>
                    {data.handoverData?.recipients?.[0]?.serviceDetails || ''}
                  </td>
                  <td className="border border-black p-2 align-top h-24 whitespace-pre-wrap leading-relaxed text-slate-800 text-[11px]">
                    <div className="text-[10px] text-slate-500 font-medium mb-1 print:hidden">※ 반드시 작성</div>
                    {data.handoverData?.recipients?.[0]?.precautions || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: 진행 및 미결사항 */}
          <div className="mb-2 font-sans">
            <div className="font-bold text-slate-900 text-xs mb-1 font-serif">3. 진행 및 미결사항</div>
            <table className="w-full border-collapse border border-black text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50/50 text-center text-slate-900 font-medium">
                  <th className="border border-black py-1 px-2 w-1/2 tracking-wider">
                    진&nbsp;&nbsp;&nbsp;&nbsp;행&nbsp;&nbsp;&nbsp;&nbsp;사&nbsp;&nbsp;&nbsp;&nbsp;항
                  </th>
                  <th className="border border-black py-1 px-2 w-1/2 tracking-wider">
                    미&nbsp;&nbsp;&nbsp;&nbsp;결&nbsp;&nbsp;&nbsp;&nbsp;사&nbsp;&nbsp;&nbsp;&nbsp;항
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top h-12 whitespace-pre-wrap leading-relaxed text-slate-800 text-[11px]">
                    {data.handoverData?.inProgressItems || ''}
                  </td>
                  <td className="border border-black p-2 align-top h-12 whitespace-pre-wrap leading-relaxed text-slate-800 text-[11px]">
                    {data.handoverData?.pendingItems || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: 인계 인수서류 및 비품 목록 */}
          <div className="mb-2 font-sans">
            <div className="font-bold text-slate-900 text-xs mb-1 font-serif">4. 인계 인수서류 및 비품 목록</div>
            <table className="w-full border-collapse border border-black text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50/50 text-center text-slate-900 font-medium">
                  <th className="border border-black py-1 px-2 w-1/2 tracking-widest">
                    서&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;류
                  </th>
                  <th className="border border-black py-1 px-2 w-1/2 tracking-widest">
                    비&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;품
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top h-14 whitespace-pre-wrap leading-relaxed text-slate-800 text-xs">
                    {data.handoverData?.documentsList || ''}
                  </td>
                  <td className="border border-black p-2 align-top h-14 whitespace-pre-wrap leading-relaxed text-slate-800 text-xs">
                    {data.handoverData?.equipmentList || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Statement: Left-aligned directly below table 4 as in official form */}
          <div className="mt-2 text-left pl-2 sm:pl-3 font-serif">
            <p className="text-xs sm:text-sm font-normal text-slate-900">
              상기 사항을 정히 인계 인수함.
            </p>
          </div>

          {/* Date: Normal weight, centered, refined size */}
          <div className="text-center font-serif text-xs sm:text-sm font-normal text-slate-900 my-4 tracking-widest">
            <span>{handoverConfirmDate.year}</span>년&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{handoverConfirmDate.month}</span>월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{handoverConfirmDate.day}</span>일
          </div>

          {/* Signatures: 인계자, 인수자, 확인자 in 3 equal columns with normal weight & neat spacing */}
          <div className="grid grid-cols-3 gap-8 text-[13px] font-serif font-normal px-4 my-4">
            {/* 인계자 */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-900 font-bold tracking-wider shrink-0">인계자</span>
              <span className="text-slate-900 tracking-wider mx-auto font-medium truncate px-1">
                {data.handoverData?.handoverPersonName || data.name || ''}
              </span>
              <div className="relative inline-flex items-center justify-center w-10 h-7 shrink-0">
                <span className="text-slate-800 font-serif text-xs select-none font-bold">(인)</span>
                {(data.handoverData?.handoverSignature || data.applicantSignature) && (
                  <img
                    src={data.handoverData?.handoverSignature || data.applicantSignature}
                    alt="인계자 서명"
                    className="absolute inset-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                    style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* 인수자 */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-900 font-bold tracking-wider shrink-0">인수자</span>
              <span className="text-slate-900 tracking-wider mx-auto font-medium truncate px-1">
                {data.handoverData?.takeoverPersonName || '전담관리인력'}
              </span>
              <div className="relative inline-flex items-center justify-center w-10 h-7 shrink-0">
                <span className="text-slate-800 font-serif text-xs select-none font-bold">(인)</span>
                {data.handoverData?.takeoverSignature && (
                  <img
                    src={data.handoverData.takeoverSignature}
                    alt="인수자 서명"
                    className="absolute inset-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                    style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* 확인자 */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-900 font-bold tracking-wider shrink-0">확인자</span>
              <span className="text-slate-900 tracking-wider mx-auto font-medium truncate px-1">
                {data.handoverData?.verifierName || data.managerApproval?.teamLeaderName || '팀장'}
              </span>
              <div className="relative inline-flex items-center justify-center w-10 h-7 shrink-0">
                <span className="text-slate-800 font-serif text-xs select-none font-bold">(인)</span>
                {(data.handoverData?.verifierSignature || data.managerApproval?.teamLeaderSignature) && (
                  <img
                    src={data.handoverData?.verifierSignature || data.managerApproval?.teamLeaderSignature}
                    alt="확인자 서명"
                    className="absolute inset-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                    style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welfare Center Official Logo - Sharp and Crisp */}
        <div className="pt-4 pb-2 flex items-center justify-center">
          <SuwonWelfareLogo size="md" />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="print-container w-full space-y-12 print:space-y-0">
      {wrapResponsive(renderPage1(), 1)}
      {wrapResponsive(renderPage2(), 2)}
      {wrapResponsive(renderPage3(), 3)}
    </div>
  );
};
