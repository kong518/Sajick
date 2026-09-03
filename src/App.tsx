import React, { useState, useEffect } from 'react';
import { ActiveTab, FormStep, ResignationFormData, UserRole } from './types';
import { createEmptyFormData, sampleSampleFormData } from './data/sampleData';
import {
  loadSubmissions,
  saveSubmission,
  updateSubmissionInStorage,
  deleteSubmissionFromStorage,
  saveDraft,
  loadDraft,
  clearDraft,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { FormStep1Basic } from './components/FormStep1Basic';
import { FormStep2Consent } from './components/FormStep2Consent';
import { FormStep3Review } from './components/FormStep3Review';
import { StandaloneHandoverView } from './components/StandaloneHandoverView';
import { DocumentPaperPreview } from './components/DocumentPaperPreview';
import { AdminSubmissionList } from './components/AdminSubmissionList';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { printDocuments, exportToPdf } from './utils/pdfExport';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './utils/firebase';
import {
  FileEdit,
  FileSignature,
  CheckCircle2,
  Printer,
  Download,
  Eye,
  FileText,
  Shield,
  Lock,
  X,
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('worker');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'handover' || tabParam === 'admin' || tabParam === 'preview') {
      return tabParam as ActiveTab;
    }
    return 'write';
  });
  const [handoverSubId, setHandoverSubId] = useState<string | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('subId') || undefined;
  });
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<ResignationFormData>(() => {
    const draft = loadDraft();
    return draft || createEmptyFormData();
  });
  const [submissions, setSubmissions] = useState<ResignationFormData[]>(() => loadSubmissions());
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<ResignationFormData | null>(null);
  const [previewPageSelect, setPreviewPageSelect] = useState<1 | 2 | 3 | 'all'>('all');
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Auto-save draft when editing in 'write' mode
  useEffect(() => {
    if (formData.name || formData.birthDate || formData.resignationReasonDetail) {
      saveDraft(formData);
    }
  }, [formData]);

  // Subscribe to real-time Firestore submissions
  useEffect(() => {
    const q = query(collection(db, 'submissions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ResignationFormData[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ResignationFormData);
      });
      // Sort submissions by submittedAt (descending) or fall back to formDate
      list.sort((a, b) => {
        const timeA = a.submittedAt || '';
        const timeB = b.submittedAt || '';
        return timeB.localeCompare(timeA);
      });
      
      if (list.length > 0) {
        setSubmissions(list);
        // Also cache in localStorage
        try {
          localStorage.setItem('suwon_rehab_resignation_submissions_v1', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }
      }
    }, (error) => {
      console.error('Firestore subscription error:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateFormData = (updated: Partial<ResignationFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleFillSample = () => {
    setFormData({
      ...sampleSampleFormData,
      id: 'form_' + Date.now(),
      status: 'draft',
    });
    alert('수원시장애인종합복지관 예시 데이터가 입력되었습니다. 각 단계 및 서식을 확인해보세요.');
  };

  const handleResetForm = () => {
    if (confirm('작성 중인 내용을 초기화하시겠습니까?')) {
      clearDraft();
      setFormData(createEmptyFormData());
      setCurrentStep(1);
    }
  };

  // 3단계에서 제출 클릭 시 확인 모달(취소/최종제출) 오픈
  const handleOpenSubmitConfirm = () => {
    const previewSubmission: ResignationFormData = {
      ...formData,
      id: formData.id || 'form_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    setSubmittedData(previewSubmission);
    setIsSuccessModalOpen(true);
  };

  // 모달 안에서 [최종제출] 클릭 시 실제 저장
  const handleFinalSubmitFromModal = () => {
    if (!submittedData) return;
    const submission: ResignationFormData = {
      ...submittedData,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    saveSubmission(submission);
    setSubmissions(loadSubmissions());
    clearDraft();
  };

  const handleUpdateSubmission = (updated: ResignationFormData) => {
    updateSubmissionInStorage(updated);
    setSubmissions(loadSubmissions());
  };

  const handleSaveHandoverFromStandalone = (
    submissionId: string,
    handoverData: ResignationFormData['handoverData'],
    mode?: 'handover' | 'takeover' | 'admin'
  ) => {
    let target = submissions.find((s) => s.id === submissionId);

    const inputRecipient = handoverData.recipients?.[0]?.recipientName?.trim().toLowerCase();

    // 1. Match by 이용자 이름 (recipientName)
    if (!target && inputRecipient) {
      target = submissions.find((s) =>
        s.handoverData?.recipients?.some((r) => {
          const rName = r.recipientName?.trim().toLowerCase();
          return rName && (rName === inputRecipient || rName.includes(inputRecipient) || inputRecipient.includes(rName));
        })
      );
    }

    // 2. Match by 인계자 성명 (handoverPersonName)
    if (!target && handoverData.handoverPersonName) {
      target = submissions.find(
        (s) =>
          s.name.trim() === handoverData.handoverPersonName.trim() ||
          s.handoverData?.handoverPersonName?.trim() === handoverData.handoverPersonName.trim()
      );
    }

    if (target) {
      const existingRecs = target.handoverData?.recipients || [];
      const newRecs = handoverData.recipients || [];
      const mergedRecipients = [...existingRecs];

      if (mergedRecipients.length === 0) {
        if (newRecs.length > 0) mergedRecipients.push(...newRecs);
      } else if (newRecs.length > 0) {
        mergedRecipients[0] = {
          ...mergedRecipients[0],
          recipientName: newRecs[0].recipientName || mergedRecipients[0].recipientName || '',
          contactOrAddress: newRecs[0].contactOrAddress || mergedRecipients[0].contactOrAddress || '',
          serviceDetails: mergedRecipients[0].serviceDetails || newRecs[0].serviceDetails || '',
          precautions: mergedRecipients[0].precautions || newRecs[0].precautions || '',
        };
      }

      const updated: ResignationFormData = {
        ...target,
        handoverData: {
          ...target.handoverData,
          ...handoverData,
          recipients: mergedRecipients,
          handoverPersonName: target.handoverData?.handoverPersonName || handoverData.handoverPersonName || target.name,
          handoverSignature: target.handoverData?.handoverSignature || handoverData.handoverSignature || '',
          takeoverPersonName: handoverData.takeoverPersonName || target.handoverData?.takeoverPersonName || '',
          takeoverSignature: handoverData.takeoverSignature || target.handoverData?.takeoverSignature || '',
        },
      };
      updateSubmissionInStorage(updated);
      setSubmissions(loadSubmissions());
    } else {
      const newSubmission: ResignationFormData = {
        ...createEmptyFormData(),
        id: submissionId || 'form_' + Date.now(),
        name: handoverData.handoverPersonName || '활동지원사',
        department: handoverData.handoverPersonDept || '사회서비스지원팀(활동지원사)',
        resignationDate: handoverData.handoverDate || new Date().toISOString().split('T')[0],
        resignationReason: handoverData.handoverReason || '사직',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        handoverData,
      };
      saveSubmission(newSubmission);
      setSubmissions(loadSubmissions());
    }
  };

  const handleDeleteSubmission = (id: string) => {
    deleteSubmissionFromStorage(id);
    setSubmissions(loadSubmissions());
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSuccessGoToAdmin = () => {
    setIsSuccessModalOpen(false);
    setCurrentRole('admin');
    setActiveTab('admin');
  };

  const handleSuccessResetNew = () => {
    setIsSuccessModalOpen(false);
    clearDraft();
    setFormData(createEmptyFormData());
    setCurrentStep(1);
    setActiveTab('write');
  };

  const handleOpenAdminModal = () => {
    setIsAdminAuthModalOpen(true);
    setAdminPasswordInput('');
    setAdminAuthError('');
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === '5612') {
      setCurrentRole('admin');
      setIsAdminAuthModalOpen(false);
      setActiveTab('admin');
    } else {
      setAdminAuthError('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
    }
  };

  const handleAdminLogout = () => {
    setCurrentRole('worker');
    if (activeTab === 'admin' || activeTab === 'preview') {
      setActiveTab('write');
    }
  };

  const handleSelectTab = (tab: ActiveTab) => {
    if ((tab === 'preview' || tab === 'admin') && currentRole !== 'admin') {
      handleOpenAdminModal();
      return;
    }
    setActiveTab(tab);
  };

  const stepsList: { step: FormStep; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      step: 1,
      title: '1. 기본 정보 입력',
      subtitle: '인적사항 & 사직일자/사유',
      icon: <FileEdit className="w-4 h-4" />,
    },
    {
      step: 2,
      title: '2. 사직서 & 동의서 서명',
      subtitle: '신청인/동의인 전자서명',
      icon: <FileSignature className="w-4 h-4" />,
    },
    {
      step: 3,
      title: '3. 최종 서류 확인 & 제출',
      subtitle: '실물 점검 및 전송',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onFillSample={handleFillSample}
        onReset={handleResetForm}
        submissionCount={submissions.length}
        currentRole={currentRole}
        onRequestAdminAccess={handleOpenAdminModal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* TAB 1: WRITE & SIGN FLOW (사직서 + 지급지연동의서 2종 작성) */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            {/* Step Wizard Bar (3 Steps) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {stepsList.map((item) => {
                  const isActive = currentStep === item.step;
                  const isCompleted = currentStep > item.step;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => setCurrentStep(item.step)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-sm font-semibold ring-2 ring-blue-700/20'
                          : isCompleted
                          ? 'bg-blue-50 text-blue-900 border border-blue-200/60 hover:bg-blue-100/60'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isCompleted
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.icon}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate">{item.title}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Form Rendering */}
            <div className="transition-all duration-150">
              {currentStep === 1 && (
                <FormStep1Basic
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <FormStep2Consent
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(3)}
                  onPrev={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <FormStep3Review
                  formData={formData}
                  onPrev={() => setCurrentStep(2)}
                  onSubmit={handleOpenSubmitConfirm}
                  onEditStep={(step) => setCurrentStep(step)}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STANDALONE HANDOVER SIGNING (업무 인계·인수서 별도 서명) */}
        {activeTab === 'handover' && (
          <StandaloneHandoverView
            submissions={submissions}
            currentRole={currentRole}
            onSaveHandover={handleSaveHandoverFromStandalone}
            initialSubmissionId={handoverSubId}
          />
        )}

        {/* TAB 3: LIVE FULL PREVIEW (관리자 모드 3종 실물 확인) */}
        {activeTab === 'preview' && currentRole === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-700" />
                  수원시장애인종합복지관 사직 서식 3종 1:1 실물 미리보기
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  작성된 정보와 전자서명이 적용된 공식 규격 A4 문서를 확인하고 인쇄 또는 PDF로 저장합니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPreviewPageSelect('all')}
                    className={`px-3 py-1.5 rounded font-bold transition ${
                      previewPageSelect === 'all'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    전체 3장
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPageSelect(1)}
                    className={`px-2.5 py-1.5 rounded font-bold transition ${
                      previewPageSelect === 1
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. 사직서
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPageSelect(2)}
                    className={`px-2.5 py-1.5 rounded font-bold transition ${
                      previewPageSelect === 2
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2. 동의서
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPageSelect(3)}
                    className={`px-2.5 py-1.5 rounded font-bold transition ${
                      previewPageSelect === 3
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3. 인수인계서
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => printDocuments()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  인쇄하기
                </button>
                <button
                  type="button"
                  onClick={() => exportToPdf(formData)}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  PDF 다운로드
                </button>
              </div>
            </div>

            <div className="bg-slate-200/90 p-4 md:p-8 rounded-xl border border-slate-300 overflow-x-auto flex justify-center shadow-inner">
              <DocumentPaperPreview data={formData} page={previewPageSelect} />
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN SUBMISSION MANAGEMENT */}
        {activeTab === 'admin' && currentRole === 'admin' && (
          <AdminSubmissionList
            submissions={submissions}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onNavigateToHandover={(subId) => {
              setHandoverSubId(subId);
              setActiveTab('handover');
            }}
            onNewForm={() => {
              clearDraft();
              setFormData(createEmptyFormData());
              setCurrentStep(1);
              setActiveTab('write');
            }}
          />
        )}
      </main>

      {/* Footer with Small Admin Access */}
      <footer className="bg-slate-200 text-slate-600 border-t border-slate-300 py-3.5 text-center text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">수원시장애인종합복지관 사회서비스지원팀</span>
            <span className="text-slate-400">|</span>
            <span>장애인활동지원사업 활동지원사 전용 전자서식 시스템</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[10px]">
              Confidential · Suwon Rehab
            </span>
            
            {/* Small Discrete Admin Access Button */}
            {currentRole === 'admin' ? (
              <div className="flex items-center gap-1.5 bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300">
                <Shield className="w-3 h-3 text-amber-700" />
                <span>관리자 로그인됨</span>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="text-slate-600 hover:text-slate-900 underline ml-1"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="footer-admin-btn"
                onClick={handleOpenAdminModal}
                className="text-slate-400 hover:text-slate-600 text-[10px] flex items-center gap-1 hover:underline transition p-1"
                title="기관 담당자 관리자 페이지 접속"
              >
                <Lock className="w-2.5 h-2.5" />
                관리자 접속
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Success / Final Submit Modal */}
      {submittedData && (
        <SubmissionSuccessModal
          data={submittedData}
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessClose}
          onFinalSubmit={handleFinalSubmitFromModal}
          onGoToAdmin={handleSuccessGoToAdmin}
          onResetNew={handleSuccessResetNew}
          isAdmin={currentRole === 'admin'}
        />
      )}

      {/* Admin Authentication Modal (Password: 5612) */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">기관 관리자 접속</h3>
                  <p className="text-[11px] text-slate-500">담당자 비밀번호를 입력해 주세요.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  관리자 비밀번호
                </label>
                <input
                  type="password"
                  id="admin-auth-pw-input"
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminAuthError('');
                  }}
                  placeholder="비밀번호 입력"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition font-mono"
                />
                {adminAuthError ? (
                  <p className="text-rose-600 text-[11px] mt-1.5 font-medium">{adminAuthError}</p>
                ) : (
                  <p className="text-slate-400 text-[11px] mt-1.5">
                    * 복지관 담당 관리자 전용 인증 화면입니다.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminAuthModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

