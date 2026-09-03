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
      className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-[20mm] flex flex-col justify-stretch shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-[20mm] w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] box-border text-[15px] leading-relaxed"
      style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
    >
      {/* Narrow Black Border Box placed 20mm inward */}
      <div className="border-[1.5px] border-black p-[8mm] h-full w-full flex flex-col justify-between box-border flex-1">
        {/* Top Section: Approval box & Title */}
        <div className="w-full">
          {/* Approval box at top right */}
          <div className="flex justify-end mb-6">
            <table className="border-collapse border border-black text-center text-xs font-sans" style={{ fontSize: '12pt', width: '160px' }}>
              <tbody>
                <tr>
                  <th className="border border-black py-1.5 font-medium bg-slate-50" style={{ fontSize: '12pt', width: '80px', whiteSpace: 'nowrap' }}>담당</th>
                  <th className="border border-black py-1.5 font-medium bg-slate-50" style={{ fontSize: '12pt', width: '80px', whiteSpace: 'nowrap' }}>팀장</th>
                </tr>
                <tr className="h-16">
                  <td className="border border-black p-1 text-center align-middle relative h-16" style={{ width: '80px' }}>
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
                  <td className="border border-black p-0.5 text-center font-sans text-slate-800 relative h-16 align-top" style={{ width: '80px' }}>
                    <div className="flex flex-col items-center h-full justify-between py-0.5 box-border">
                      {/* '전결' text - always visible and positioned at the top */}
                      <div className="font-bold text-slate-800 select-none leading-none tracking-wider pt-0.5" style={{ fontSize: '11pt', whiteSpace: 'nowrap' }}>
                        전결
                      </div>
                      {/* Signature area - rendered in the remaining space below '전결' */}
                      <div className="flex-1 flex items-center justify-center w-full min-h-[30px] relative">
                        {data.managerApproval?.teamLeaderSignature ? (
                          <img
                            src={data.managerApproval.teamLeaderSignature}
                            alt="팀장 전결"
                            className="max-h-10 max-w-full mx-auto object-contain pointer-events-none"
                            style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h1 className="font-bold tracking-[1.2em] indent-[1.2em] text-slate-950 font-serif" style={{ fontSize: '22pt' }}>
              사 직 서
            </h1>
          </div>

          {/* Applicant Info Section (소속, 성명, 생년월일, 입사일자, 사직사유) */}
          <div className="mt-8 space-y-3 px-4 text-slate-900 font-sans" style={{ fontSize: '15pt' }}>
            <div className="flex items-center">
              <span className="w-24 font-medium text-slate-800" style={{ fontSize: '15pt' }}>소&nbsp;&nbsp;&nbsp;속 :</span>
              <span className="font-normal text-slate-900" style={{ fontSize: '15pt' }}>{data.department || '사회서비스지원팀(활동지원사)'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-slate-800" style={{ fontSize: '15pt' }}>성&nbsp;&nbsp;&nbsp;명 :</span>
              <span className="font-normal text-slate-900" style={{ fontSize: '15pt' }}>{data.name || '___________'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-slate-800" style={{ fontSize: '15pt' }}>생년월일 :</span>
              <span className="font-normal text-slate-900" style={{ fontSize: '15pt' }}>{data.birthDate || '___________________'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-slate-800" style={{ fontSize: '15pt' }}>입사일자 :</span>
              <span className="font-normal text-slate-900" style={{ fontSize: '15pt' }}>{data.hireDate || '___________________'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-slate-800" style={{ fontSize: '15pt' }}>사직사유 :</span>
              <span className="font-normal text-slate-900" style={{ fontSize: '15pt' }}>
                {data.resignationReason || '개인사유'}
                {data.resignationReasonDetail ? ` (${data.resignationReasonDetail})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Body Statement - LEFT ALIGNED AS REQUESTED */}
        <div className="my-10 px-4 text-left w-full">
          <p className="leading-[2.2] text-slate-950 font-serif text-left whitespace-nowrap" style={{ fontSize: '15pt' }}>
            상기 본인은 {reasonText}로 인하여 {resDate.year}년 {resDate.month}월 {resDate.day}일부로 사직코자
          </p>
          <p className="leading-[2.2] text-slate-950 font-serif text-left whitespace-nowrap mt-1" style={{ fontSize: '15pt' }}>
            사직서를 제출하오니 허락하여 주시기 바랍니다.
          </p>
        </div>

        {/* Bottom Submission Date & Signatory */}
        <div className="mb-2 w-full">
          {/* Submission Date: Right Aligned */}
          <div className="text-slate-900 mb-4 font-serif text-right pr-2" style={{ fontSize: '15pt' }}>
            <span className="px-1">{formDate.year}</span>년{' '}
            <span className="px-1">{formDate.month}</span>월{' '}
            <span className="px-1">{formDate.day}</span>일
          </div>

          {/* Signatory: Right Aligned, flush with date */}
          <div className="flex justify-end items-center pr-2 mb-28">
            <div className="flex items-center" style={{ fontSize: '15pt' }}>
              <span className="font-medium text-slate-900 mr-2" style={{ fontSize: '15pt' }}>신&nbsp;&nbsp;청&nbsp;&nbsp;인 :</span>
              <span className="font-normal text-slate-900 min-w-[60px] text-right tracking-wider" style={{ fontSize: '15pt' }}>{data.name || '           '}</span>
              <div className="relative inline-flex items-center justify-center ml-2 w-16 h-8">
                <span className="text-slate-800 font-serif font-bold select-none tracking-wider" style={{ fontSize: '15pt' }}>(인)</span>
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

          {/* Recipient */}
          <div className="text-center pt-12">
            <h2 className="font-bold tracking-[0.25em] text-slate-950 font-serif" style={{ fontSize: '20pt' }}>
              수원시장애인종합복지관 귀중
            </h2>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div
      id="print-page-2"
      className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-[20mm] flex flex-col justify-stretch shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-[20mm] w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] box-border text-[15px] leading-relaxed"
      style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
    >
      {/* Narrow Black Border Box placed 20mm inward */}
      <div className="border-[1.5px] border-black p-[8mm] h-full w-full flex flex-col justify-between box-border flex-1">
        {/* Title */}
        <div className="text-center mt-12 mb-8 w-full">
          <h1 className="font-bold tracking-tight text-slate-950 font-serif leading-snug" style={{ fontSize: '20pt' }}>
            급여 및 퇴직연금 지급 지연 동의서
          </h1>
        </div>

        {/* Statement Body */}
        <div className="px-0 text-left w-full my-auto">
          <p className="text-slate-950 text-justify" style={{ fontSize: '16.5pt', lineHeight: '1.6', textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'keep-all', letterSpacing: '-0.04em' }}>
            장애인활동지원사업 특성상 근로 계약서에 명시된 바와 같이 급여가 1일에서 말일까지 근로 후 익월 15일에 지급되고 있어 사직서 제출과 관계없이 급여는 익월 15일에 지급되며 퇴직연금은 최종 급여지급일 이후 15일 이내({data.consentPensionMonth || '   '}월 30일 이내)에 지급이 지연 처리됨에 동의합니다.
          </p>
        </div>

        {/* Date & Signatory & Footer */}
        <div className="mb-4 w-full">
          {/* Date: Centered */}
          <div className="text-slate-900 mb-12 font-serif text-center" style={{ fontSize: '17pt' }}>
            {data.consentDate ? (
              <>
                <span className="px-1">{consentDate.year}</span>년{' '}
                <span className="px-1">{consentDate.month}</span>월{' '}
                <span className="px-1">{consentDate.day}</span>일
              </>
            ) : (
              <span className="tracking-[1.5em] pl-[1.5em] font-serif">년 월 일</span>
            )}
          </div>

          {/* Signatory: Right Aligned */}
          <div className="flex justify-end items-center pr-2 mb-24">
            <div className="flex items-center" style={{ fontSize: '17pt' }}>
              <span className="font-medium text-slate-900 mr-2" style={{ fontSize: '17pt' }}>동&nbsp;의&nbsp;인 :</span>
              <span className="font-normal text-slate-900 min-w-[60px] text-right tracking-wider" style={{ fontSize: '17pt' }}>{data.name || '           '}</span>
              <div className="relative inline-flex items-center justify-center ml-2 w-16 h-8">
                <span className="text-slate-800 font-serif font-bold select-none tracking-wider" style={{ fontSize: '17pt' }}>(서명)</span>
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

          {/* Recipient */}
          <div className="text-center pt-16 pb-4">
            <h2 className="font-bold tracking-[0.25em] text-slate-950 font-serif" style={{ fontSize: '20pt' }}>
              수원시장애인종합복지관 귀중
            </h2>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage3 = () => {
    const recipient = data.handoverData?.recipients?.[0] || {
      recipientName: '',
      contactOrAddress: '',
      serviceDetails: '',
      precautions: '',
      birthGender: '',
      typeSection: '',
      address: '',
      contact: ''
    };

    return (
      <div
        id="print-page-3"
        className="document-a4-page font-hamchorom bg-white text-slate-900 mx-auto p-[15mm] flex flex-col justify-between shadow-md border border-slate-300 relative print:shadow-none print:border-none print:m-0 print:p-[15mm] w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] box-border text-[11px] leading-normal"
        style={{ fontFamily: HAMCHOROM_BATANG_FONT }}
      >
        {/* Title */}
        <div className="text-center pt-1 mb-3">
          <h1 className="font-bold tracking-[0.5em] indent-[0.5em] text-slate-950 font-serif" style={{ fontSize: '18pt' }}>
            업무 인계·인수서
          </h1>
        </div>

        {/* Outer Border Box wrapping all 5 sections */}
        <div className="border border-black p-3.5 bg-white mb-2 flex flex-col justify-start gap-3">
          
          {/* Section 1: 서비스 대상자 */}
          <div>
            <div className="font-bold text-slate-950 mb-1 flex items-center gap-1" style={{ fontSize: '10.5pt' }}>
              <span className="font-sans">□</span> 서비스 대상자
            </div>
            <table className="w-full border-collapse border-y border-black text-center text-slate-950 bg-white" style={{ fontSize: '9.5pt' }}>
              <tbody>
                <tr className="h-8">
                  <td className="border-b border-r border-black font-bold bg-white" style={{ width: '10%' }}>성명</td>
                  <td className="border-b border-r border-black bg-white" style={{ width: '15%' }}>{recipient.recipientName || ''}</td>
                  <td className="border-b border-r border-black font-bold bg-white whitespace-nowrap" style={{ width: '16%' }}>생년월일/성별</td>
                  <td className="border-b border-r border-black bg-white whitespace-nowrap" style={{ width: '18%' }}>{recipient.birthGender || ''}</td>
                  <td className="border-b border-r border-black font-bold bg-white whitespace-nowrap" style={{ width: '21%' }}>장애유형/서비스 구간</td>
                  <td className="border-b border-black bg-white whitespace-nowrap" style={{ width: '20%' }}>{recipient.typeSection || ''}</td>
                </tr>
                <tr className="h-8">
                  <td className="border-r border-black font-bold bg-white">주소</td>
                  <td className="border-r border-black text-left px-2 bg-white" colSpan={3}>
                    {recipient.address || recipient.contactOrAddress || ''}
                  </td>
                  <td className="border-r border-black font-bold bg-white whitespace-nowrap">연락처</td>
                  <td className="bg-white px-2 whitespace-nowrap">{recipient.contact || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: 서비스 업무 인계·인수사항 */}
          <div>
            <div className="font-bold text-slate-950 mb-1 flex items-center gap-1" style={{ fontSize: '10.5pt' }}>
              <span className="font-sans">□</span> 서비스 업무 인계·인수사항
            </div>
            <table className="w-full border-collapse border-y border-black text-slate-950 bg-white" style={{ fontSize: '9.5pt' }}>
              <tbody>
                <tr className="h-8">
                  <td className="border-b border-r border-black font-bold bg-white text-center" style={{ width: '12%' }}>인계자</td>
                  <td className="border-b border-black text-left px-4 bg-white" colSpan={2}>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-[9.5pt]">{data.handoverData?.handoverPersonName || data.name}</span>
                      <span className="font-normal text-[9.5pt]">
                        (인계일) &nbsp;&nbsp;&nbsp;&nbsp;
                        {handoverDateObj.year ? (
                          <span>{handoverDateObj.year} . {handoverDateObj.month} . {handoverDateObj.day} .</span>
                        ) : (
                          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.</span>
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="h-8">
                  <td className="border-b border-r border-black font-bold bg-white text-center">인수자</td>
                  <td className="border-b border-black text-left px-4 bg-white" colSpan={2}>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-[9.5pt]">{data.handoverData?.takeoverPersonName || '후임 활동지원사'}</span>
                      <span className="font-normal text-[9.5pt]">
                        (인수일) &nbsp;&nbsp;&nbsp;&nbsp;
                        {takeoverDateObj.year ? (
                          <span>{takeoverDateObj.year} . {takeoverDateObj.month} . {takeoverDateObj.day} .</span>
                        ) : (
                          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.</span>
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="h-8">
                  <td className="border-r border-black font-bold bg-white text-center">인계사유</td>
                  <td className="text-left px-2 bg-white" colSpan={2}>
                    {data.handoverData?.handoverReason || '사직으로 인한 장애인활동지원 급여제공 업무 인계'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: 인계·인수 업무사항 */}
          <div>
            <div className="font-bold text-slate-950 mb-1 flex items-center gap-1" style={{ fontSize: '10.5pt' }}>
              <span className="font-sans">○</span> 인계·인수 업무사항
            </div>
            <table className="w-full border-collapse border-y border-black text-slate-950 bg-white" style={{ fontSize: '9.5pt' }}>
              <thead>
                <tr className="text-center font-bold h-8 bg-white">
                  <th className="border-b border-r border-black w-1/2">인계·인수 업무사항</th>
                  <th className="border-b border-black w-1/2">서비스 제공 시 유의사항</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '150px' }}>
                    {recipient.serviceDetails || ''}
                  </td>
                  <td className="p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '150px' }}>
                    {recipient.precautions || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: 진행 및 미결사항 */}
          <div>
            <div className="font-bold text-slate-950 mb-1 flex items-center gap-1" style={{ fontSize: '10.5pt' }}>
              <span className="font-sans">○</span> 진행 및 미결사항
            </div>
            <table className="w-full border-collapse border-y border-black text-slate-950 bg-white" style={{ fontSize: '9.5pt' }}>
              <thead>
                <tr className="text-center font-bold h-8 bg-white">
                  <th className="border-b border-r border-black w-1/2">진행사항</th>
                  <th className="border-b border-black w-1/2">미결사항</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '45px' }}>
                    {data.handoverData?.inProgressItems || ''}
                  </td>
                  <td className="p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '45px' }}>
                    {data.handoverData?.pendingItems || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5: 인계·인수 서류 등 */}
          <div>
            <div className="font-bold text-slate-950 mb-1 flex items-center gap-1" style={{ fontSize: '10.5pt' }}>
              <span className="font-sans">○</span> 인계·인수 서류 등
            </div>
            <table className="w-full border-collapse border-y border-black text-slate-950 bg-white" style={{ fontSize: '9.5pt' }}>
              <thead>
                <tr className="text-center font-bold h-8 bg-white">
                  <th className="border-b border-r border-black w-1/2">서류</th>
                  <th className="border-b border-black w-1/2">기타</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '35px' }}>
                    {data.handoverData?.documentsList || ''}
                  </td>
                  <td className="p-2 align-top whitespace-pre-wrap leading-relaxed text-slate-800 bg-white" style={{ height: '35px' }}>
                    {data.handoverData?.equipmentList || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Bottom Part: Footer Statement, Date, Signatures, Logo (Entirely Outside the Border Box!) */}
        <div className="w-full mt-1">
          {/* Statement */}
          <div className="text-left font-bold text-slate-950 pr-4" style={{ fontSize: '11pt' }}>
            위와 같이 인계·인수합니다.
          </div>

          {/* Date */}
          <div className="text-right font-serif font-bold text-slate-950 my-2 pr-12 tracking-widest" style={{ fontSize: '12pt' }}>
            <span>{handoverConfirmDate.year || 'OOOO'}</span>년&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{handoverConfirmDate.month || 'OO'}</span>월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{handoverConfirmDate.day || 'OO'}</span>일
          </div>

          {/* Role mapping and signatures */}
          <div className="flex justify-between items-start mt-2 px-1">
            {/* Left Role Explanations */}
            <div className="space-y-1 text-slate-700 leading-snug" style={{ fontSize: '9pt' }}>
              <p>*인계자 : 전임 활동지원사</p>
              <p>*인수자 : 후임 활동지원사</p>
              <p>*확인자 : 전담관리인력 또는 관리책임자</p>
            </div>

            {/* Right Interactive Signature Blocks */}
            <div className="w-[250px] space-y-2" style={{ fontSize: '10pt' }}>
              {/* 인계자 */}
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold w-12">인계자</span>
                <span className="text-slate-900 font-semibold truncate text-center flex-1 px-1">
                  {data.handoverData?.handoverPersonName || data.name || ''}
                </span>
                <div className="relative inline-flex items-center justify-end w-16 h-6 text-slate-400 shrink-0 select-none">
                  <span className="text-slate-400 font-normal pr-1">(서명)</span>
                  {(data.handoverData?.handoverSignature || data.applicantSignature) && (
                    <img
                      src={data.handoverData?.handoverSignature || data.applicantSignature}
                      alt="인계자 서명"
                      className="absolute right-0 top-0 bottom-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                      style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* 인수자 */}
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold w-12">인수자</span>
                <span className="text-slate-900 font-semibold truncate text-center flex-1 px-1">
                  {data.handoverData?.takeoverPersonName || ''}
                </span>
                <div className="relative inline-flex items-center justify-end w-16 h-6 text-slate-400 shrink-0 select-none">
                  <span className="text-slate-400 font-normal pr-1">(서명)</span>
                  {data.handoverData?.takeoverSignature && (
                    <img
                      src={data.handoverData.takeoverSignature}
                      alt="인수자 서명"
                      className="absolute right-0 top-0 bottom-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                      style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* 확인자 */}
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold w-12">확인자</span>
                <span className="text-slate-900 font-semibold truncate text-center flex-1 px-1">
                  {data.handoverData?.verifierName || data.managerApproval?.teamLeaderName || ''}
                </span>
                <div className="relative inline-flex items-center justify-end w-16 h-6 text-slate-400 shrink-0 select-none">
                  <span className="text-slate-400 font-normal pr-1">(서명)</span>
                  {(data.handoverData?.verifierSignature || data.managerApproval?.teamLeaderSignature) && (
                    <img
                      src={data.handoverData?.verifierSignature || data.managerApproval?.teamLeaderSignature}
                      alt="확인자 서명"
                      className="absolute right-0 top-0 bottom-0 m-auto max-h-6 max-w-full object-contain pointer-events-none"
                      style={{ filter: 'brightness(0) contrast(200%)', mixBlendMode: 'multiply' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="pt-4 pb-1 flex items-center justify-center">
            <SuwonWelfareLogo size="md" />
          </div>
        </div>

      </div>
    );
  };

  return (
    <div ref={containerRef} className="print-container w-full space-y-12 print:space-y-0">
      {wrapResponsive(renderPage1(), 1)}
      {wrapResponsive(renderPage2(), 2)}
      {wrapResponsive(renderPage3(), 3)}
    </div>
  );
};
