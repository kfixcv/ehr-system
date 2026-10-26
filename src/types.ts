export type SectionId =
  | 'dashboard'
  | 'summary'
  | 'history'
  | 'vitals'
  | 'diagnoses'
  | 'medications'
  | 'allergies'
  | 'orders'
  | 'careplan'
  | 'education'
  | 'followup'
  | 'notes';

export interface PatientDemographics {
  arName: string;
  enName: string;
  mrn: string;
  encounterId: string;
  dob: string;
  age: number;
  gender: string;
  nationality: string;
  city: string;
  visitDate: string;
  visitType: string;
  department: string;
  physician: string;
  specialty: string;
  visitReason: string;
  recordStatus: string;
}

export interface MedicalHistoryItem {
  id: string;
  domainAr: string;
  domainEn: string;
  findings: string;
  status: 'لم يقيم بعد (Not Yet Assessed)' | 'مقيم جزئياً (Partially Assessed)' | 'موثق سريرياً (Documented)' | 'قيد التحقق';
}

export interface SmokingHistory {
  status: string;
  dailyConsumption: string;
  durationPackYears: string;
  pastQuitAttempts: string;
  pastQuitStatus: string;
  nicotineDependence: string;
  nicotineDependenceStatus: string;
  readinessToChange: string;
  substanceScreeningStatus: string;
  substanceScreeningNotes: string;
}

export interface VitalSigns {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  height: string;
  weight: string;
  bmi: string;
  lastUpdated: string;
}

export interface DiagnosisItem {
  id: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  status: 'سبب الزيارة الأساسي (Primary)' | 'موثق مبدئياً (Documented)' | 'يحتاج إلى تأكيد (Pending Confirmation)' | 'غير مسجل / وقائي فقط';
  dateRecorded: string;
  notes: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  status: string;
}

export interface AllergyItem {
  id: string;
  substance: string;
  reaction: string;
  severity: string;
  verificationStatus: 'لم يتم التحقق من الحساسية الدوائية' | 'قيد المراجعة' | 'تم التحقق - توجد حساسية' | 'تم التحقق - لا توجد حساسية معروفة (NKDA)';
  notes: string;
}

export interface CarePlanItem {
  id: string;
  component: string;
  intervention: string;
  goal: string;
  provider: string;
  status: string;
  targetDate: string;
  notes: string;
}

export interface ReferralOrderItem {
  id: string;
  targetServiceAr: string;
  targetServiceEn: string;
  reason: string;
  status: string;
}

export interface FollowUpVisit {
  id: string;
  date: string;
  type: string;
  objective: string;
  status: 'زيارة أولية مسجلة (Current)' | 'مخطط / لم تتم بعد' | 'مكتملة';
  notes: string;
}

export interface ClinicalNote {
  chiefComplaint: string;
  hpi: string;
  relevantHistory: string;
  clinicalAssessment: string;
  carePlanSummary: string;
  followUpInstructions: string;
  lastSaved: string;
}

export interface EHRData {
  patient: PatientDemographics;
  medicalHistory: MedicalHistoryItem[];
  smokingHistory: SmokingHistory;
  vitals: VitalSigns;
  diagnoses: DiagnosisItem[];
  medications: MedicationItem[];
  allergyState: {
    overallStatus: string;
    items: AllergyItem[];
  };
  carePlan: CarePlanItem[];
  referrals: ReferralOrderItem[];
  followUps: FollowUpVisit[];
  clinicalNote: ClinicalNote;
}