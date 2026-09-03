import React, { useState } from 'react';
import { ResignationFormData } from '../types';
import { exportToPdf, printDocuments, exportSubmissionJson } from '../utils/pdfExport';
import { SignaturePad } from './SignaturePad';
import { DocumentPaperPreview } from './DocumentPaperPreview';
import {
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  Download,
  FileCheck,
  ClipboardList,
  Stamp,
  X,
  FileText,
  UserCheck,
  Users,
  Shield,
  Edit3,
  Info,
  Layers,
} from 'lucide-react';

interface AdminSubmissionListProps {
  submissions: ResignationFormData[];
  onUpdateSubmission: (updated: ResignationFormData) => void;
  onDeleteSubmission: (id: string) => void;
  onNewForm: () => void;
  onNavigateToHandover?: (submissionId?: string) => void;
}

export const AdminSubmissionList: React.FC<AdminSubmissionListProps> = ({
  submissions,
  onUpdateSubmission,
  onDeleteSubmission,
  onNewForm,
  onNavigateToHandover,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ResignationFormData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'preview' | 'approval'>('approval');
  const [previewPage, setPreviewPage] = useState<'all' | 1 | 2 | 3>('all');

  // Approval Signature States inside modal (Page 1 Resignation Approval)
  const [managerSign, setManagerSign] = useState('');
  const [teamLeaderSign, setTeamLeaderSign] = useState('');

  // Handover Document Editable Fields (Page 3)
  // 1. 인적사항
  const [handoverPersonName, setHandoverPersonName] = useState('');
  const [handoverPersonDept, setHandoverPersonDept] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [handoverSign, setHandoverSign] = useState('');

  const [takeoverPersonName, setTakeoverPersonName] = useState('');
  const [takeoverPersonDept, setTakeoverPersonDept] = useState('');
  const [takeoverDate, setTakeoverDate] = useState('');
  const [takeoverSign, setTakeoverSign] = useState('');

  const [verifierName, setVerifierName] = useState('');
  const [verifierSign, setVerifierSign] = useState('');

  const [handoverReason, setHandoverReason] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');

  // 2. 인계 인수 업무사항
  const [serviceDetails, setServiceDetails] = useState('');
  const [precautions, setPrecautions] = useState('');

  // 3. 진행 및 미결사항
  const [inProgressItems, setInProgressItems] = useState('');
  const [pendingItems, setPendingItems] = useState('');

  // 4. 인계 인수서류 및 비품 목록
  const [documentsList, setDocumentsList] = useState('');
  const [equipmentList, setEquipmentList] = useState('');

  // 확정 일자
  const [confirmDate, setConfirmDate] = useState('');

  // Save feedback state
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = submissions.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.department || '').toLowerCase().includes(q) ||
      (item.resignationDate || '').includes(q) ||
      (item.resignationReason || '').toLowerCase().includes(q)
    );
  });

  const handleOpenDetail = (item: ResignationFormData) => {
    setSelectedSubmission(item);

    // 사직서 결재란
    setManagerSign(item.managerApproval?.managerSignature || '');
    setTeamLeaderSign(item.managerApproval?.teamLeaderSignature || '');

    // 1. 인적사항
    // 인계자: 퇴사자가 인수인계서를 안 썼으면 item.name을 기본값으로 두고, 담당자가 수정 가능하도록
    setHandoverPersonName(item.handoverData?.handoverPersonName || item.name || '');
    setHandoverPersonDept(
      item.handoverData?.handoverPersonDept || '사회서비스지원팀'
    );
    setHandoverDate(item.handoverData?.handoverDate || item.resignationDate || item.formDate || '');

    // 인계자 서명:
    // 기존 handoverSignature가 있으면 그것을, 없으면 퇴사자의 사직서 서명(applicantSignature)을 연결
    const effectiveHandoverSign =
      item.handoverData?.handoverSignature || item.applicantSignature || '';
    setHandoverSign(effectiveHandoverSign);

    // 인수자
    setTakeoverPersonName(item.handoverData?.takeoverPersonName || '전담관리인력 (사회서비스지원팀)');
    setTakeoverPersonDept(item.handoverData?.takeoverPersonDept || '사회서비스지원팀');
    setTakeoverDate(item.handoverData?.takeoverDate || item.resignationDate || item.formDate || '');
    setTakeoverSign(item.handoverData?.takeoverSignature || '');

    // 확인자
    setVerifierName(
      item.handoverData?.verifierName || item.managerApproval?.teamLeaderName || '팀장'
    );
    setVerifierSign(
      item.handoverData?.verifierSignature || item.managerApproval?.teamLeaderSignature || ''
    );

    // 인계사유
    setHandoverReason(
      item.handoverData?.handoverReason || '사직으로 인한 활동지원 급여제공 업무 인계'
    );

    // 수급자 정보
    const firstRec = item.handoverData?.recipients?.[0];
    setRecipientName(firstRec?.recipientName || '');
    setRecipientContact(firstRec?.contactOrAddress || '');

    // 2. 업무사항 및 유의사항
    setServiceDetails(firstRec?.serviceDetails || '');
    setPrecautions(firstRec?.precautions || '');

    // 3. 진행 및 미결사항
    setInProgressItems(item.handoverData?.inProgressItems || '');
    setPendingItems(item.handoverData?.pendingItems || '');

    // 4. 서류 및 비품 목록
    setDocumentsList(item.handoverData?.documentsList || '');
    setEquipmentList(item.handoverData?.equipmentList || '');

    // 확정일자
    setConfirmDate(
      item.handoverData?.confirmDate || item.formDate || new Date().toISOString().split('T')[0]
    );

    setPreviewPage('all');
    setActiveAdminTab('approval');
    setIsDetailOpen(true);
  };

  const handleSaveApproval = () => {
    if (!selectedSubmission) return;

    const existingRecs = selectedSubmission.handoverData?.recipients || [];
    const updatedRecs = [...existingRecs];
    if (updatedRecs.length === 0) {
      updatedRecs.push({
        id: 'rec_1',
        recipientName,
        contactOrAddress: recipientContact,
        serviceDetails,
        precautions,
      });
    } else {
      updatedRecs[0] = {
        ...updatedRecs[0],
        recipientName,
        contactOrAddress: recipientContact,
        serviceDetails,
        precautions,
      };
    }

    const updated: ResignationFormData = {
      ...selectedSubmission,
      status: 'approved',
      managerApproval: {
        approved: true,
        approvedAt: new Date().toISOString(),
        managerSignature: managerSign,
        teamLeaderSignature: teamLeaderSign,
        teamLeaderName: verifierName,
      },
      handoverData: {
        ...selectedSubmission.handoverData,
        hasHandover: true,
        handoverPersonName,
        handoverPersonDept,
        handoverDate,
        handoverSignature: handoverSign,

        takeoverPersonName,
        takeoverPersonDept,
        takeoverDate,
        takeoverSignature: takeoverSign,

        verifierName,
        verifierSignature: verifierSign,

        handoverReason,
        recipients: updatedRecs,

        inProgressItems,
        pendingItems,
        documentsList,
        equipmentList,
        confirmDate,
      },
    };

    onUpdateSubmission(updated);
    setSelectedSubmission(updated);

    // 즉각적인 시각 피드백 제공 (버튼 전환 및 토스트 알림)
    setIsSaveSuccess(true);
    setToastMessage('내용 저장이 완료되었습니다. (사직서 결재 및 인수인계서에 즉시 반영됨)');
    setTimeout(() => {
      setIsSaveSuccess(false);
    }, 3000);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 실시간 미리보기용 합성 데이터 (담당자가 편집 중인 내용이 3페이지 양식에 즉시 반영)
  const currentPreviewData: ResignationFormData | null = selectedSubmission
    ? {
        ...selectedSubmission,
        managerApproval: {
          ...selectedSubmission.managerApproval,
          managerSignature: managerSign,
          teamLeaderSignature: teamLeaderSign,
          teamLeaderName: verifierName,
        },
        handoverData: {
          ...selectedSubmission.handoverData,
          hasHandover: true,
          handoverPersonName,
          handoverPersonDept,
          handoverDate,
          handoverSignature: handoverSign,

          takeoverPersonName,
          takeoverPersonDept,
          takeoverDate,
          takeoverSignature: takeoverSign,

          verifierName,
          verifierSignature: verifierSign,

          handoverReason,
          recipients: [
            {
              id: selectedSubmission.handoverData?.recipients?.[0]?.id || 'rec_1',
              recipientName,
              contactOrAddress: recipientContact,
              serviceDetails,
              precautions,
            },
          ],

          inProgressItems,
          pendingItems,
          documentsList,
          equipmentList,
          confirmDate,
        },
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">관리자 접수함</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              총 {submissions.length}건
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            퇴사자가 제출한 사직서 및 업무 인계·인수서의 접수 내역을 확인하고 내용을 수정하거나 결재를 진행합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 소속, 사유 검색..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onNewForm}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            새 사직서 작성
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            접수된 사직서 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">성명</th>
                  <th className="py-3.5 px-4">소속 / 직위</th>
                  <th className="py-3.5 px-4">퇴직예정일</th>
                  <th className="py-3.5 px-4">퇴직사유</th>
                  <th className="py-3.5 px-4">제출일자</th>
                  <th className="py-3.5 px-4 text-center">인수인계 상태</th>
                  <th className="py-3.5 px-4 text-center">담당 결재</th>
                  <th className="py-3.5 px-4 text-center">팀장 전결</th>
                  <th className="py-3.5 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const hasManagerSign = Boolean(item.managerApproval?.managerSignature);
                  const hasTeamLeaderSign = Boolean(item.managerApproval?.teamLeaderSignature);
                  const hasHandover =
                    item.handoverData?.hasHandover !== false &&
                    Boolean(item.handoverData?.recipients && item.handoverData.recipients.length > 0);
                  const hasApplicantSign = Boolean(item.applicantSignature);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        {item.name}
                        {hasApplicantSign && (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="사직서 서명 완료" />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.department} / {item.position}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.resignationDate}
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-[150px]">
                        {item.resignationReason || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.formDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        {hasHandover ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                            <CheckCircle className="w-3 h-3" />
                            작성완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" />
                            미작성(대행가능)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasManagerSign ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            결재완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            <Clock className="w-3 h-3" />
                            결재대기
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasTeamLeaderSign ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                            <CheckCircle className="w-3 h-3" />
                            전결완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            <Clock className="w-3 h-3" />
                            전결대기
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          결재·내용수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`정말 ${item.name} 님의 사직서 데이터를 삭제하시겠습니까?`)) {
                              onDeleteSubmission(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition inline-flex items-center"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Approval / Content Edit Modal */}
      {isDetailOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            {/* Modal Header */}
            <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    {selectedSubmission.name} 님의 사직서 및 업무 인계·인수서
                    <span className="text-xs font-normal text-slate-500">
                      ({selectedSubmission.department} / {selectedSubmission.resignationDate} 퇴직예정)
                    </span>
                  </h3>
                </div>
              </div>

              {/* Header Action Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('approval')}
                    className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                      activeAdminTab === 'approval'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    인수인계서 내용 수정 & 결재 서명
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('preview')}
                    className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                      activeAdminTab === 'preview'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    실물 문서 보기
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Header Direct Save Button */}
                <button
                  type="button"
                  onClick={handleSaveApproval}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs ${
                    isSaveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-700 hover:bg-blue-800 text-white'
                  }`}
                  title="작성된 내용 및 결재 저장"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isSaveSuccess ? '저장 완료!' : '내용 저장'}
                </button>

                <button
                  type="button"
                  onClick={() => printDocuments()}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded transition"
                  title="인쇄"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => exportToPdf(currentPreviewData || selectedSubmission)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded transition"
                  title="PDF 다운로드"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => exportSubmissionJson(currentPreviewData || selectedSubmission)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded transition"
                  title="JSON 데이터 내보내기"
                >
                  <FileCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toast Notification Banner */}
            {toastMessage && (
              <div className="bg-emerald-600 text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold transition-all shadow-md animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>{toastMessage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('preview')}
                    className="underline text-emerald-100 hover:text-white text-xs font-normal"
                  >
                    [실물 문서 보기]로 확인하기 &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setToastMessage(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {activeAdminTab === 'preview' ? (
                <div className="space-y-4">
                  {/* Preview Page Selector */}
                  <div className="flex items-center justify-center gap-2 pb-2">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      페이지 선택:
                    </span>
                    {(['all', 1, 2, 3] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPreviewPage(p)}
                        className={`px-3 py-1 rounded text-xs font-bold transition ${
                          previewPage === p
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p === 'all'
                          ? '1~3페이지 전체'
                          : p === 1
                          ? '1p 사직서'
                          : p === 2
                          ? '2p 동의서'
                          : '3p 업무 인계·인수서'}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    {currentPreviewData && (
                      <DocumentPaperPreview data={currentPreviewData} page={previewPage} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Section 1: 사직서 담당자 결재란 - 1순위 결재 */}
                  <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <Stamp className="w-4 h-4 text-blue-700" />
                          1. 사직서 담당자 결재란 (1페이지 [담당] 날인)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          1페이지 사직서 상단 우측 결재 표의 &apos;담당&apos; 칸에 날인될 담당자(전담관리인력) 결재 서명입니다.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                        1단계: 담당 결재
                      </span>
                    </div>

                    <div className="max-w-md">
                      <SignaturePad
                        value={managerSign}
                        onChange={setManagerSign}
                        title="담당자 결재 서명 (전담관리인력)"
                        required={false}
                      />
                    </div>
                  </div>

                  {/* Section 2: 팀장 결재칸 (별도 독립 결재칸) */}
                  <div className="bg-white p-5 sm:p-6 rounded-xl border-2 border-purple-200 shadow-sm space-y-4 bg-gradient-to-b from-purple-50/20 to-white">
                    <div className="pb-3 border-b border-purple-200 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-purple-950 text-sm sm:text-base flex items-center gap-2">
                          <Stamp className="w-4 h-4 text-purple-700" />
                          2. 팀장 결재칸 (1페이지 [팀장 전결] 결재란)
                        </h4>
                        <p className="text-xs text-purple-800 mt-1">
                          1페이지 사직서 상단 우측 결재 표의 &apos;팀장&apos; 전결 칸에 날인될 팀장 결재 서명입니다.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {teamLeaderSign ? (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-300 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            팀장 서명 완료
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            팀장 결재 대기
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-purple-700 text-white text-xs font-bold rounded-full shadow-xs">
                          2단계: 팀장 전결
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div>
                        <SignaturePad
                          value={teamLeaderSign}
                          onChange={(sign) => {
                            setTeamLeaderSign(sign);
                            // If verifier sign is empty, auto-sync for convenience
                            if (!verifierSign) {
                              setVerifierSign(sign);
                            }
                          }}
                          title="팀장 전결 결재 서명"
                          required={false}
                        />
                      </div>
                      <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4 text-xs text-purple-950 space-y-2.5">
                        <div className="font-bold flex items-center gap-1.5 text-purple-900">
                          <CheckCircle className="w-4 h-4 text-purple-700" />
                          팀장 결재 시 유의사항
                        </div>
                        <p className="text-purple-800 leading-relaxed">
                          • 팀장 전결 서명이 완료되면 <strong>사직서 1페이지 상단 결재란</strong>에 &apos;전결&apos; 날인으로 자동 인쇄됩니다.
                        </p>
                        {teamLeaderSign && (
                          <button
                            type="button"
                            onClick={() => {
                              setVerifierSign(teamLeaderSign);
                              alert('팀장 서명이 3페이지 인수인계서의 확인자 서명란에도 동일하게 반영되었습니다.');
                            }}
                            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            3페이지 인수인계서 &apos;확인자(팀장)&apos; 서명에도 동시 적용
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: 업무 인계·인수서 결재 및 내용 수정 - 3순위 결재 */}
                  <div className="space-y-6">
                    {/* Top Notice Banner */}
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <div className="font-bold flex items-center justify-between gap-2 text-sky-950">
                            <span className="text-sm font-bold flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-sky-700" />
                              3. 업무 인계·인수서 결재 및 내용 수정 (3페이지)
                            </span>
                            <span className="bg-sky-200/80 text-sky-800 text-[11px] px-2 py-0.5 rounded font-bold">
                              * 인계자는 전담관리인력이나 전임 활동지원인력 가능
                            </span>
                          </div>
                          <p className="text-sky-800 leading-relaxed mt-1">
                            • 퇴사자가 인수인계서를 작성하지 않은 경우, <strong>담당자(전담관리인력)가 직접 인계자 이름과 서명을 기재</strong>할 수 있습니다.<br />
                            • 여기서 수정한 모든 내용(인적사항, 업무사항, 유의사항, 진행/미결사항, 비품목록)은 <strong>3페이지 &apos;업무 인계·인수서&apos; 공문서 양식에 실시간으로 반영</strong>됩니다.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-1: 인적사항 및 서명란 (인계자, 인수자, 확인자) */}
                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-700" />
                          3-1. 인적사항 및 서명란 (인계자 · 인수자 · 확인자)
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          인수인계서 상단 및 하단 서명란에 인쇄됩니다
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* 1) 인계자 카드 */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              인계자 (퇴사자 또는 담당자)
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">인계자 성명</label>
                              <input
                                type="text"
                                value={handoverPersonName}
                                onChange={(e) => setHandoverPersonName(e.target.value)}
                                placeholder="성명 입력 (예: 홍길동 또는 담당자)"
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">소속</label>
                                <input
                                  type="text"
                                  value={handoverPersonDept}
                                  onChange={(e) => setHandoverPersonDept(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">인계일</label>
                                <input
                                  type="date"
                                  value={handoverDate}
                                  onChange={(e) => setHandoverDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                                />
                              </div>
                            </div>

                            <div className="pt-1">
                              <SignaturePad
                                value={handoverSign}
                                onChange={setHandoverSign}
                                title="인계자 서명 (담당자 또는 퇴사자)"
                                required={false}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2) 인수자 카드 */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              인수자 (전담관리인력 또는 후임)
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">인수자 성명</label>
                              <input
                                type="text"
                                value={takeoverPersonName}
                                onChange={(e) => setTakeoverPersonName(e.target.value)}
                                placeholder="예: 전담관리인력 또는 후임 활동지원사명"
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">소속</label>
                                <input
                                  type="text"
                                  value={takeoverPersonDept}
                                  onChange={(e) => setTakeoverPersonDept(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">인수일</label>
                                <input
                                  type="date"
                                  value={takeoverDate}
                                  onChange={(e) => setTakeoverDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                                />
                              </div>
                            </div>

                            <div className="pt-1">
                              <SignaturePad
                                value={takeoverSign}
                                onChange={setTakeoverSign}
                                title="인수자 서명 (전담관리인력/후임)"
                                required={false}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3) 확인자 카드 */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-600" />
                              확인자 (팀장 / 부서장)
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">확인자 직책/성명</label>
                              <input
                                type="text"
                                value={verifierName}
                                onChange={(e) => setVerifierName(e.target.value)}
                                placeholder="예: 사회서비스지원팀장"
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">인계인수 확정일자</label>
                              <input
                                type="date"
                                value={confirmDate}
                                onChange={(e) => setConfirmDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div className="pt-1">
                              <SignaturePad
                                value={verifierSign}
                                onChange={setVerifierSign}
                                title="확인자 서명 (팀장/부서장)"
                                required={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 인계사유 및 수급자 정보 */}
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">인계사유</label>
                          <input
                            type="text"
                            value={handoverReason}
                            onChange={(e) => setHandoverReason(e.target.value)}
                            placeholder="사직으로 인한 장애인활동지원 급여제공 업무 인계"
                            className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              수급자 성명 <span className="text-slate-400 font-normal">(수급자성명 란)</span>
                            </label>
                            <input
                              type="text"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              placeholder="예: 이용자 성명 (장애유형 등)"
                              className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              수급자 주소 / 연락처 <span className="text-slate-400 font-normal">(주소/연락처 란)</span>
                            </label>
                            <input
                              type="text"
                              value={recipientContact}
                              onChange={(e) => setRecipientContact(e.target.value)}
                              placeholder="예: 수원시 권선구 매산로 123 (010-XXXX-XXXX)"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3-2: 인계 인수 업무사항 */}
                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-200">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-blue-700" />
                          3-2. 인계 인수 업무사항 (공문서 2번 표 항목)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          서비스 제공시간 및 서비스 제공 시 유의 사항을 구체적으로 기재합니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-bold text-slate-800">
                              인계 · 인수할 업무사항 (급여제공 내용 등)
                            </label>
                            <span className="text-[11px] text-blue-600 font-semibold">
                              ※서비스 제공시간(자세하게)
                            </span>
                          </div>
                          <textarea
                            rows={4}
                            value={serviceDetails}
                            onChange={(e) => setServiceDetails(e.target.value)}
                            placeholder="예: 월~금 09:00~13:00 가사·신체활동 지원 및 외출동행 등 급여제공"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-bold text-slate-800">
                              서비스제공시 유의 사항 및 중요 문제점
                            </label>
                            <span className="text-[11px] text-red-600 font-semibold">
                              ※ 반드시 작성
                            </span>
                          </div>
                          <textarea
                            rows={4}
                            value={precautions}
                            onChange={(e) => setPrecautions(e.target.value)}
                            placeholder="예: 보행 시 낙상 주의 및 휠체어 이동 보조 주의, 복약 시간 준수"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3-3 & 3-4: 진행 및 미결사항 & 인계 인수서류 및 비품 목록 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 3-3. 진행 및 미결사항 */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                          3-3. 진행 및 미결사항
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">진행 사항</label>
                            <textarea
                              rows={2}
                              value={inProgressItems}
                              onChange={(e) => setInProgressItems(e.target.value)}
                              placeholder="예: 당월 활동지원 급여제공 진행 중 (말일 마감 예정)"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">미결 사항</label>
                            <textarea
                              rows={2}
                              value={pendingItems}
                              onChange={(e) => setPendingItems(e.target.value)}
                              placeholder="예: 제공기록지 제출 및 본인부담금 확인 대기"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3-4. 인계 인수서류 및 비품 목록 */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                          3-4. 인계 인수서류 및 비품 목록
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">서류 목록</label>
                            <textarea
                              rows={2}
                              value={documentsList}
                              onChange={(e) => setDocumentsList(e.target.value)}
                              placeholder="예: 활동지원급여 제공기록지 및 일정표 사본 일체"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">비품 목록</label>
                            <textarea
                              rows={2}
                              value={equipmentList}
                              onChange={(e) => setEquipmentList(e.target.value)}
                              placeholder="예: 단말기 반납 확인 완료 또는 특이사항 없음"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-2 pb-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('preview')}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      실물 A4 문서로 확인하기
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDetailOpen(false)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition"
                      >
                        닫기
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveApproval}
                        className={`px-6 py-2.5 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 ${
                          isSaveSuccess
                            ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/20'
                            : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isSaveSuccess ? '저장 완료!' : '내용 저장'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
