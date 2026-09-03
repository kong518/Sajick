export interface HandoverRecipient {
  id: string;
  recipientName: string; // 수급자 성명 (담당자 기재)
  contactOrAddress: string; // 주소 / 연락처 (담당자 기재)
  serviceDetails: string; // 인계·인수할 업무사항 (급여제공 내용 등, 서비스 제공시간 자세하게)
  precautions: string; // 서비스 제공시 유의사항 및 참고사항
  birthGender?: string; // 생년월일/성별
  typeSection?: string; // 장애유형/서비스 구간
  address?: string; // 주소
  contact?: string; // 연락처
}

export interface ResignationFormData {
  id: string;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // 1. 공통 기본 인적사항
  department: string; // 소속 (기본값: 사회서비스지원팀(활동지원사))
  name: string; // 성명
  birthDate: string; // 생년월일 (YYYY-MM-DD or YYYY년 MM월 DD일)
  hireDate: string; // 입사일자 (YYYY-MM-DD)
  resignationDate: string; // 사직 희망 일자 (YYYY-MM-DD)
  resignationReason: string; // 사직사유 (건강상의 이유, 타기관 이직, 개인사정, 정년퇴직, 기타 등)
  resignationReasonDetail: string; // 상세 사유
  contactPhone: string; // 연락처 (보조 필드)

  // 2. 사직서 (Page 1)
  formDate: string; // 사직서 작성일자 (YYYY-MM-DD)
  applicantSignature: string; // 신청인 서명 (Base64 Image URL)
  managerApproval?: {
    approved: boolean;
    approvedAt?: string;
    managerName?: string;
    managerSignature?: string;
    teamLeaderName?: string;
    teamLeaderSignature?: string;
  };

  // 3. 급여 및 퇴직연금 지급 지연 동의서 (Page 2)
  consentSalaryDelay: boolean; // 동의 여부 체크
  consentPensionMonth: string; // 퇴직연금 지급 예정 월 (예: "4")
  consentDate: string; // 동의서 작성일자
  consentSignature: string; // 동의인 서명 (Base64 Image URL)

  // 4. 업무 인계·인수서 (Page 3)
  handoverData: {
    hasHandover?: boolean; // 인수인계 작성 여부 (해당 없음 선택 가능)
    // 1. 인적사항
    handoverPersonName: string; // 인계자 성명
    handoverPersonDept: string; // 인계자 소속
    handoverDate: string; // 인계일
    
    takeoverPersonName: string; // 인수자 성명 (전담관리인력 또는 후임)
    takeoverPersonDept: string; // 인수자 소속
    takeoverDate: string; // 인수일
    
    handoverReason: string; // 인계사유
    
    // 수급자별 인수인계 목록
    recipients: HandoverRecipient[];
    
    // 3. 진행 및 미결사항
    inProgressItems?: string; // 진행 사항
    pendingItems?: string; // 미결 사항
    
    // 4. 인계 인수 서류 및 비품 목록
    documentsList?: string; // 서류
    equipmentList?: string; // 비품
    
    // 서명란
    confirmDate: string; // 인수인계 작성일
    handoverSignature: string; // 인계자 서명 (인)
    takeoverSignature: string; // 인수자 서명 (인)
    verifierSignature: string; // 확인자 서명 (인)
    verifierName?: string;
  };

  // 관리자 메모
  adminNotes?: string;
}

export type UserRole = 'worker' | 'admin';
export type ActiveTab = 'write' | 'handover' | 'preview' | 'admin' | 'guide';
export type FormStep = 1 | 2 | 3;
