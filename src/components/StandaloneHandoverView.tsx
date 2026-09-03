import React, { useState } from 'react';
import { HandoverRecipient, ResignationFormData, UserRole } from '../types';
import { SignaturePad } from './SignaturePad';
import { DocumentPaperPreview } from './DocumentPaperPreview';
import {
  FileText,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  Users,
  Info,
  Lock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface StandaloneHandoverViewProps {
  submissions: ResignationFormData[];
  currentRole: UserRole;
  onSaveHandover: (submissionId: string, handoverData: ResignationFormData['handoverData'], mode?: 'handover' | 'takeover' | 'admin') => void;
  initialSubmissionId?: string;
}

type HandoverSignerRole = 'handover' | 'takeover' | 'admin';

export const StandaloneHandoverView: React.FC<StandaloneHandoverViewProps> = ({
  submissions,
  currentRole,
  onSaveHandover,
  initialSubmissionId,
}) => {
  // Signer mode: 'handover' (인계자), 'takeover' (인수자), or 'admin' (관리자 전체)
  const [signerRole, setSignerRole] = useState<HandoverSignerRole>(() => {
    if (currentRole === 'admin') return 'admin';
    return 'handover';
  });

  // Admin-selected submission ID
  const [selectedSubId, setSelectedSubId] = useState<string>(() => {
    if (initialSubmissionId && submissions.some((s) => s.id === initialSubmissionId)) {
      return initialSubmissionId;
    }
    return submissions.length > 0 ? submissions[0].id : '';
  });

  // 1. 인계자 (퇴사 활동지원사) Form State
  const [handoverForm, setHandoverForm] = useState({
    handoverPersonName: '',
    recipientName: '', // 담당 이용자(수급자) 성명
    recipientContact: '', // 이용자 주소/연락처 (선택)
    handoverPersonDept: '사회서비스지원팀(활동지원사)',
    handoverDate: new Date().toISOString().split('T')[0],
    handoverReason: '사직으로 인한 장애인활동지원 급여제공 업무 인계',
    serviceDetails: '', // 인계·인수할 업무사항(급여제공 내용 등, 서비스 제공시간 자세하게)
    precautions: '', // 서비스제공시 유의사항 및 중요 문제점
    handoverSignature: '',
  });

  // 2. 인수자 (후임/전담인력) Form State
  const [takeoverForm, setTakeoverForm] = useState({
    takeoverPersonName: '', // 인수자 본인 이름
    recipientName: '', // 담당 이용자(수급자) 이름
    handoverPersonName: '', // 인계해 준 퇴사 지원사 이름
    takeoverPersonDept: '사회서비스지원팀',
    takeoverDate: new Date().toISOString().split('T')[0],
    takeoverSignature: '',
  });

  // Clipboard copy feedback
  const [copySuccess, setCopySuccess] = useState(false);

  const formatToDateString = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  };

  // 3. Admin Edit Form State
  const activeSubmission = submissions.find((s) => s.id === selectedSubId) || submissions[0] || null;
  const [adminHandoverData, setAdminHandoverData] = useState<ResignationFormData['handoverData'] | null>(null);

  // Update adminHandoverData when selected submission changes
  React.useEffect(() => {
    if (activeSubmission) {
      setAdminHandoverData(activeSubmission.handoverData);
    }
  }, [activeSubmission, selectedSubId]);

  // Submission / Success State
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    type: 'handover' | 'takeover' | 'admin';
    name: string;
    recipientName?: string;
    handoverPersonName?: string;
    serviceDetails?: string;
    precautions?: string;
    handoverSignature?: string;
    takeoverSignature?: string;
    handoverDate?: string;
    submittedAt: string;
  } | null>(null);

  // Error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unique registered recipients list for quick match suggestions
  const registeredRecipients = React.useMemo(() => {
    const list: { recipientName: string; handoverPersonName: string; submissionId: string }[] = [];
    submissions.forEach((s) => {
      const r = s.handoverData?.recipients?.[0];
      const rName = r?.recipientName?.trim();
      const hName = s.handoverData?.handoverPersonName || s.name || '';
      if (rName && !list.some((item) => item.recipientName.toLowerCase() === rName.toLowerCase())) {
        list.push({
          recipientName: rName,
          handoverPersonName: hName,
          submissionId: s.id,
        });
      }
    });
    return list;
  }, [submissions]);

  // Real-time matched submission for takeover by recipient name or handover person name
  const matchedSubmissionForTakeover = React.useMemo(() => {
    const recInput = takeoverForm.recipientName.trim().toLowerCase();
    const handoverInput = takeoverForm.handoverPersonName.trim().toLowerCase();

    if (!recInput && !handoverInput) return null;

    return (
      submissions.find((s) => {
        if (recInput) {
          const matchRec = s.handoverData?.recipients?.some((r) => {
            const rName = r.recipientName?.trim().toLowerCase();
            return rName && (rName === recInput || rName.includes(recInput) || recInput.includes(rName));
          });
          if (matchRec) return true;
        }
        if (handoverInput) {
          const hName = (s.handoverData?.handoverPersonName || s.name || '').trim().toLowerCase();
          if (hName && (hName === handoverInput || hName.includes(handoverInput) || handoverInput.includes(hName))) {
            return true;
          }
        }
        return false;
      }) || null
    );
  }, [submissions, takeoverForm.recipientName, takeoverForm.handoverPersonName]);

  // Handle 인계자 (퇴사 활동지원사) 서명 제출
  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverForm.handoverPersonName.trim()) {
      setErrorMessage('인계자(퇴사 활동지원사) 성명을 입력해 주세요.');
      return;
    }
    if (!handoverForm.recipientName.trim()) {
      setErrorMessage('담당 이용자(수급자) 성명을 입력해 주세요.');
      return;
    }
    if (!handoverForm.serviceDetails.trim()) {
      setErrorMessage('인계·인수할 업무사항(서비스 제공시간 및 급여제공 내용)을 입력해 주세요.');
      return;
    }
    if (!handoverForm.handoverSignature) {
      setErrorMessage('인계자 자필 전자서명을 작성해 주세요.');
      return;
    }

    setErrorMessage(null);

    // Find existing submission matching this employee name, or use initialSubmissionId
    let target = submissions.find(
      (s) => s.id === initialSubmissionId || s.name.trim() === handoverForm.handoverPersonName.trim()
    );

    const targetId = target ? target.id : 'form_' + Date.now();
    const existingRecipients = target?.handoverData?.recipients || [];

    const updatedHandoverData: ResignationFormData['handoverData'] = {
      hasHandover: true,
      handoverPersonName: handoverForm.handoverPersonName.trim(),
      handoverPersonDept: handoverForm.handoverPersonDept,
      handoverDate: handoverForm.handoverDate,
      takeoverPersonName: target?.handoverData?.takeoverPersonName || '',
      takeoverPersonDept: target?.handoverData?.takeoverPersonDept || '사회서비스지원팀',
      takeoverDate: target?.handoverData?.takeoverDate || handoverForm.handoverDate,
      handoverReason: handoverForm.handoverReason,
      recipients: [
        {
          id: existingRecipients[0]?.id || 'rec_1',
          recipientName: handoverForm.recipientName.trim(),
          contactOrAddress: handoverForm.recipientContact.trim() || existingRecipients[0]?.contactOrAddress || '',
          serviceDetails: handoverForm.serviceDetails,
          precautions: handoverForm.precautions,
        },
      ],
      confirmDate: handoverForm.handoverDate,
      handoverSignature: handoverForm.handoverSignature,
      takeoverSignature: target?.handoverData?.takeoverSignature || '',
      verifierSignature: target?.handoverData?.verifierSignature || '',
    };

    onSaveHandover(targetId, updatedHandoverData, 'handover');

    setSubmissionSuccess({
      type: 'handover',
      name: handoverForm.handoverPersonName.trim(),
      recipientName: handoverForm.recipientName.trim(),
      serviceDetails: handoverForm.serviceDetails,
      precautions: handoverForm.precautions,
      handoverSignature: handoverForm.handoverSignature,
      handoverDate: handoverForm.handoverDate,
      submittedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Handle 인수자 (후임/전담인력) 서명 제출
  const handleTakeoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!takeoverForm.takeoverPersonName.trim()) {
      setErrorMessage('인수자(후임/전담인력) 본인 성명을 입력해 주세요.');
      return;
    }
    if (!takeoverForm.recipientName.trim() && !takeoverForm.handoverPersonName.trim()) {
      setErrorMessage('담당 이용자(수급자) 성명을 입력해 주세요.');
      return;
    }
    if (!takeoverForm.takeoverSignature) {
      setErrorMessage('인수자 자필 전자서명을 작성해 주세요.');
      return;
    }

    setErrorMessage(null);

    // Find submission matching the recipient name or handover person's name
    let target = matchedSubmissionForTakeover;
    if (!target && takeoverForm.recipientName.trim()) {
      const cleanRec = takeoverForm.recipientName.trim().toLowerCase();
      target = submissions.find((s) =>
        s.handoverData?.recipients?.some((r) => {
          const rName = r.recipientName?.trim().toLowerCase();
          return rName && (rName === cleanRec || rName.includes(cleanRec) || cleanRec.includes(rName));
        })
      );
    }
    if (!target && takeoverForm.handoverPersonName.trim()) {
      const cleanHandover = takeoverForm.handoverPersonName.trim().toLowerCase();
      target = submissions.find(
        (s) =>
          s.name.trim().toLowerCase() === cleanHandover ||
          s.handoverData?.handoverPersonName?.trim().toLowerCase() === cleanHandover
      );
    }

    const targetId = target ? target.id : 'form_' + Date.now();
    const existingHandover = target?.handoverData || {
      hasHandover: true,
      handoverPersonName: takeoverForm.handoverPersonName.trim(),
      handoverPersonDept: '사회서비스지원팀(활동지원사)',
      handoverDate: takeoverForm.takeoverDate,
      takeoverPersonName: takeoverForm.takeoverPersonName.trim(),
      takeoverPersonDept: takeoverForm.takeoverPersonDept,
      takeoverDate: takeoverForm.takeoverDate,
      handoverReason: '사직으로 인한 활동지원 급여제공 업무 인계',
      recipients: [
        {
          id: 'rec_1',
          recipientName: takeoverForm.recipientName.trim(),
          contactOrAddress: '',
          serviceDetails: '가사·신체활동 지원 및 외출동행 등 급여제공 업무 인수',
          precautions: '',
        },
      ],
      confirmDate: takeoverForm.takeoverDate,
      handoverSignature: '',
      takeoverSignature: takeoverForm.takeoverSignature,
      verifierSignature: '',
    };

    const targetRec = existingHandover.recipients?.[0];

    const updatedHandoverData: ResignationFormData['handoverData'] = {
      ...existingHandover,
      takeoverPersonName: takeoverForm.takeoverPersonName.trim(),
      takeoverPersonDept: takeoverForm.takeoverPersonDept,
      takeoverDate: takeoverForm.takeoverDate,
      takeoverSignature: takeoverForm.takeoverSignature,
      recipients: [
        {
          id: targetRec?.id || 'rec_1',
          recipientName: targetRec?.recipientName || takeoverForm.recipientName.trim(),
          contactOrAddress: targetRec?.contactOrAddress || '',
          serviceDetails: targetRec?.serviceDetails || '가사·신체활동 지원 및 외출동행 등 급여제공 업무 인수',
          precautions: targetRec?.precautions || '',
        },
      ],
    };

    onSaveHandover(targetId, updatedHandoverData, 'takeover');

    setSubmissionSuccess({
      type: 'takeover',
      name: takeoverForm.takeoverPersonName.trim(),
      recipientName: targetRec?.recipientName || takeoverForm.recipientName.trim(),
      handoverPersonName: target?.handoverData?.handoverPersonName || target?.name || takeoverForm.handoverPersonName.trim(),
      serviceDetails: targetRec?.serviceDetails || '',
      precautions: targetRec?.precautions || '',
      handoverSignature: target?.handoverData?.handoverSignature || target?.applicantSignature || '',
      takeoverSignature: takeoverForm.takeoverSignature,
      handoverDate: target?.handoverData?.handoverDate || target?.resignationDate || '',
      submittedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Handle Admin direct save
  const handleAdminSave = () => {
    if (!activeSubmission || !adminHandoverData) return;
    onSaveHandover(activeSubmission.id, adminHandoverData, 'admin');
    alert('업무 인수인계서 및 수급자 정보가 관리자 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">
              업무 인계·인수서 전자 서명
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            사직 활동지원사(인계자)와 후임 또는 전담관리인력(인수자)의 양자 전자서명을 각각 진행합니다.
          </p>
        </div>

        {/* Privacy Note Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-600">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>개인정보 보호를 위해 본인 서명만 안전하게 접수됩니다.</span>
        </div>
      </div>

      {/* Role Selector Tabs (인계자 vs 인수자 vs 관리자) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-3 gap-1.5 text-xs font-bold">
        <button
          type="button"
          id="btn-signer-handover"
          onClick={() => {
            setSignerRole('handover');
            setSubmissionSuccess(null);
            setErrorMessage(null);
          }}
          className={`py-2 px-1.5 sm:py-3 sm:px-4 rounded-lg flex flex-col items-center justify-center text-center leading-tight transition ${
            signerRole === 'handover'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="text-xs sm:text-sm font-bold">인계자 서명</span>
          </div>
          <span className="text-[10px] mt-0.5 font-normal opacity-90">(퇴사 활동지원사)</span>
        </button>

        <button
          type="button"
          id="btn-signer-takeover"
          onClick={() => {
            setSignerRole('takeover');
            setSubmissionSuccess(null);
            setErrorMessage(null);
          }}
          className={`py-2 px-1.5 sm:py-3 sm:px-4 rounded-lg flex flex-col items-center justify-center text-center leading-tight transition ${
            signerRole === 'takeover'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs sm:text-sm font-bold">인수자 서명</span>
          </div>
          <span className="text-[10px] mt-0.5 font-normal opacity-90">(후임 / 전담인력)</span>
        </button>

        {currentRole === 'admin' && (
          <button
            type="button"
            id="btn-signer-admin"
            onClick={() => {
              setSignerRole('admin');
              setSubmissionSuccess(null);
              setErrorMessage(null);
            }}
            className={`col-span-2 md:col-span-1 py-2 px-1.5 sm:py-3 sm:px-4 rounded-lg flex flex-col items-center justify-center text-center leading-tight transition ${
              signerRole === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1 justify-center">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold">기관 관리자</span>
            </div>
            <span className="text-[10px] mt-0.5 font-normal opacity-90">(통합 관리 모드)</span>
          </button>
        )}
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* SUCCESS CONFIRMATION RECEIPT & TAKEOVER HANDOVER REVIEW */}
      {submissionSuccess && (
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {submissionSuccess.type === 'handover'
                ? '인계자 전자서명 및 업무 인계서 등록 완료'
                : '인수자 전자서명 및 업무 인계사항 확인 완료'}
            </h3>
            <p className="text-xs text-slate-600">
              <strong>{submissionSuccess.name}</strong> 님의 서명이 {submissionSuccess.submittedAt}에 안전하게 등록되었습니다.
            </p>
          </div>

          {/* TAKEOVER MODE: 인계자가 작성한 업무사항 및 유의사항 실시간 열람 */}
          {submissionSuccess.type === 'takeover' && (
            <div className="space-y-4">
              {submissionSuccess.serviceDetails || submissionSuccess.precautions ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-900 text-sm">
                      이용자 [{submissionSuccess.recipientName}] 님 업무 인계사항 자동 연동 완료
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      인계자 <strong>{submissionSuccess.handoverPersonName}</strong> 님이 작성하신 급여제공 업무사항 및 유의사항이 성공적으로 연동되었습니다. 아래 내용을 꼼꼼히 확인해 주시기 바랍니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-blue-900">
                      이용자 [{submissionSuccess.recipientName}] 님 인수자 서명 접수 완료
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      인수자 서명이 정상 접수되었습니다. 인계자가 동일한 이용자 이름으로 인계서를 제출하면 복지관 보관함에서 자동으로 상호 결합됩니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed handover notes view */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">업무 인계·인수 열람 내역</span>
                    <h4 className="text-base font-bold text-slate-900">
                      담당 이용자: {submissionSuccess.recipientName || '수급자'} 님
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded font-bold">
                      인계자: {submissionSuccess.handoverPersonName || '퇴사 지원사'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded font-bold">
                      인수자: {submissionSuccess.name}
                    </span>
                  </div>
                </div>

                {/* 1. 업무사항 */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-700" />
                    1. 인계·인수할 업무사항 (급여제공 내용 및 서비스 제공시간)
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {submissionSuccess.serviceDetails || '인계자가 등록한 상세 업무사항이 없거나 대기 중입니다.'}
                  </div>
                </div>

                {/* 2. 유의사항 */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    2. 서비스 제공 시 유의사항 및 중요 문제점 (필독 특이사항)
                  </div>
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {submissionSuccess.precautions || '특이사항 없음'}
                  </div>
                </div>

                {/* 양자 서명 확인 카드 */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[11px] text-slate-500 font-medium mb-1">
                      인계자 ({submissionSuccess.handoverPersonName || '퇴사자'}) 서명
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      {submissionSuccess.handoverSignature ? (
                        <img
                          src={submissionSuccess.handoverSignature}
                          alt="인계자 서명"
                          className="max-h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">(인계 서명 대기)</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-lg text-center">
                    <div className="text-[11px] text-emerald-800 font-bold mb-1">
                      인수자 ({submissionSuccess.name}) 서명
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      {submissionSuccess.takeoverSignature ? (
                        <img
                          src={submissionSuccess.takeoverSignature}
                          alt="인수자 서명"
                          className="max-h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold">서명 완료</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HANDOVER MODE: 인계자 접수 확인 카드 */}
          {submissionSuccess.type === 'handover' && (
            <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
              <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 mb-1">
                <Lock className="w-4 h-4 text-blue-600" />
                인계서 접수 확인
              </div>
              <p>• 담당 이용자: <strong>{submissionSuccess.recipientName}</strong> 님</p>
              <p>• 작성하신 업무사항 및 유의사항이 안전하게 암호화 보관되었습니다.</p>
              <p>• 후임 활동지원사(인수자)가 동일한 이용자 성명(<strong>{submissionSuccess.recipientName}</strong>)으로 서명 시 인계내역이 자동 연동되어 확인하게 됩니다.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {submissionSuccess.type === 'takeover' && (
              <button
                type="button"
                onClick={() => {
                  const copyText = `[이용자 ${submissionSuccess.recipientName} 님 인수인계 사항]\n\n■ 주요 업무사항:\n${submissionSuccess.serviceDetails || '내용 없음'}\n\n■ 유의사항 및 특이사항:\n${submissionSuccess.precautions || '특이사항 없음'}\n\n(인계자: ${submissionSuccess.handoverPersonName} / 인수자: ${submissionSuccess.name})`;
                  navigator.clipboard.writeText(copyText);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2500);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                {copySuccess ? '✓ 업무사항 복사완료!' : '업무사항 클립보드 복사'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(null);
                if (submissionSuccess.type === 'handover') {
                  setHandoverForm({
                    ...handoverForm,
                    handoverPersonName: '',
                    recipientName: '',
                    recipientContact: '',
                    serviceDetails: '',
                    precautions: '',
                    handoverSignature: '',
                  });
                } else {
                  setTakeoverForm({
                    ...takeoverForm,
                    takeoverPersonName: '',
                    recipientName: '',
                    handoverPersonName: '',
                    takeoverSignature: '',
                  });
                }
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              추가 작성 또는 새 서명 진행
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: 인계자 서명 화면 (퇴사 활동지원사) */}
      {!submissionSuccess && signerRole === 'handover' && (
        <form onSubmit={handleHandoverSubmit} className="space-y-6">
          {/* Form Guide Banner */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">인계자(퇴사 활동지원사) 작성 안내:</strong>
              <p className="text-slate-700 leading-relaxed">
                본인 성명과 담당하셨던 <strong>이용자(수급자) 성명</strong>을 입력하고, 활동지원 급여제공 내용 및 유의사항을 작성한 후 하단에 자필 전자서명을 완료해 주세요.
              </p>
              <p className="text-blue-900 font-medium">
                ※ 인수자가 동일한 이용자 이름을 입력하고 서명하면, 인계자가 남기신 업무사항과 유의사항이 자동으로 전달됩니다.
              </p>
            </div>
          </div>

          {/* 1. 인계자 인적사항 및 담당 이용자(수급자) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-blue-700" />
              1. 인계자 인적사항 및 담당 이용자(수급자)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  인계자 성명 (퇴사 활동지원사) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-handover-name"
                  value={handoverForm.handoverPersonName}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handoverPersonName: e.target.value })}
                  placeholder="예: 홍길동"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  담당 이용자 성명 (수급자 이름) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-handover-recipientName"
                  value={handoverForm.recipientName}
                  onChange={(e) => setHandoverForm({ ...handoverForm, recipientName: e.target.value })}
                  placeholder="예: 박준혁, 김복지"
                  className="w-full px-3 py-2 border border-blue-400 bg-blue-50/30 rounded text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-blue-700 mt-1 block">
                  ※ 인수자가 같은 이용자 이름을 입력하면 자동 매칭됩니다.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  인계일자 (사직일자/마지막 근무일) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9\-]*"
                  value={handoverForm.handoverDate}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handoverDate: formatToDateString(e.target.value) })}
                  placeholder="예: 2026-09-03"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  숫자 8자리를 입력하시면 자동 포맷팅됩니다.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">인계자 소속</label>
                <input
                  type="text"
                  value={handoverForm.handoverPersonDept}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handoverPersonDept: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-700 bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">이용자 주소 / 연락처 (선택)</label>
                <input
                  type="text"
                  value={handoverForm.recipientContact}
                  onChange={(e) => setHandoverForm({ ...handoverForm, recipientContact: e.target.value })}
                  placeholder="예: 수원시 팔달구 매산로"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">인계사유</label>
                <input
                  type="text"
                  value={handoverForm.handoverReason}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handoverReason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. 인계 인수 업무사항 (급여제공 내용 & 유의사항) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-700" />
              2. 인계 인수 업무사항 (급여제공 내용 및 유의사항)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1 text-xs">
                  인계·인수할 업무사항 (급여제공 내용 등) <span className="text-rose-500">*</span>
                  <span className="font-normal text-slate-500 ml-1">
                    (※ 서비스 제공시간 자세하게: 요일별 제공시간, 신체/가사/외출동행 등 주요 지원내용)
                  </span>
                </label>
                <textarea
                  id="input-handover-serviceDetails"
                  rows={4}
                  value={handoverForm.serviceDetails}
                  onChange={(e) => setHandoverForm({ ...handoverForm, serviceDetails: e.target.value })}
                  placeholder="예: 월~금 09:00 ~ 13:00 (1일 4시간)&#10;- 신체활동지원: 기상 후 세면 및 아침 식사 보조, 실내 이동 지원&#10;- 가사활동지원: 주 2회 거주공간 청소 및 환기, 세탁 보조&#10;- 외출동행: 매주 수요일 인근 재활의학과 통원 치료 동행"
                  className="w-full p-3 border border-slate-300 rounded text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1 text-xs">
                  서비스 제공 시 유의사항 및 중요 문제점
                  <span className="font-normal text-slate-500 ml-1">
                    (※ 수급자 상태 주의사항, 복약 지도, 응급상황 대처요령, 특이사항)
                  </span>
                </label>
                <textarea
                  id="input-handover-precautions"
                  rows={3}
                  value={handoverForm.precautions}
                  onChange={(e) => setHandoverForm({ ...handoverForm, precautions: e.target.value })}
                  placeholder="예: 휠체어 이동 시 발받침대 고정 확인 필수, 오전 10시 식후 혈압약 복용 확인, 차분한 어조로 소통 요망"
                  className="w-full p-3 border border-slate-300 rounded text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. 인계자 자필 전자서명 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-blue-700" />
              3. 인계자 전자서명 <span className="text-rose-500">*</span>
            </h3>

            <p className="text-xs text-slate-600">
              상기 사항을 정히 인계함을 확인하며 아래에 정자 또는 자필로 서명해 주세요.
            </p>

            <SignaturePad
              value={handoverForm.handoverSignature}
              onChange={(sig) => setHandoverForm({ ...handoverForm, handoverSignature: sig })}
              title="인계자 (퇴사 활동지원사) 자필 서명"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="submit-handover-btn"
              className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              인계자 전자서명 완료 및 제출
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: 인수자 서명 화면 (후임 지원사 또는 전담관리인력) */}
      {!submissionSuccess && signerRole === 'takeover' && (
        <form onSubmit={handleTakeoverSubmit} className="space-y-6">
          {/* Guide Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">인수자(후임 활동지원사 또는 전담관리인력) 서명 안내:</strong>
              <p className="text-slate-700 leading-relaxed">
                인계받으시는 <strong>담당 이용자(수급자) 성명</strong>과 본인 성명을 입력하고 자필 전자서명을 완료해 주세요.
              </p>
              <p className="text-emerald-900 font-medium">
                ※ 인계자가 동일한 이용자 성명으로 등록한 인계 내역이 자동으로 감지되며, 서명 제출 후 인계자가 작성한 <strong>[업무사항 및 유의사항]</strong> 전문을 즉시 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Quick Autocomplete Chips for Registered Recipients */}
          {registeredRecipients.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">💡 최근 등록된 인계 대상 이용자 (클릭 시 자동 입력):</span>
              <div className="flex flex-wrap gap-2">
                {registeredRecipients.map((rec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTakeoverForm({
                        ...takeoverForm,
                        recipientName: rec.recipientName,
                        handoverPersonName: rec.handoverPersonName || takeoverForm.handoverPersonName,
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>이용자: {rec.recipientName}</span>
                    {rec.handoverPersonName && (
                      <span className="text-[10px] text-emerald-700 font-normal">({rec.handoverPersonName} 인계)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Automatic Recognition Banner */}
          {matchedSubmissionForTakeover && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-xs text-emerald-950 flex items-start gap-3 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-900 text-sm">
                  이용자 인수인계 자동 연동 확인: [{matchedSubmissionForTakeover.handoverData?.recipients?.[0]?.recipientName || takeoverForm.recipientName}] 님
                </div>
                <p className="text-slate-700">
                  인계자 <strong>{matchedSubmissionForTakeover.handoverData?.handoverPersonName || matchedSubmissionForTakeover.name}</strong> 님의 인계 내역이 연결되었습니다.
                </p>
                <p className="text-emerald-800 font-bold">
                  ✓ 아래 인수자 서명을 완료하고 제출하시면, 인계자가 남긴 [업무사항 및 유의사항] 전문이 즉시 표시됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 인수자 정보 입력 카드 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-emerald-700" />
              1. 인수자 및 담당 이용자 확인
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  담당 이용자 성명 (수급자 이름) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-takeover-recipientName"
                  value={takeoverForm.recipientName}
                  onChange={(e) => setTakeoverForm({ ...takeoverForm, recipientName: e.target.value })}
                  placeholder="예: 박준혁, 김복지"
                  className="w-full px-3 py-2 border border-emerald-500 bg-emerald-50/20 rounded text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  ※ 인계자가 작성한 이용자 이름과 동일하게 입력하시면 업무내용이 자동 연동됩니다.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  인수자 성명 (본인 성명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-takeover-name"
                  value={takeoverForm.takeoverPersonName}
                  onChange={(e) => setTakeoverForm({ ...takeoverForm, takeoverPersonName: e.target.value })}
                  placeholder="예: 김철수 (후임 지원사 또는 전담인력)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  인계 대상자 성명 (퇴사 활동지원사)
                </label>
                <input
                  type="text"
                  id="input-takeover-handoverName"
                  value={takeoverForm.handoverPersonName}
                  onChange={(e) => setTakeoverForm({ ...takeoverForm, handoverPersonName: e.target.value })}
                  placeholder="예: 홍길동 (퇴사 지원사 이름)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">인수자 소속</label>
                <input
                  type="text"
                  value={takeoverForm.takeoverPersonDept}
                  onChange={(e) => setTakeoverForm({ ...takeoverForm, takeoverPersonDept: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-700 bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  인수일자 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9\-]*"
                  value={takeoverForm.takeoverDate}
                  onChange={(e) => setTakeoverForm({ ...takeoverForm, takeoverDate: formatToDateString(e.target.value) })}
                  placeholder="예: 2026-09-03"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  숫자 8자리를 입력하시면 자동 포맷팅됩니다.
                </span>
              </div>
            </div>
          </div>

          {/* 인수자 자필 전자서명 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-emerald-700" />
              2. 인수자 전자서명 <span className="text-rose-500">*</span>
            </h3>

            <p className="text-xs text-slate-600">
              상기 인계 사항을 정히 인수함을 확인하며 아래에 자필로 서명해 주세요. 서명 완료 후 인계자의 업무사항 및 유의사항이 즉시 열람됩니다.
            </p>

            <SignaturePad
              value={takeoverForm.takeoverSignature}
              onChange={(sig) => setTakeoverForm({ ...takeoverForm, takeoverSignature: sig })}
              title="인수자 (후임 지원사 또는 전담관리인력) 자필 서명"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="submit-takeover-btn"
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              인수자 전자서명 완료 및 업무사항 확인
            </button>
          </div>
        </form>
      )}

      {/* MODE 3: 관리자 통합 관리 모드 (Admin Only) */}
      {signerRole === 'admin' && currentRole === 'admin' && activeSubmission && adminHandoverData && (
        <div className="space-y-6">
          {/* Submission Selector for Admin */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">관리 대상 활동지원사 선택:</span>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded font-bold text-blue-900 focus:outline-none"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.resignationDate || sub.formDate}) - {sub.handoverData?.handoverSignature ? '인계자 서명완료' : '인계서명 대기'} / {sub.handoverData?.takeoverSignature ? '인수자 서명완료' : '인수서명 대기'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdminSave}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                관리자 저장
              </button>
            </div>
          </div>

          {/* 수급자 정보 관리 (담당자가 기재하는 영역) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-700" />
                수급자(이용자) 정보 기재 (담당자 작성 영역)
              </h3>
              <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                복지관 담당자 입력용
              </span>
            </div>

            <p className="text-xs text-slate-600">
              ※ 이용자(수급자) 성명 및 주소/연락처는 개인정보 보호를 위해 지원사가 작성하지 않고, 복지관 담당자가 아래에서 직접 입력 및 관리합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">수급자 성명</label>
                <input
                  type="text"
                  value={adminHandoverData.recipients?.[0]?.recipientName || ''}
                  onChange={(e) => {
                    const recs = [...(adminHandoverData.recipients || [])];
                    if (recs.length === 0) {
                      recs.push({ id: 'rec_1', recipientName: e.target.value, contactOrAddress: '', serviceDetails: '', precautions: '' });
                    } else {
                      recs[0] = { ...recs[0], recipientName: e.target.value };
                    }
                    setAdminHandoverData({ ...adminHandoverData, recipients: recs });
                  }}
                  placeholder="예: 박준혁 (뇌병변장애)"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">수급자 주소 / 연락처</label>
                <input
                  type="text"
                  value={adminHandoverData.recipients?.[0]?.contactOrAddress || ''}
                  onChange={(e) => {
                    const recs = [...(adminHandoverData.recipients || [])];
                    if (recs.length === 0) {
                      recs.push({ id: 'rec_1', recipientName: '', contactOrAddress: e.target.value, serviceDetails: '', precautions: '' });
                    } else {
                      recs[0] = { ...recs[0], contactOrAddress: e.target.value };
                    }
                    setAdminHandoverData({ ...adminHandoverData, recipients: recs });
                  }}
                  placeholder="예: 수원시 팔달구 매산로 123 (010-XXXX-XXXX)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 양자 서명 상태 확인 카드 (인계자 서명 & 인수자 서명 실시간 표시) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 인계자 서명 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">인계자 (퇴사자)</span>
                {adminHandoverData.handoverSignature ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">서명 완료</span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">서명 대기</span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">{adminHandoverData.handoverPersonName || activeSubmission.name}</div>
              <div className="h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-1">
                {adminHandoverData.handoverSignature ? (
                  <img src={adminHandoverData.handoverSignature} alt="인계자 서명" className="max-h-14 max-w-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-slate-400 text-xs">(미서명)</span>
                )}
              </div>
            </div>

            {/* 인수자 서명 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">인수자 (후임/전담인력)</span>
                {adminHandoverData.takeoverSignature ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">서명 완료</span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">서명 대기</span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">{adminHandoverData.takeoverPersonName || '전담관리인력'}</div>
              <div className="h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-1">
                {adminHandoverData.takeoverSignature ? (
                  <img src={adminHandoverData.takeoverSignature} alt="인수자 서명" className="max-h-14 max-w-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-slate-400 text-xs">(미서명)</span>
                )}
              </div>
            </div>

            {/* 확인자(팀장) 결재 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">확인자 (팀장)</span>
                {adminHandoverData.verifierSignature || activeSubmission.managerApproval?.teamLeaderSignature ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">결재 완료</span>
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">결재 대기</span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">사회서비스지원팀장</div>
              <div className="h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-1">
                {adminHandoverData.verifierSignature || activeSubmission.managerApproval?.teamLeaderSignature ? (
                  <img src={adminHandoverData.verifierSignature || activeSubmission.managerApproval?.teamLeaderSignature} alt="확인자 서명" className="max-h-14 max-w-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-slate-400 text-xs">(미서명)</span>
                )}
              </div>
            </div>
          </div>

          {/* Paper Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-auto">
            <h4 className="font-bold text-slate-900 text-xs mb-4">A4 실물 공문서 실시간 출력 미리보기</h4>
            <DocumentPaperPreview data={{ ...activeSubmission, handoverData: adminHandoverData }} page={3} />
          </div>
        </div>
      )}
    </div>
  );
};
