import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Menu,
  X,
  FileText,
  Activity,
  ClipboardList,
  Stethoscope,
  Pill,
  ShieldAlert,
  Send,
  CheckSquare,
  BookOpen,
  Calendar,
  FileEdit,
  LayoutDashboard,
  Search,
  Bell,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Info,
  Printer,
  ChevronLeft,
  Clock,
  Lock,
  Globe,
  ExternalLink
} from 'lucide-react';
import {
  EHRData,
  SectionId,
  DiagnosisItem,
  MedicationItem,
  FollowUpVisit
} from './types';
import { initialEHRData } from './initialData';

const STORAGE_KEY = 'vhh_ehr_patient_00421_v1';

type ExtendedSectionId = SectionId | 'partner';

export default function App() {
  // Load state from LocalStorage or fallback to initialEHRData
  const [savedData, setSavedData] = useState<EHRData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
    return initialEHRData;
  });

  // Working copy for editing before saving
  const [draftData, setDraftData] = useState<EHRData>(savedData);
  const [activeSection, setActiveSection] = useState<ExtendedSectionId>('summary');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [notePreviewMode, setNotePreviewMode] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Detect unsaved changes by comparing draftData with savedData
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(savedData);
  }, [draftData, savedData]);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // Save changes to LocalStorage
  const handleSaveAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      setSavedData(draftData);
      showToast('success', 'تم حفظ التعديلات بنجاح في السجل الصحي الإلكتروني.');
    } catch (e) {
      showToast('error', 'حدث خطأ أثناء حفظ البيانات في المتصفح.');
    }
  };

  // Cancel unsaved changes
  const handleCancelChanges = () => {
    setDraftData(savedData);
    showToast('info', 'تم التراجع عن التعديلات غير المحفوظة واستعادة آخر نسخة محفوظة.');
  };

  // Reset entire demo record to initial state
  const handleResetDemo = () => {
    setConfirmModal({
      title: 'إعادة ضبط بيانات السجل الافتراضي',
      message: 'هل أنت متأكد من رغبتك في استعادة البيانات الافتراضية الأصلية؟ سيتم مسح جميع الإضافات والتعديلات التي قمتِ بها.',
      onConfirm: () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEHRData));
        setSavedData(initialEHRData);
        setDraftData(initialEHRData);
        setConfirmModal(null);
        showToast('info', 'تمت استعادة البيانات الافتراضية الأصلية للنظام.');
      }
    });
  };

  // Navigation items list
  const navItems: { id: ExtendedSectionId; label: string; enLabel: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة المريض', enLabel: 'Patient Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'summary', label: 'ملخص الملف الطبي', enLabel: 'Record Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'history', label: 'التاريخ المرضي', enLabel: 'Medical & Smoking History', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'vitals', label: 'العلامات الحيوية', enLabel: 'Vital Signs', icon: <Activity className="w-4 h-4" /> },
    { id: 'diagnoses', label: 'التشخيصات', enLabel: 'Diagnoses (ICD-10)', icon: <Stethoscope className="w-4 h-4" />, badge: String(draftData.diagnoses.length) },
    { id: 'medications', label: 'الأدوية', enLabel: 'Medications', icon: <Pill className="w-4 h-4" />, badge: String(draftData.medications.length) },
    { id: 'allergies', label: 'الحساسية', enLabel: 'Allergies', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'orders', label: 'الطلبات والإحالات', enLabel: 'Orders & Referrals', icon: <Send className="w-4 h-4" /> },
    { id: 'careplan', label: 'خطة الرعاية', enLabel: 'Care Plan', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'education', label: 'التثقيف الصحي', enLabel: 'Health Education', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'followup', label: 'المتابعة والزيارات', enLabel: 'Follow-up & Visits', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notes', label: 'ملاحظات الطبيب', enLabel: 'Clinical Notes (SOAP)', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'partner', label: 'رحلة البيانات الصحية', enLabel: 'Heal Data Journey (Partner)', icon: <Globe className="w-4 h-4" />, badge: 'مشترك' },
  ];

  const currentNav = navItems.find((n) => n.id === activeSection) || navItems[1];

  // Search filter across record sections
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { section: ExtendedSectionId; title: string; snippet: string }[] = [];

    if (
      draftData.patient.arName.toLowerCase().includes(q) ||
      draftData.patient.mrn.toLowerCase().includes(q) ||
      draftData.patient.visitReason.toLowerCase().includes(q)
    ) {
      results.push({ section: 'summary', title: 'ملخص الملف الطبي', snippet: `${draftData.patient.arName} - ${draftData.patient.visitReason}` });
    }
    draftData.medicalHistory.forEach((m) => {
      if (m.domainAr.toLowerCase().includes(q) || m.findings.toLowerCase().includes(q)) {
        results.push({ section: 'history', title: `التاريخ المرضي: ${m.domainAr}`, snippet: m.findings });
      }
    });
    if (
      draftData.smokingHistory.status.toLowerCase().includes(q) ||
      draftData.smokingHistory.substanceScreeningNotes.toLowerCase().includes(q)
    ) {
      results.push({ section: 'history', title: 'تاريخ التدخين وفحص المواد', snippet: draftData.smokingHistory.status });
    }
    draftData.diagnoses.forEach((d) => {
      if (d.code.toLowerCase().includes(q) || d.descriptionAr.toLowerCase().includes(q) || d.descriptionEn.toLowerCase().includes(q)) {
        results.push({ section: 'diagnoses', title: `تشخيص: ${d.code}`, snippet: d.descriptionAr });
      }
    });
    draftData.carePlan.forEach((c) => {
      if (c.component.toLowerCase().includes(q) || c.intervention.toLowerCase().includes(q)) {
        results.push({ section: 'careplan', title: `خطة الرعاية: ${c.component}`, snippet: c.intervention });
      }
    });
    if (draftData.clinicalNote.hpi.toLowerCase().includes(q) || draftData.clinicalNote.clinicalAssessment.toLowerCase().includes(q)) {
      results.push({ section: 'notes', title: 'ملاحظات الطبيب (SOAP)', snippet: draftData.clinicalNote.hpi });
    }
    return results;
  }, [searchQuery, draftData]);

  // --- Sub-handlers for interactive sections ---

  // Add Diagnosis State
  const [newDiag, setNewDiag] = useState({
    code: '',
    descriptionAr: '',
    descriptionEn: '',
    status: 'يحتاج إلى تأكيد (Pending Confirmation)' as DiagnosisItem['status'],
    notes: ''
  });
  const [diagError, setDiagError] = useState('');

  const handleAddDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiag.code.trim() || !newDiag.descriptionAr.trim()) {
      setDiagError('يرجى إدخال رمز ICD-10-CM ووصف التشخيص باللغة العربية.');
      return;
    }
    const item: DiagnosisItem = {
      id: `diag-${Date.now()}`,
      code: newDiag.code.trim().toUpperCase(),
      descriptionAr: newDiag.descriptionAr.trim(),
      descriptionEn: newDiag.descriptionEn.trim() || 'Clinical Diagnosis Entry',
      status: newDiag.status,
      dateRecorded: '26/10/2026',
      notes: newDiag.notes.trim() || 'مضاف ضمن المحاكاة التعليمية.'
    };
    setDraftData((prev) => ({ ...prev, diagnoses: [...prev.diagnoses, item] }));
    setNewDiag({ code: '', descriptionAr: '', descriptionEn: '', status: 'يحتاج إلى تأكيد (Pending Confirmation)', notes: '' });
    setDiagError('');
    showToast('info', 'تمت إضافة التشخيص إلى المسودة. اضغط "حفظ التغييرات" لاعتماده في السجل.');
  };

  const handleDeleteDiagnosis = (id: string, title: string) => {
    setConfirmModal({
      title: 'حذف التشخيص من السجل',
      message: `هل أنت متأكد من حذف التشخيص "${title}"؟`,
      onConfirm: () => {
        setDraftData((prev) => ({
          ...prev,
          diagnoses: prev.diagnoses.filter((d) => d.id !== id)
        }));
        setConfirmModal(null);
        showToast('info', 'تم حذف التشخيص من المسودة.');
      }
    });
  };

  // Add Medication State
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    route: 'فموي (Oral)',
    frequency: '',
    startDate: '26/10/2026',
    status: 'مسودة أمر دوائي تجريبي (Demo Order)'
  });
  const [medError, setMedError] = useState('');

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.dose.trim() || !newMed.frequency.trim()) {
      setMedError('يرجى تعبئة اسم الدواء، الجرعة، والتكرار قبل الإضافة.');
      return;
    }
    const item: MedicationItem = {
      id: `med-${Date.now()}`,
      ...newMed
    };
    setDraftData((prev) => ({ ...prev, medications: [...prev.medications, item] }));
    setNewMed({
      name: '',
      dose: '',
      route: 'فموي (Oral)',
      frequency: '',
      startDate: '26/10/2026',
      status: 'مسودة أمر دوائي تجريبي (Demo Order)'
    });
    setMedError('');
    showToast('info', 'تم إدراج الدواء التجريبي في المسودة. اضغط "حفظ التغييرات" للحفظ.');
  };

  // Add Follow-up State
  const [newFollowUp, setNewFollowUp] = useState({
    date: '',
    type: 'متابعة عيادة الإقلاع عن التدخين',
    objective: '',
    status: 'مخطط / لم تتم بعد' as FollowUpVisit['status'],
    notes: ''
  });
  const [fuError, setFuError] = useState('');

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.date.trim() || !newFollowUp.objective.trim()) {
      setFuError('يرجى تحديد تاريخ الموعد والهدف السريري من المتابعة.');
      return;
    }
    const item: FollowUpVisit = {
      id: `fu-${Date.now()}`,
      ...newFollowUp
    };
    setDraftData((prev) => ({ ...prev, followUps: [...prev.followUps, item] }));
    setNewFollowUp({
      date: '',
      type: 'متابعة عيادة الإقلاع عن التدخين',
      objective: '',
      status: 'مخطط / لم تتم بعد',
      notes: ''
    });
    setFuError('');
    showToast('info', 'تمت جدولة موعد المتابعة في المسودة.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-slate-800">
      {/* 1. Persistent Educational & Privacy Disclaimer Banner */}
      <div className="bg-[#0b3948] text-white text-[10px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-teal-800 flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
          <span>بيئة تجريبية - جميع بيانات المرضى افتراضية (نموذج تعليمي افتراضي، غير صالح للاستخدام السريري)</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-teal-100">
          <span>EHR-FILE: {draftData.patient.mrn}</span>
          <span>|</span>
          <span>{draftData.patient.encounterId}</span>
        </div>
      </div>

      {/* 2. Top Hospital Header */}
      <header className="bg-[#0f4c5c] text-white shadow-sm border-b border-teal-900 sticky top-0 z-30 no-print">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Right side: 3-lines Hamburger Button + Hospital Icon & Name */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileMenuOpen(!mobileMenuOpen);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="p-1.5 sm:p-2 rounded bg-teal-900/60 hover:bg-teal-800 text-white border border-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                title="إظهار / إخفاء القائمة الجانبية"
                aria-label="القائمة الرئيسية"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-bold text-xs sm:text-base md:text-lg leading-tight">
                      مستشفى الرعاية الصحية الافتراضي
                    </h1>
                    <span className="hidden xl:inline-block text-xs text-teal-200 font-normal">
                      (Virtual Healthcare Hospital)
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-teal-200 mt-0.5">
                    {draftData.patient.department} — نظام السجل الصحي الإلكتروني (EHR)
                  </p>
                </div>
              </div>
            </div>

            {/* DEMO Badge for Mobile */}
            <span className="bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs px-2 py-1 rounded md:hidden shrink-0">
              DEMO
            </span>
          </div>

          {/* Center: Quick Record Search */}
          <div className="w-full md:w-72 lg:w-80 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-teal-200 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في سجل المريض (تشخيص، رمز، خطة)..."
                className="w-full bg-teal-950/70 text-white placeholder-teal-300/70 text-xs rounded border border-teal-700 pr-9 pl-7 py-1.5 sm:py-2 focus:outline-none focus:border-teal-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-2 text-teal-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {searchQuery.trim() !== '' && (
              <div className="absolute right-0 left-0 mt-1 bg-white text-slate-800 rounded border border-slate-300 shadow-lg max-h-72 overflow-y-auto z-50">
                <div className="p-2 bg-slate-100 border-b text-[11px] font-semibold text-slate-600">
                  نتائج البحث في السجل ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    لا توجد نتائج مطابقة لـ "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSection(res.section);
                        setSearchQuery('');
                      }}
                      className="w-full text-right p-2.5 hover:bg-teal-50 border-b border-slate-100 block transition"
                    >
                      <div className="text-xs font-bold text-[#0f4c5c]">{res.title}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{res.snippet}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Left side: Status Indicators & Save Actions */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {hasUnsavedChanges ? (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400 text-amber-200 px-2.5 py-1 rounded text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تعديلات غير محفوظة</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 px-2.5 py-1 rounded text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>محفوظ</span>
              </div>
            )}

            <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded border border-amber-300 tracking-wide">
              DEMO
            </span>

            <button
              onClick={() => window.print()}
              className="p-2 rounded bg-teal-900/60 hover:bg-teal-800 text-teal-100 border border-teal-700 text-xs flex items-center gap-1.5"
              title="عرض للطباعة"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xl:inline">طباعة السجل</span>
            </button>

            <div className="relative p-2 rounded bg-teal-900/60 border border-teal-700 text-teal-100" title="التنبيهات السريرية">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Action Bar when Unsaved Changes Exist */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 no-print">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 text-xs sm:text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>يوجد تعديلات غير محفوظة في السجل الحالي. اضغط "حفظ التغييرات" لتثبيتها في النظام.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelChanges}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء التعديلات</span>
              </button>
              <button
                onClick={handleSaveAll}
                className="px-4 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ التغييرات الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-5 z-50 max-w-md bg-white border-r-4 border-[#0f4c5c] shadow-lg rounded p-3.5 flex items-start gap-3 border border-slate-200 no-print">
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-[#0f4c5c] shrink-0 mt-0.5" />}
          <div className="text-xs sm:text-sm font-medium text-slate-800">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 mr-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
        {/* 3. Right-hand RTL Sidebar (Desktop Collapsible + Mobile Drawer) */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden no-print"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`${
            sidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'
          } ${
            mobileMenuOpen ? 'fixed right-0 top-0 bottom-0 w-64 z-50' : 'hidden lg:block'
          } bg-[#0b3948] text-slate-100 shrink-0 transition-all duration-200 border-l border-teal-900 no-print`}
        >
          <div className="p-3.5 border-b border-teal-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-teal-200 uppercase tracking-wider">أقسام السجل الطبي</div>
              <div className="text-[11px] text-teal-300/80">EHR Clinical Modules</div>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="text-teal-200 hover:text-white lg:hidden">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-right text-xs sm:text-sm transition ${
                    isActive
                      ? 'bg-[#0f4c5c] text-white font-bold border-r-4 border-amber-400 shadow-sm'
                      : 'text-teal-100 hover:bg-teal-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-300' : 'text-teal-300'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[11px] rounded bg-teal-950 text-teal-200 border border-teal-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 mt-4 mx-2 rounded bg-teal-950/80 border border-teal-800 text-[11px] text-teal-200 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>حالة التوثيق السريري</span>
            </div>
            <p className="leading-relaxed">
              هذا السجل يعمل في وضع المحاكاة الأكاديمية. يتم حفظ أي تعديلات محلياً في متصفحك.
            </p>
            <button
              onClick={handleResetDemo}
              className="w-full py-1.5 px-2 rounded bg-teal-900 hover:bg-teal-800 text-teal-100 border border-teal-700 text-xs font-medium flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة البيانات الأصلية</span>
            </button>
          </div>
        </aside>

        {/* 4. Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 space-y-4">
          {/* Breadcrumb & Quick Save Bar */}
          <div className="bg-white border border-slate-200 rounded px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm no-print">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-[#0f4c5c]">السجل الصحي الإلكتروني</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>ملف المريض ({draftData.patient.mrn})</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">{currentNav.label}</span>
              <span className="text-slate-400 hidden sm:inline">({currentNav.enLabel})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAll}
                className="px-3 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ التغييرات</span>
              </button>
              {hasUnsavedChanges && (
                <button
                  onClick={handleCancelChanges}
                  className="px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  تراجع
                </button>
              )}
            </div>
          </div>

          {/* 4.5. Project Credits & Partner Event Announcement Card */}
          <section className="bg-gradient-to-l from-[#e8f1f5] via-white to-[#f0f7fa] border-2 border-[#0f4c5c]/30 rounded-lg shadow-sm overflow-hidden no-print">
            {/* Top Bar: Official Project Rights */}
            <div className="bg-[#0b3948] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>حقوق تطوير المشروع التفاعلي — تخصص المعلوماتية الصحية (جامعة القصيم)</span>
              </div>
              <span className="text-[11px] text-teal-200 font-medium">
                مشروع مشترك متكامل (EHR & Heal Data Journey)
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Developers Rights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Haneen's Credit Box */}
                <div className="bg-white border border-slate-200 border-r-4 border-r-[#0f4c5c] rounded p-3 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-[#0f4c5c] font-bold text-xs">
                    EHR
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      تطوير وتصميم نظام السجل الصحي الإلكتروني (EHR):
                    </div>
                    <div className="text-sm font-bold text-[#0f4c5c] mt-0.5">
                      حنين مصطفى ماضي (Haneen Mustafa Madhy)
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      بناء وبرمجة النظام السريري التفاعلي وتوثيق بيانات المرضى وخطط الرعاية.
                    </p>
                  </div>
                </div>

                {/* Shomoukh's Credit Box */}
                <div className="bg-white border border-slate-200 border-r-4 border-r-amber-500 rounded p-3 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800 font-bold text-xs">
                    HDJ
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      تطوير وتصميم فعالية ومنصة رحلة البيانات الصحية:
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      شموع الحربي (Shomoukh Alharbi)
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      إعداد وتصميم التحديات التفاعلية لمراحل رحلة البيانات الصحية والتوعوية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Announcement & How to Enter */}
              <div className="bg-teal-900/5 border border-teal-800/20 rounded-md p-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#0f4c5c] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Globe className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                        إعلان الفعالية التفاعلية
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-[#0f4c5c]">
                        فعالية رحلة البيانات الصحية (Heal Data Journey)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      ندعوكم لخوض تجربة تعليمية تفاعلية لاستكشاف مراحل رحلة البيانات الصحية وتحديات تحليل البيانات وقيم المخاطر السريرية.
                    </p>
                    <div className="text-[11px] text-slate-600 bg-white/80 px-2.5 py-1.5 rounded border border-slate-200 inline-block mt-1">
                      <strong>طريقة الدخول للفعالية:</strong> اضغط على زر <strong>"الدخول السريع للفعالية"</strong> بالأسفل، أو اختر تبويب <strong>"رحلة البيانات الصحية"</strong> من القائمة الجانبية لتصفح المنصة مباشرة داخل السجل.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
                  <button
                    onClick={() => setActiveSection('partner')}
                    className="px-3.5 py-2 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-amber-300" />
                    <span>الدخول السريع للفعالية داخل السجل</span>
                  </button>
                  <a
                    href="https://healdatajourey.lovable.app/mission"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded border border-[#0f4c5c] bg-white hover:bg-teal-50 text-[#0f4c5c] text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <span>فتح في نافذة مستقلة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Compact Patient Identity Banner (Matching PDF Theme - No Avatar) */}
          <section className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
            <div className="bg-[#0f4c5c] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-teal-900/80 border border-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">
                      {draftData.patient.arName}
                    </h2>
                    <span className="text-xs text-teal-200 font-medium">
                      ({draftData.patient.enName})
                    </span>
                  </div>
                  <div className="text-xs text-teal-100 flex flex-wrap items-center gap-2 mt-0.5">
                    <span>رقم الملف (MRN): <strong>{draftData.patient.mrn}</strong></span>
                    <span>|</span>
                    <span>رقم الزيارة: <strong>{draftData.patient.encounterId}</strong></span>
                    <span>|</span>
                    <span>تاريخ الزيارة: <strong>{draftData.patient.visitDate}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-400/20 border border-amber-300 text-amber-200 text-xs font-semibold">
                  حالة السجل: {draftData.patient.recordStatus}
                </span>
                <span className="px-2.5 py-1 rounded bg-red-500/20 border border-red-300 text-red-100 text-xs font-semibold">
                  مدخن حالي (15 سيجارة/يوم)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200 bg-slate-50/70 text-xs">
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">تاريخ الميلاد / العمر</div>
                <div className="font-bold text-slate-800 mt-0.5">{draftData.patient.dob} ({draftData.patient.age} سنة)</div>
              </div>
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">الجنس / الجنسية</div>
                <div className="font-bold text-slate-800 mt-0.5">{draftData.patient.gender} — {draftData.patient.nationality}</div>
              </div>
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">المدينة والمنطقة</div>
                <div className="font-bold text-slate-800 mt-0.5">{draftData.patient.city}</div>
              </div>
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">الطبيب المعالج</div>
                <div className="font-bold text-slate-800 mt-0.5">{draftData.patient.physician}</div>
              </div>
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">التخصص / نوع الزيارة</div>
                <div className="font-bold text-slate-800 mt-0.5">{draftData.patient.visitType}</div>
              </div>
              <div className="p-2.5">
                <div className="text-slate-500 text-[11px]">حالة الحساسية الدوائية</div>
                <div className="font-bold text-amber-700 mt-0.5">{draftData.allergyState.overallStatus}</div>
              </div>
            </div>
          </section>

          {/* Horizontal Quick Tabs Bar */}
          <div className="bg-white border border-slate-200 rounded p-1.5 flex items-center gap-1 overflow-x-auto no-print">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                  activeSection === tab.id
                    ? 'bg-[#0f4c5c] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ================= SECTION CONTENT PANELS ================= */}

          {/* SECTION 1 & 2: DASHBOARD OR RECORD SUMMARY */}
          {(activeSection === 'dashboard' || activeSection === 'summary') && (
            <div className="space-y-4">
              {/* Editable Demographics & Visit Details Card (Matches Section 1 of PDF) */}
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0f4c5c]">
                      1. بيانات المريض الأساسية ومعلومات الزيارة (Patient Demographics & Encounter Details)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">حقول قابلة للتحديث التجريبي</span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">الاسم الكامل (Full Name)</label>
                    <input
                      type="text"
                      value={draftData.patient.arName}
                      onChange={(e) =>
                        setDraftData({ ...draftData, patient: { ...draftData.patient, arName: e.target.value } })
                      }
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f4c5c]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">الاسم بالإنجليزية (English Name)</label>
                    <input
                      type="text"
                      value={draftData.patient.enName}
                      onChange={(e) =>
                        setDraftData({ ...draftData, patient: { ...draftData.patient, enName: e.target.value } })
                      }
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f4c5c]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">المدينة والمنطقة (City / Region)</label>
                    <input
                      type="text"
                      value={draftData.patient.city}
                      onChange={(e) =>
                        setDraftData({ ...draftData, patient: { ...draftData.patient, city: e.target.value } })
                      }
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f4c5c]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">الطبيب المعالج (Attending Physician)</label>
                    <input
                      type="text"
                      value={draftData.patient.physician}
                      onChange={(e) =>
                        setDraftData({ ...draftData, patient: { ...draftData.patient, physician: e.target.value } })
                      }
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f4c5c]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">سبب الزيارة المسجل (Visit Reason)</label>
                    <input
                      type="text"
                      value={draftData.patient.visitReason}
                      onChange={(e) =>
                        setDraftData({ ...draftData, patient: { ...draftData.patient, visitReason: e.target.value } })
                      }
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f4c5c]"
                    />
                  </div>
                </div>
              </div>

              {/* Chief Complaint & Clinical Context (Matches Section 2 of PDF) */}
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    2. سبب الزيارة والشكوى الرئيسية (Chief Complaint & History of Present Illness)
                  </h3>
                </div>
                <div className="p-4 text-xs sm:text-sm leading-relaxed text-slate-700 bg-slate-50/50 border-r-4 border-[#0f4c5c] m-4 rounded">
                  <p className="font-bold text-slate-900 mb-1">الشكوى الرئيسية وتفاصيل المراجعة:</p>
                  <p>{draftData.clinicalNote.hpi}</p>
                </div>
              </div>

              {/* Summary Grid: Smoking Status, Pending Assessments, Missing Info, Quick Vitals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Smoking & Substance Status Card */}
                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#0f4c5c]">حالة التدخين وفحص المواد</h3>
                    <button
                      onClick={() => setActiveSection('history')}
                      className="text-xs text-[#0f4c5c] hover:underline font-semibold"
                    >
                      تعديل التاريخ المرضي ←
                    </button>
                  </div>
                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">حالة التدخين الحالية:</span>
                      <span className="font-bold text-red-700">{draftData.smokingHistory.status}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">معدل الاستهلاك والمدة:</span>
                      <span className="font-semibold text-slate-800">{draftData.smokingHistory.dailyConsumption} — {draftData.smokingHistory.durationPackYears}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">درجة الاعتماد على النيكوتين:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">{draftData.smokingHistory.nicotineDependenceStatus}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">فحص تعاطي المواد المخدرة:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">{draftData.smokingHistory.substanceScreeningStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Clearly Marked Missing / Pending Information */}
                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>نواقص التوثيق والتقييمات المعلقة (Pending / Missing Information)</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-50/60 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>الحساسية الدوائية:</strong> {draftData.allergyState.overallStatus} (يلزم التحقق قبل وصف أي علاج).
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-50/60 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>مقياس فاجرستروم (Fagerström Test):</strong> قيد التقييم لتحديد درجة الاعتماد على النيكوتين وتأكيد الرمز F17.200.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-50/60 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>التاريخ المرضي العام والعائلي:</strong> الأمراض المزمنة، العمليات السابقة، ومحاولات الإقلاع السابقة غير مستوفاة بعد.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-slate-100 border border-slate-200">
                      <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>بيانات الاتصال والهوية:</strong> غير معروضة في النموذج حفاظًا على الخصوصية في البيئة التعليمية.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Care Plan & Recent Visit History Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#0f4c5c]">أبرز محاور خطة الرعاية الحالية</h3>
                    <button onClick={() => setActiveSection('careplan')} className="text-xs text-[#0f4c5c] hover:underline font-semibold">
                      عرض الخطة الكاملة ←
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 text-xs">
                    {draftData.carePlan.slice(0, 5).map((cp) => (
                      <div key={cp.id} className="p-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800">{cp.component}</div>
                          <div className="text-slate-600 mt-0.5">{cp.intervention}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0f4c5c] border border-teal-200 font-semibold shrink-0">
                          {cp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#0f4c5c]">الجدول الزمني للزيارات والمتابعة</h3>
                    <button onClick={() => setActiveSection('followup')} className="text-xs text-[#0f4c5c] hover:underline font-semibold">
                      إدارة الزيارات ←
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 text-xs">
                    {draftData.followUps.map((f) => (
                      <div key={f.id} className="p-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800">{f.date} — {f.type}</div>
                          <div className="text-slate-600 mt-0.5">{f.objective}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-semibold shrink-0 ${
                            f.status.includes('Current')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MEDICAL & SMOKING HISTORY */}
          {activeSection === 'history' && (
            <div className="space-y-4">
              {/* Comprehensive Medical History Table */}
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    3. التاريخ المرضي الشامل (Comprehensive Medical History)
                  </h3>
                  <span className="text-xs text-slate-600">قابل للتعديل الفوري</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <th className="p-3 w-56">المجال السريري (Clinical Domain)</th>
                        <th className="p-3">التفاصيل الموثقة في السجل (Documented Findings)</th>
                        <th className="p-3 w-64">حالة التوثيق (Assessment Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {draftData.medicalHistory.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">
                            <div>{item.domainAr}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{item.domainEn}</div>
                          </td>
                          <td className="p-3">
                            <textarea
                              rows={2}
                              value={item.findings}
                              onChange={(e) => {
                                const updated = [...draftData.medicalHistory];
                                updated[idx] = { ...item, findings: e.target.value };
                                setDraftData({ ...draftData, medicalHistory: updated });
                              }}
                              className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#0f4c5c]"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={item.status}
                              onChange={(e) => {
                                const updated = [...draftData.medicalHistory];
                                updated[idx] = { ...item, status: e.target.value as any };
                                setDraftData({ ...draftData, medicalHistory: updated });
                              }}
                              className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:outline-none focus:border-[#0f4c5c]"
                            >
                              <option value="لم يقيم بعد (Not Yet Assessed)">لم يقيم بعد (Not Yet Assessed)</option>
                              <option value="مقيم جزئياً (Partially Assessed)">مقيم جزئياً (Partially Assessed)</option>
                              <option value="موثق سريرياً (Documented)">موثق سريرياً (Documented)</option>
                              <option value="قيد التحقق">قيد التحقق</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tobacco Use & Smoking History Assessment */}
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    4. تاريخ التدخين وتقييم استخدام التبغ (Tobacco Use & Smoking History Assessment)
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">حالة التدخين الحالية (Smoking Status)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.status}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, status: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">معدل الاستهلاك اليومي (Daily Consumption)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.dailyConsumption}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, dailyConsumption: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مدة التدخين ومؤشر العبوات/السنة (Duration & Pack-Years)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.durationPackYears}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, durationPackYears: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">حالة محاولات الإقلاع السابقة (Past Quit Attempts)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.pastQuitAttempts}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, pastQuitAttempts: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">درجة الاعتماد على النيكوتين (Nicotine Dependence)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.nicotineDependence}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, nicotineDependence: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاستعداد السلوكي للإقلاع (Readiness to Change)</label>
                    <input
                      type="text"
                      value={draftData.smokingHistory.readinessToChange}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          smokingHistory: { ...draftData.smokingHistory, readinessToChange: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Substance-Use Screening Status (Strict Non-Assumption Policy) */}
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    5. حالة فحص استخدام المواد المخدرة والمؤثرات العقلية (Substance-Use Screening Status)
                  </h3>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded bg-amber-50 border border-amber-300 text-amber-950 leading-relaxed">
                    <strong>تنبيه سريري مهم (Preventive Protocol - No Substance Use Assumed):</strong> لا يُفترض مطلقًا أن المريض يتعاطى أي مواد مخدرة لمجرد أن البرنامج التوعوي يشمل الوقاية من المخدرات. تظل حالة الفحص "غير محددة / لم تقيم بعد" ما لم يُجرَ تقييم سريري سري وموثق.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">حالة فحص التعاطي (Screening Status)</label>
                      <select
                        value={draftData.smokingHistory.substanceScreeningStatus}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            smokingHistory: { ...draftData.smokingHistory, substanceScreeningStatus: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2 bg-white"
                      >
                        <option value="غير محددة قبل إجراء الفحص (Unassessed / Pending)">غير محددة قبل إجراء الفحص (Unassessed / Pending)</option>
                        <option value="تم تقديم التوعية الوقائية فقط - لم يُجرَ فحص سريري">تم تقديم التوعية الوقائية فقط - لم يُجرَ فحص سريري</option>
                        <option value="تم إجراء الفحص السري (SBIRT) - النتيجة سلبية">تم إجراء الفحص السري (SBIRT) - النتيجة سلبية</option>
                        <option value="يحتاج إلى تقييم سريري متخصص">يحتاج إلى تقييم سريري متخصص</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ملاحظات الفحص والسرية</label>
                      <input
                        type="text"
                        value={draftData.smokingHistory.substanceScreeningNotes}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            smokingHistory: { ...draftData.smokingHistory, substanceScreeningNotes: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: VITAL SIGNS */}
          {activeSection === 'vitals' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-[#0f4c5c]">
                  6. العلامات الحيوية والقياسات الجسمانية (Vital Signs & Anthropometrics - Simulated Data)
                </h3>
                <span className="text-xs text-slate-600">آخر تحديث: {draftData.vitals.lastUpdated}</span>
              </div>

              <div className="p-4 space-y-4">
                <div className="p-3 rounded bg-slate-100 border border-slate-300 text-xs text-slate-700">
                  <strong>ملاحظة توثيقية:</strong> هذه الحقول تُعرض في النظام لأغراض المحاكاة التعليمية، ولا تُعتبر القيم التالية قياسات سريرية حقيقية للمريض. يمكنك تعديل القيم وحفظها لأغراض العرض.
                </div>

                {/* Vitals Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">ضغط الدم (BP)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.bp}</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">mmHg (مرتفع قليلاً)</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">النبض (HR)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.hr}</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">bpm (طبيعي)</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">التنفس (RR)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.rr}</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">/min (طبيعي)</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">الحرارة (Temp)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.temp} °C</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">طبيعي (افتراضي)</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">الأكسجين (SpO2)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.spo2}</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">هواء الغرفة</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">الطول (Height)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.height}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">cm</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">الوزن (Weight)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.weight}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">kg</div>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="text-[11px] text-slate-500">كتلة الجسم (BMI)</div>
                    <div className="text-base font-bold text-[#0f4c5c] mt-1">{draftData.vitals.bmi}</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">kg/m² (زيادة وزن)</div>
                  </div>
                </div>

                {/* Editable Clinical Vitals Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-right text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <th className="p-2.5">المؤشر الحيوي (Vital Parameter)</th>
                        <th className="p-2.5">القيمة التوضيحية القابلة للتعديل</th>
                        <th className="p-2.5">الوحدة القياسية</th>
                        <th className="p-2.5">التفسير التوضيحي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold">ضغط الدم (Blood Pressure)</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={draftData.vitals.bp}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, bp: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2.5">mmHg</td>
                        <td className="p-2.5 text-amber-700 font-medium">مرتفع قليلاً (افتراضي)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">معدل ضربات القلب (Heart Rate)</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={draftData.vitals.hr}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, hr: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2.5">نبضة/دقيقة (bpm)</td>
                        <td className="p-2.5 text-emerald-700 font-medium">طبيعي (افتراضي)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">معدل التنفس (Respiratory Rate)</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={draftData.vitals.rr}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, rr: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2.5">نفس/دقيقة (/min)</td>
                        <td className="p-2.5 text-emerald-700 font-medium">طبيعي (افتراضي)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">درجة الحرارة (Temperature)</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={draftData.vitals.temp}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, temp: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2.5">°C</td>
                        <td className="p-2.5 text-emerald-700 font-medium">طبيعي (افتراضي)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">تشبع الأكسجين (Oxygen Saturation)</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={draftData.vitals.spo2}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, spo2: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2.5">% (Room Air)</td>
                        <td className="p-2.5 text-emerald-700 font-medium">طبيعي (افتراضي)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">الطول والوزن ومؤشر الكتلة (Height, Weight, BMI)</td>
                        <td className="p-2.5 flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={draftData.vitals.height}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, height: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-20"
                            placeholder="الطول"
                          />
                          <span>سم |</span>
                          <input
                            type="text"
                            value={draftData.vitals.weight}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, weight: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-20"
                            placeholder="الوزن"
                          />
                          <span>كجم | BMI:</span>
                          <input
                            type="text"
                            value={draftData.vitals.bmi}
                            onChange={(e) => setDraftData({ ...draftData, vitals: { ...draftData.vitals, bmi: e.target.value } })}
                            className="border border-slate-300 rounded px-2 py-1 w-20"
                            placeholder="BMI"
                          />
                        </td>
                        <td className="p-2.5">cm / kg / kg/m²</td>
                        <td className="p-2.5 text-amber-700 font-medium">زيادة وزن (افتراضي)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: DIAGNOSES (ICD-10-CM) */}
          {activeSection === 'diagnoses' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    8. التشخيصات المقترحة والرموز الطبية (Proposed Diagnoses & ICD-10-CM Coding)
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    <strong>ضوابط الترميز السريري:</strong> لا يُعتمد التشخيص غير المؤكد كمؤكد نهائي إلا بعد استكمال التقييم. كما لا يُضاف تشخيص اضطراب تعاطي المخدرات لمجرد أن الفعالية تتناول التوعية الوقائية.
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-3">التشخيص (Diagnosis)</th>
                          <th className="p-3 w-36">رمز ICD-10-CM</th>
                          <th className="p-3 w-56">الحالة السريرية (Clinical Status)</th>
                          <th className="p-3 w-28">تاريخ التسجيل</th>
                          <th className="p-3">الملاحظات والضوابط</th>
                          <th className="p-3 w-24 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {draftData.diagnoses.map((d, idx) => (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{d.descriptionAr}</div>
                              <div className="text-[11px] text-slate-500">{d.descriptionEn}</div>
                            </td>
                            <td className="p-3 font-mono font-bold text-[#0f4c5c]">{d.code}</td>
                            <td className="p-3">
                              <select
                                value={d.status}
                                onChange={(e) => {
                                  const updated = [...draftData.diagnoses];
                                  updated[idx] = { ...d, status: e.target.value as DiagnosisItem['status'] };
                                  setDraftData({ ...draftData, diagnoses: updated });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                              >
                                <option value="سبب الزيارة الأساسي (Primary)">سبب الزيارة الأساسي (Primary)</option>
                                <option value="موثق مبدئياً (Documented)">موثق مبدئياً (Documented)</option>
                                <option value="يحتاج إلى تأكيد (Pending Confirmation)">يحتاج إلى تأكيد (Pending Confirmation)</option>
                                <option value="غير مسجل / وقائي فقط">غير مسجل / وقائي فقط</option>
                              </select>
                            </td>
                            <td className="p-3 text-slate-600">{d.dateRecorded}</td>
                            <td className="p-3 text-slate-600">{d.notes}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteDiagnosis(d.id, d.descriptionAr)}
                                className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                                title="حذف التشخيص"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Demo Diagnosis Form */}
                  <form onSubmit={handleAddDiagnosis} className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                    <h4 className="font-bold text-xs text-[#0f4c5c] flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>إضافة تشخيص تجريبي جديد (Add Demo Diagnosis Entry)</span>
                    </h4>
                    {diagError && <div className="text-xs text-red-600 font-semibold">{diagError}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">رمز ICD-10-CM *</label>
                        <input
                          type="text"
                          placeholder="مثال: Z72.0"
                          value={newDiag.code}
                          onChange={(e) => setNewDiag({ ...newDiag, code: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">وصف التشخيص (عربي) *</label>
                        <input
                          type="text"
                          placeholder="مثال: استخدام التبغ الحالي"
                          value={newDiag.descriptionAr}
                          onChange={(e) => setNewDiag({ ...newDiag, descriptionAr: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">الحالة السريرية</label>
                        <select
                          value={newDiag.status}
                          onChange={(e) => setNewDiag({ ...newDiag, status: e.target.value as DiagnosisItem['status'] })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        >
                          <option value="يحتاج إلى تأكيد (Pending Confirmation)">يحتاج إلى تأكيد (Pending Confirmation)</option>
                          <option value="موثق مبدئياً (Documented)">موثق مبدئياً (Documented)</option>
                          <option value="سبب الزيارة الأساسي (Primary)">سبب الزيارة الأساسي (Primary)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">ملاحظات سريرية</label>
                        <input
                          type="text"
                          placeholder="ملاحظات التوثيق..."
                          value={newDiag.notes}
                          onChange={(e) => setNewDiag({ ...newDiag, notes: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إدراج التشخيص في الجدول</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: MEDICATIONS */}
          {activeSection === 'medications' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                <h3 className="font-bold text-sm text-[#0f4c5c]">
                  9. الأوامر الدوائية النشطة (Active Medication Orders)
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {draftData.medications.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded space-y-2">
                    <Pill className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-800">
                      لا توجد أوامر دوائية موثقة في هذه الزيارة.
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl mx-auto">
                      لم يتم إدراج أو صرف أي أدوية أو بدائل نيكوتين (NRT) تلقائيًا. أي قرار بوصف علاج دوائي مساعد للإقلاع مرهون باستكمال التقييم السريري للطبيب والتحقق من الحساسية الدوائية.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-3">اسم الدواء (Medication Name)</th>
                          <th className="p-3">الجرعة (Dose)</th>
                          <th className="p-3">طريقة الإعطاء (Route)</th>
                          <th className="p-3">التكرار (Frequency)</th>
                          <th className="p-3">تاريخ البدء</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {draftData.medications.map((m) => (
                          <tr key={m.id}>
                            <td className="p-3 font-bold text-slate-900">{m.name}</td>
                            <td className="p-3">{m.dose}</td>
                            <td className="p-3">{m.route}</td>
                            <td className="p-3">{m.frequency}</td>
                            <td className="p-3">{m.startDate}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                                {m.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() =>
                                  setDraftData({
                                    ...draftData,
                                    medications: draftData.medications.filter((x) => x.id !== m.id)
                                  })
                                }
                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Interactive Add Demo Medication Form */}
                <form onSubmit={handleAddMedication} className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                  <h4 className="font-bold text-xs text-[#0f4c5c] flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>إضافة أمر دوائي تجريبي للمحاكاة (Add Demo Medication Order)</span>
                  </h4>
                  {medError && <div className="text-xs text-red-600 font-semibold">{medError}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">اسم الدواء *</label>
                      <input
                        type="text"
                        placeholder="مثال: Nicotine Patch (NRT)"
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">الجرعة *</label>
                      <input
                        type="text"
                        placeholder="مثال: 14 mg / 24 hr"
                        value={newMed.dose}
                        onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">طريقة الإعطاء</label>
                      <select
                        value={newMed.route}
                        onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        <option value="فموي (Oral)">فموي (Oral)</option>
                        <option value="لصقة جلدية (Transdermal)">لصقة جلدية (Transdermal)</option>
                        <option value="علكة طبية (Buccal Gum)">علكة طبية (Buccal Gum)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">التكرار *</label>
                      <input
                        type="text"
                        placeholder="مثال: مرة واحدة يوميًا"
                        value={newMed.frequency}
                        onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">تاريخ البدء</label>
                      <input
                        type="text"
                        value={newMed.startDate}
                        onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إدراج الدواء التجريبي</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION 7: ALLERGIES */}
          {activeSection === 'allergies' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                <h3 className="font-bold text-sm text-[#0f4c5c]">
                  سجل الحساسية والتفاعلات الضارة (Allergy Profile & Verification)
                </h3>
              </div>

              <div className="p-4 space-y-4 text-xs">
                <div className="p-3.5 rounded bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">الحالة الحالية: {draftData.allergyState.overallStatus}</div>
                    <p className="mt-1">
                      تنبيه سلامة المرضى: لا يجوز تفسير حالة "لم يتم التحقق من الحساسية الدوائية" على أنها "لا توجد حساسية معروفة (NKDA)". يلزم سؤال المريض مباشرة وتوثيق النتيجة قبل وصف أي أدوية.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تحديث حالة التحقق من الحساسية (Verification Status)</label>
                    <select
                      value={draftData.allergyState.overallStatus}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          allergyState: { ...draftData.allergyState, overallStatus: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 bg-white"
                    >
                      <option value="لم يتم التحقق من الحساسية الدوائية.">لم يتم التحقق من الحساسية الدوائية (Unverified)</option>
                      <option value="قيد الاستكمال والمراجعة السريرية.">قيد الاستكمال والمراجعة السريرية</option>
                      <option value="تم التحقق سريرياً: لا توجد حساسية دوائية معروفة (NKDA).">تم التحقق سريرياً: لا توجد حساسية دوائية معروفة (NKDA)</option>
                      <option value="تم التحقق سريرياً: توجد حساسية مسجلة بالملف.">تم التحقق سريرياً: توجد حساسية مسجلة بالملف</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: ORDERS & REFERRALS */}
          {activeSection === 'orders' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                <h3 className="font-bold text-sm text-[#0f4c5c]">
                  12. الإحالات والطلبات الطبية (Referrals & Clinical Orders)
                </h3>
              </div>

              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <th className="p-3">الجهة المحال إليها / الخدمة (Target Service)</th>
                        <th className="p-3">الغرض السريري من الإحالة (Reason for Referral)</th>
                        <th className="p-3 w-56">حالة الطلب والتنفيذ (Order Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {draftData.referrals.map((r, idx) => (
                        <tr key={r.id}>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{r.targetServiceAr}</div>
                            <div className="text-[11px] text-slate-500">{r.targetServiceEn}</div>
                          </td>
                          <td className="p-3 text-slate-700">{r.reason}</td>
                          <td className="p-3">
                            <select
                              value={r.status}
                              onChange={(e) => {
                                const updated = [...draftData.referrals];
                                updated[idx] = { ...r, status: e.target.value };
                                setDraftData({ ...draftData, referrals: updated });
                              }}
                              className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                            >
                              <option value="مقترحة - قيد التفعيل">مقترحة - قيد التفعيل</option>
                              <option value="مطلوب استكماله">مطلوب استكماله</option>
                              <option value="مشروطة بالحاجة - غير مفعلة حالياً">مشروطة بالحاجة - غير مفعلة حالياً</option>
                              <option value="تم إرسال الإحالة (تجريبي)">تم إرسال الإحالة (تجريبي)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: CARE PLAN */}
          {activeSection === 'careplan' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0f4c5c]">
                  10. خطة الرعاية العلاجية والوقائية المتكاملة (Comprehensive Care Plan)
                </h3>
                <span className="text-xs text-slate-600">جميع الحقول قابلة للتحديث</span>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                      <th className="p-2.5 w-48">محور الخطة (Component)</th>
                      <th className="p-2.5">التدخلات السريرية والهدف</th>
                      <th className="p-2.5 w-40">الممارس المسؤول</th>
                      <th className="p-2.5 w-40">الحالة</th>
                      <th className="p-2.5 w-28">التاريخ المستهدف</th>
                      <th className="p-2.5 w-44">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {draftData.carePlan.map((cp, idx) => (
                      <tr key={cp.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-[#0f4c5c]">{cp.component}</td>
                        <td className="p-2.5 space-y-1">
                          <div className="text-slate-800">{cp.intervention}</div>
                          <input
                            type="text"
                            value={cp.goal}
                            onChange={(e) => {
                              const updated = [...draftData.carePlan];
                              updated[idx] = { ...cp, goal: e.target.value };
                              setDraftData({ ...draftData, carePlan: updated });
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-[11px] bg-white"
                            placeholder="الهدف العلاجي..."
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={cp.provider}
                            onChange={(e) => {
                              const updated = [...draftData.carePlan];
                              updated[idx] = { ...cp, provider: e.target.value };
                              setDraftData({ ...draftData, carePlan: updated });
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={cp.status}
                            onChange={(e) => {
                              const updated = [...draftData.carePlan];
                              updated[idx] = { ...cp, status: e.target.value };
                              setDraftData({ ...draftData, carePlan: updated });
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-[#0f4c5c]"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={cp.targetDate}
                            onChange={(e) => {
                              const updated = [...draftData.carePlan];
                              updated[idx] = { ...cp, targetDate: e.target.value };
                              setDraftData({ ...draftData, carePlan: updated });
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={cp.notes}
                            onChange={(e) => {
                              const updated = [...draftData.carePlan];
                              updated[idx] = { ...cp, notes: e.target.value };
                              setDraftData({ ...draftData, carePlan: updated });
                            }}
                            placeholder="إضافة ملاحظة..."
                            className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 10: HEALTH EDUCATION (TWO SEPARATE MODULES) */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-950 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>تنويه تثقيفي:</strong> المحتوى المعروض في هذه الوحدات مخصص للتوعية الصحية العامة والوقائية، وهو متميز عن القرارات والاستشارات الطبية الفردية المخصصة لكل مريض.
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Module 1: Smoking Cessation */}
                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#0f4c5c] text-white px-4 py-3">
                    <h3 className="font-bold text-sm">الوحدة الأولى: التثقيف الصحي للإقلاع عن التدخين</h3>
                    <p className="text-[11px] text-teal-200">Smoking Cessation Educational Module</p>
                  </div>
                  <div className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">1. المخاطر الصحية للتدخين والتدخين السلبي</h4>
                      <p>يؤدي التعرض المستمر لسموم التبغ وأول أكسيد الكربون إلى زيادة مخاطر أمراض القلب والشرايين، السكتات الدماغية، الانسداد الرئوي المزمن (COPD)، والأورام المرتبطة بالتبغ.</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">2. الفوائد الصحية الفورية والمستقبلية للإقلاع</h4>
                      <p>يبدأ ضغط الدم والنبض بالتحسن خلال 20 دقيقة من التوقف، وينخفض مستوى أول أكسيد الكربون في الدم خلال 24 ساعة، وتتحسن وظائف الرئة والدورة الدموية تدريجيًا خلال الأسابيع الأولى.</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">3. استراتيجيات التعامل مع الرغبة الملحة (4 D's)</h4>
                      <p>تأجيل الاستجابة للرغبة لمدة 10 دقائق (Delay)، التنفس العميق (Deep breathing)، شرب الماء ببطء (Drink water)، والانشغال بنشاط بديل (Distract).</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">4. الوقاية من الانتكاس والدعم المتخصص</h4>
                      <p>تحديد المحفزات اليومية وتجنبها، والاستفادة من عيادات الإقلاع عن التدخين المعتمدة التي توفر المتابعة السلوكية وتقييم الحاجة لبدائل النيكوتين الآمنة.</p>
                    </div>
                  </div>
                </div>

                {/* Module 2: Drug Abuse Prevention */}
                <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#0b3948] text-white px-4 py-3">
                    <h3 className="font-bold text-sm">الوحدة الثانية: التوعية بالوقاية من المخدرات والمؤثرات العقلية</h3>
                    <p className="text-[11px] text-teal-200">Drug Abuse Prevention & Confidential Care Module</p>
                  </div>
                  <div className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">1. المخاطر الصحية والاجتماعية لتعاطي المواد</h4>
                      <p>تؤثر المواد المخدرة والمؤثرات العقلية والأدوية الخاضعة للرقابة (عند استخدامها خارج الإشراف الطبي) بشكل مباشر على الجهاز العصبي المركزي، القلب، الصحة النفسية، والاستقرار الأسري والوظيفي.</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">2. الاكتشاف المبكر والوقاية</h4>
                      <p>الوعي بمخاطر التجربة الأولى، وعدم مشاركة الأدوية الموصوفة مع الغير، وتعزيز مهارات التعامل الصحي مع الضغوط النفسية.</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">3. الخصوصية والرعاية غير الوصمية (Non-Stigmatizing Care)</h4>
                      <p>تُقدم خدمات الفحص الاستكشافي والاستشارة الوقائية في المنشآت الصحية بخصوصية وسرية تامة، دون أي وصمة اجتماعية، مع احترام كرامة المراجع.</p>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-[#0f4c5c] mb-1">4. طلب المساعدة المهنية المتخصصة</h4>
                      <p>تتوفر قنوات الإحالة الطبية السرية وخدمات الإرشاد النفسي وعلاج الإدمان المتخصصة لتقديم الدعم العلاجي والتأهيلي الآمن عند الحاجة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11: FOLLOW-UP & VISITS */}
          {activeSection === 'followup' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5">
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    13. سجل الزيارات وجدول المتابعة (Encounter Log & Follow-Up Schedule)
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-3 w-32">التاريخ (Date)</th>
                          <th className="p-3 w-48">نوع الموعد (Encounter Type)</th>
                          <th className="p-3">الهدف السريري المقرر (Clinical Objective)</th>
                          <th className="p-3 w-52">حالة الزيارة (Visit Status)</th>
                          <th className="p-3">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {draftData.followUps.map((f, idx) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-[#0f4c5c]">{f.date}</td>
                            <td className="p-3 font-semibold text-slate-800">{f.type}</td>
                            <td className="p-3 text-slate-700">{f.objective}</td>
                            <td className="p-3">
                              <select
                                value={f.status}
                                onChange={(e) => {
                                  const updated = [...draftData.followUps];
                                  updated[idx] = { ...f, status: e.target.value as FollowUpVisit['status'] };
                                  setDraftData({ ...draftData, followUps: updated });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs font-semibold"
                              >
                                <option value="زيارة أولية مسجلة (Current)">زيارة أولية مسجلة (Current)</option>
                                <option value="مخطط / لم تتم بعد">مخطط / لم تتم بعد</option>
                                <option value="مكتملة">مكتملة</option>
                              </select>
                            </td>
                            <td className="p-3 text-slate-600">{f.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Follow-up Form */}
                  <form onSubmit={handleAddFollowUp} className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                    <h4 className="font-bold text-xs text-[#0f4c5c] flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>إضافة موعد متابعة جديد (Add Demo Follow-Up Entry)</span>
                    </h4>
                    {fuError && <div className="text-xs text-red-600 font-semibold">{fuError}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">التاريخ (DD/MM/YYYY) *</label>
                        <input
                          type="text"
                          placeholder="مثال: 10/12/2026"
                          value={newFollowUp.date}
                          onChange={(e) => setNewFollowUp({ ...newFollowUp, date: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">نوع الزيارة</label>
                        <input
                          type="text"
                          value={newFollowUp.type}
                          onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">الهدف السريري *</label>
                        <input
                          type="text"
                          placeholder="مثال: تقييم استقرار الإقلاع"
                          value={newFollowUp.objective}
                          onChange={(e) => setNewFollowUp({ ...newFollowUp, objective: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">حالة الزيارة</label>
                        <select
                          value={newFollowUp.status}
                          onChange={(e) => setNewFollowUp({ ...newFollowUp, status: e.target.value as FollowUpVisit['status'] })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                        >
                          <option value="مخطط / لم تتم بعد">مخطط / لم تتم بعد</option>
                          <option value="زيارة أولية مسجلة (Current)">زيارة أولية مسجلة (Current)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة موعد المتابعة</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: PHYSICIAN CLINICAL NOTES (SOAP) */}
          {activeSection === 'notes' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#0f4c5c]">
                    14. ملاحظات الطبيب المعالج (Physician Progress Note - SOAP Summary)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                    مسودة تعليمية - غير معتمدة سريريًا
                  </span>
                  <button
                    onClick={() => setNotePreviewMode(!notePreviewMode)}
                    className="px-3 py-1 rounded border border-[#0f4c5c] text-[#0f4c5c] hover:bg-teal-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{notePreviewMode ? 'العودة لوضع التحرير' : 'معاينة الملاحظة السريرية'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 text-xs">
                {notePreviewMode ? (
                  <div className="p-5 bg-slate-50 border border-slate-300 rounded space-y-4 leading-relaxed">
                    <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-[#0f4c5c]">ملاحظة التقدم السريري للطبيب (Clinical Progress Note)</div>
                        <div className="text-slate-600">الطبيب المعالج: {draftData.patient.physician} (اسم افتراضي) — {draftData.patient.specialty}</div>
                      </div>
                      <div className="text-left text-amber-800 font-bold">
                        بدون توقيع — مسودة تعليمية غير معتمدة سريريًا
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900">1. الشكوى الرئيسية (Chief Complaint):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.chiefComplaint}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">2. تاريخ المرض الحالي (History of Present Illness):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.hpi}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">3. التاريخ المرضي ذو الصلة (Relevant History):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.relevantHistory}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">4. التقييم السريري (Clinical Assessment):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.clinicalAssessment}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">5. خطة الرعاية (Care Plan):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.carePlanSummary}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">6. تعليمات المتابعة (Follow-up Instructions):</h4>
                      <p className="text-slate-700 mt-0.5">{draftData.clinicalNote.followUpInstructions}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">1. الشكوى الرئيسية (Chief Complaint)</label>
                      <input
                        type="text"
                        value={draftData.clinicalNote.chiefComplaint}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, chiefComplaint: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">2. تاريخ المرض الحالي (History of Present Illness - HPI)</label>
                      <textarea
                        rows={3}
                        value={draftData.clinicalNote.hpi}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, hpi: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">3. التاريخ المرضي ذو الصلة (Relevant History)</label>
                      <textarea
                        rows={2}
                        value={draftData.clinicalNote.relevantHistory}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, relevantHistory: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">4. الفحص والتقييم السريري (Clinical Assessment)</label>
                      <textarea
                        rows={3}
                        value={draftData.clinicalNote.clinicalAssessment}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, clinicalAssessment: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">5. خطة الرعاية (Care Plan Summary)</label>
                      <textarea
                        rows={2}
                        value={draftData.clinicalNote.carePlanSummary}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, carePlanSummary: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">6. تعليمات المتابعة (Follow-up Instructions)</label>
                      <textarea
                        rows={2}
                        value={draftData.clinicalNote.followUpInstructions}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            clinicalNote: { ...draftData.clinicalNote, followUpInstructions: e.target.value }
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">
                    حالة الاعتماد: بدون توقيع — مسودة تعليمية غير معتمدة سريريًا
                  </span>
                  <button
                    onClick={handleSaveAll}
                    className="px-4 py-2 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ مسودة الملاحظة السريرية</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13: PARTNER PROJECT (HEAL DATA JOURNEY) */}
          {activeSection === 'partner' && (
            <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <div className="bg-[#e8f1f5] border-b border-slate-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[#0f4c5c] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0f4c5c]" />
                    <span>15. رحلة البيانات الصحية — المشروع المشترك (Heal Data Journey - Partner Portal)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    إعداد وتطوير: شموع الحربي (Shomoukh Alharbi) — منصة رديفة مشتركة لمشروع المعلوماتية الصحية
                  </p>
                </div>

                <a
                  href="https://healdatajourey.lovable.app/mission"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded bg-[#0f4c5c] hover:bg-[#0b3948] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>فتح الموقع في نافذة مستقلة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 space-y-3">
                <div className="p-3 rounded bg-teal-50/70 border border-teal-200 text-xs text-slate-700 flex items-center justify-between gap-2">
                  <span>
                    <strong>تكامل البيانات المشتركة:</strong> يمكنكِ تصفح موقع زميلتكِ مباشرة من النافذة التفاعلية أدناه، أو فتحه في علامة تبويب كاملة عبر الزر العلوي.
                  </span>
                </div>

                <div className="w-full h-[750px] rounded border border-slate-300 overflow-hidden bg-slate-100 shadow-inner">
                  <iframe
                    src="https://healdatajourey.lovable.app/mission"
                    title="Heal Data Journey Partner Site"
                    className="w-full h-full border-0"
                    allow="fullscreen"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded border border-slate-300 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{confirmModal.title}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Educational Simulation Footer */}
      <footer className="bg-white border-t border-slate-300 py-3 px-4 text-center text-xs text-slate-600 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>مستشفى الرعاية الصحية الافتراضي (Virtual Healthcare Hospital)</strong> — تطوير السجل: حنين مصطفى ماضي (Haneen Mustafa Madhy) | رحلة البيانات: شموع الحربي
          </div>
          <div>
            محاكاة تعليمية لمشروع التوعية بالمعلوماتية الصحية (الإقلاع عن التدخين والوقاية من المخدرات) — جميع البيانات افتراضية وغير صالحة للاستخدام السريري.
          </div>
        </div>
      </footer>
    </div>
  );
}