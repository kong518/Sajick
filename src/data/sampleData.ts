import { ResignationFormData } from '../types';

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDefaultResignationDate = () => {
  const d = new Date();
  // Default to end of current month or next month
  const nextMonthEnd = new Date(d.getFullYear(), d.getMonth() + 2, 0);
  const year = nextMonthEnd.getFullYear();
  const month = String(nextMonthEnd.getMonth() + 1).padStart(2, '0');
  const day = String(nextMonthEnd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createEmptyFormData = (): ResignationFormData => {
  const today = getTodayDateString();
  const resignationDate = getDefaultResignationDate();
  
  // Calculate next month of resignationDate as the default delay pension month
  let pensionMonth = '1';
  if (resignationDate) {
    const parts = resignationDate.split('-');
    if (parts.length === 3) {
      const resignationMonth = parseInt(parts[1], 10);
      if (!isNaN(resignationMonth) && resignationMonth >= 1 && resignationMonth <= 12) {
        const nextMonth = (resignationMonth % 12) + 1;
        pensionMonth = String(nextMonth);
      }
    }
  }

  return {
    id: 'form_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    status: 'draft',
    department: '사회서비스지원팀(활동지원사)',
    name: '',
    birthDate: '',
    hireDate: '',
    resignationDate: resignationDate,
    resignationReason: '개인사유',
    resignationReasonDetail: '',
    contactPhone: '',

    // 사직서 (Page 1)
    formDate: today,
    applicantSignature: '',
    managerApproval: {
      approved: false,
    },

    // 동의서 (Page 2)
    consentSalaryDelay: true,
    consentPensionMonth: pensionMonth,
    consentDate: today,
    consentSignature: '',

    // 인수인계서 (Page 3)
    handoverData: {
      hasHandover: false,
      handoverPersonName: '',
      handoverPersonDept: '사회서비스지원팀(활동지원사)',
      handoverDate: resignationDate,
      takeoverPersonName: '전담관리인력 (사회서비스지원팀)',
      takeoverPersonDept: '사회서비스지원팀',
      takeoverDate: resignationDate,
      handoverReason: '사직에 따른 장애인 활동지원 급여제공 업무 인수인계',
      recipients: [
        {
          id: 'rec_1',
          recipientName: '',
          contactOrAddress: '',
          serviceDetails: '',
          precautions: '',
        },
      ],
      inProgressItems: '',
      pendingItems: '',
      documentsList: '',
      equipmentList: '',
      confirmDate: today,
      handoverSignature: '',
      takeoverSignature: '',
      verifierSignature: '',
    },
  };
};

const sampleBoldSignature = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="50"><path d="M12 32 Q 35 12, 60 30 T 100 24 T 128 36" fill="none" stroke="%23000000" stroke-width="4.2" stroke-linecap="round"/></svg>';

export const sampleSampleFormData: ResignationFormData = {
  id: 'sample_submission_001',
  submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  status: 'submitted',
  department: '사회서비스지원팀(활동지원사)',
  name: '김영희',
  birthDate: '1968-05-14',
  hireDate: '2021-03-01',
  resignationDate: '2026-04-30',
  resignationReason: '개인사유',
  resignationReasonDetail: '무릎 관절 치료 및 요양',
  contactPhone: '010-3456-7890',

  formDate: '2026-04-10',
  applicantSignature: sampleBoldSignature,
  managerApproval: {
    approved: false,
  },

  consentSalaryDelay: true,
  consentPensionMonth: '5',
  consentDate: '2026-04-10',
  consentSignature: sampleBoldSignature,

  handoverData: {
    hasHandover: true,
    handoverPersonName: '김영희',
    handoverPersonDept: '사회서비스지원팀(활동지원사)',
    handoverDate: '2026-04-30',
    takeoverPersonName: '이민호 (사회복지사)',
    takeoverPersonDept: '사회서비스지원팀',
    takeoverDate: '2026-04-30',
    handoverReason: '사직으로 인한 담당 이용자 활동지원 급여제공 인계',
    recipients: [
      {
        id: 'rec_sample_1',
        recipientName: '박준혁 (뇌병변장애 2급)',
        contactOrAddress: '수원시 팔달구 매산로 123, 102동 405호 (보호자: 010-8888-9999)',
        serviceDetails: '월~금 (09:00 ~ 13:00, 1일 4시간)\n- 신체활동지원: 세면 및 아침 식사 보조, 실내 휠체어 이동 지원\n- 가사활동지원: 주 2회 방 청소 및 환기, 세탁\n- 외출동행: 수요일 10:30 인근 재활의학과 통원 치료 동행',
        precautions: '※ 작성 필요사항:\n1. 휠체어 탑승 시 발 받침대 위치 반드시 고정 확인 필수.\n2. 오전 10시 식후 혈압약 복용 확인 및 미온수 제공 필요.\n3. 갑작스러운 큰 소리에 놀라실 수 있으니 차분한 어조로 소통 요망.',
      },
    ],
    inProgressItems: '4월분 바우처 단말기 결제 정상 진행 중, 4월 30일 최종 결제 및 마감 예정',
    pendingItems: '5월 신규 매칭 활동지원사에게 복약 지도 및 휠체어 보조 요령 대면 인수인계 예정, 복지관 단말기 반납',
    documentsList: '4월 활동지원급여 제공기록지 1부, 수급자별 상태 모니터링 일지',
    equipmentList: '바우처 결제 전용 단말기 1대(충전기 포함), 활동지원사 명찰',
    confirmDate: '2026-04-10',
    handoverSignature: sampleBoldSignature,
    takeoverSignature: '',
    verifierSignature: '',
  },
};
