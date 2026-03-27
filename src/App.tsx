import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Phone, 
  Settings as AdminIcon, 
  BookOpen, 
  Info, 
  Download, 
  Image as GalleryIcon, 
  Heart, 
  UserPlus, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  Facebook,
  MessageCircle,
  Clock,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  WifiOff,
  IdCard,
  User as UserIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, User, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { getDocFromServer } from 'firebase/firestore';
import { db, auth } from './firebase';
import { cn } from './lib/utils';
import Chatbot from './components/Chatbot';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Language = 'bn' | 'ar' | 'en';

interface SiteSettings {
  name: string;
  subtitle: string;
  estd: string;
  address: string;
  phone1: string;
  phone2: string;
  facebookUrl: string;
  logoUrl: string;
  aboutText: string;
  academicNazeraText: string;
  academicHifzText: string;
  otherResidentialText: string;
  otherDocumentsText: string;
  otherSpecialText: string;
  notificationEmail?: string;
  notificationPhone?: string;
  // Translations
  name_en?: string;
  subtitle_en?: string;
  address_en?: string;
  aboutText_en?: string;
  academicNazeraText_en?: string;
  academicHifzText_en?: string;
  otherResidentialText_en?: string;
  otherDocumentsText_en?: string;
  otherSpecialText_en?: string;
  name_ar?: string;
  subtitle_ar?: string;
  address_ar?: string;
  aboutText_ar?: string;
  academicNazeraText_ar?: string;
  academicHifzText_ar?: string;
  otherResidentialText_ar?: string;
  otherDocumentsText_ar?: string;
  otherSpecialText_ar?: string;
}

const translations = {
  bn: {
    home: 'হোম',
    academic: 'একাডেমিক',
    academicInfo: 'একাডেমিক তথ্য',
    gallery: 'গ্যালারি',
    download: 'ডাউনলোড',
    admission: 'ভর্তি',
    onlineAdmission: 'অনলাইন ভর্তি',
    admissionInfo: 'ভর্তি তথ্য ও অন্যান্য',
    contact: 'যোগাযোগ',
    donation: 'দান করুন',
    search: 'খুঁজুন',
    admin: 'অ্যাডমিন',
    logout: 'লগআউট',
    login: 'লগইন',
    notice: 'নোটিশ',
    stats: 'পরিসংখ্যান',
    staff: 'শিক্ষক/কমিটি',
    messages: 'বার্তা',
    settings: 'সেটিংস',
    save: 'সেভ করুন',
    delete: 'ডিলিট',
    edit: 'এডিট',
    add: 'যোগ করুন',
    new: 'নতুন',
    established: 'প্রতিষ্ঠাকাল',
    address: 'ঠিকানা',
    phone: 'ফোন',
    email: 'ইমেইল',
    subject: 'বিষয়',
    message: 'বার্তা',
    send: 'পাঠান',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    searchPlaceholder: 'নাম বা আইডি দিয়ে খুঁজুন...',
    noResults: 'কোনো ফলাফল পাওয়া যায়নি।',
    studentName: 'শিক্ষার্থীর নাম',
    fatherName: 'পিতার নাম',
    motherName: 'মাতার নাম',
    dob: 'জন্ম তারিখ',
    department: 'বিভাগ',
    type: 'ধরণ',
    residential: 'আবাসিক',
    nonResidential: 'অনাবাসিক',
    bloodGroup: 'রক্তের গ্রুপ',
    previousMadrasah: 'পূর্ববর্তী মাদ্রাসা',
    apply: 'আবেদন করুন',
    idCard: 'আইডি কার্ড',
    downloadId: 'ডাউনলোড করুন',
    bulkDownload: 'বাল্ক ডাউনলোড',
    allDepts: 'সকল বিভাগ',
    allTypes: 'সকল ধরণ',
    nazera: 'নাজেরা বিভাগ',
    hifz: 'হিফজ বিভাগ',
    about: 'আমাদের সম্পর্কে',
    quickLinks: 'দ্রুত লিঙ্ক',
    followUs: 'আমাদের অনুসরণ করুন',
    sitemap: 'সাইটম্যাপ',
    footerText: 'হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স। সর্বস্বত্ব সংরক্ষিত।',
  },
  ar: {
    home: 'الرئيسية',
    academic: 'الأكاديمية',
    academicInfo: 'معلومات أكاديمية',
    gallery: 'معرض الصور',
    download: 'تحميل',
    admission: 'القبول',
    onlineAdmission: 'القبول عبر الإنترنت',
    admissionInfo: 'معلومات القبول وأخرى',
    contact: 'اتصل بنا',
    donation: 'تبرع',
    search: 'بحث',
    admin: 'المسؤول',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    notice: 'إشعار',
    stats: 'إحصائيات',
    staff: 'الموظفون/اللجنة',
    messages: 'الرسائل',
    settings: 'الإعدادات',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    new: 'جديد',
    established: 'تأسست في',
    address: 'العنوان',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    subject: 'الموضوع',
    message: 'الرسالة',
    send: 'إرسال',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    searchPlaceholder: 'البحث بالاسم أو الهوية...',
    noResults: 'لم يتم العثور على نتائج.',
    studentName: 'اسم الطالب',
    fatherName: 'اسم الأب',
    motherName: 'اسم الأم',
    dob: 'تاريخ الميلاد',
    department: 'القسم',
    type: 'النوع',
    residential: 'سكني',
    nonResidential: 'غير سكني',
    bloodGroup: 'فصيلة الدم',
    previousMadrasah: 'المدرسة السابقة',
    apply: 'قدم الآن',
    idCard: 'بطاقة الهوية',
    downloadId: 'تحميل',
    bulkDownload: 'تحميل جماعي',
    allDepts: 'جميع الأقسام',
    allTypes: 'جميع الأنواع',
    nazera: 'قسم الناظرة',
    hifz: 'قسم الحفظ',
    about: 'معلومات عنا',
    quickLinks: 'روابط سريعة',
    followUs: 'تابعنا',
    sitemap: 'خريطة الموقع',
    footerText: 'مجمع مدرسة الحاج سيد أحمد (رح). جميع الحقوق محفوظة.',
  },
  en: {
    home: 'Home',
    academic: 'Academic',
    academicInfo: 'Academic Info',
    gallery: 'Gallery',
    download: 'Download',
    admission: 'Admission',
    onlineAdmission: 'Online Admission',
    admissionInfo: 'Admission Info & Other',
    contact: 'Contact',
    donation: 'Donate',
    search: 'Search',
    admin: 'Admin',
    logout: 'Logout',
    login: 'Login',
    notice: 'Notice',
    stats: 'Stats',
    staff: 'Staff/Committee',
    messages: 'Messages',
    settings: 'Settings',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    new: 'New',
    established: 'Established',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    searchPlaceholder: 'Search by name or ID...',
    noResults: 'No results found.',
    studentName: 'Student Name',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    dob: 'Date of Birth',
    department: 'Department',
    type: 'Type',
    residential: 'Residential',
    nonResidential: 'Non-residential',
    bloodGroup: 'Blood Group',
    previousMadrasah: 'Previous Madrasah',
    apply: 'Apply Now',
    idCard: 'ID Card',
    downloadId: 'Download',
    bulkDownload: 'Bulk Download',
    allDepts: 'All Departments',
    allTypes: 'All Types',
    nazera: 'Nazera Dept',
    hifz: 'Hifz Dept',
    about: 'About Us',
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    sitemap: 'Sitemap',
    footerText: 'Haji Sayed Ahmad (Rh) Madrasah Complex. All rights reserved.',
  }
};

const LanguageContext = React.createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  getSetting: (settings: SiteSettings, key: keyof SiteSettings) => string;
}>({
  lang: 'bn',
  setLang: () => {},
  t: (key) => key,
  getSetting: (s, k) => String(s[k] || ''),
});

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  const getSetting = (settings: SiteSettings, key: keyof SiteSettings) => {
    if (!settings) return '';
    if (lang === 'bn') return String(settings[key] || '');
    const translatedKey = `${String(key)}_${lang}` as keyof SiteSettings;
    return String(settings[translatedKey] || settings[key] || '');
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getSetting }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useTranslation = () => React.useContext(LanguageContext);

interface Notice {
  id: string;
  text: string;
  date: string;
  isNew: boolean;
  createdAt: any;
}

interface Stat {
  id: string;
  label: string;
  value: string;
  order: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  type: 'committee' | 'teacher';
}

interface Admission {
  id: string;
  studentName: string;
  dob: string;
  department: string;
  type: string;
  fatherName: string;
  mobile: string;
  address: string;
  createdAt: any;
}

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-text">দুঃখিত, একটি সমস্যা হয়েছে</h2>
            <p className="text-muted text-sm">অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা পরে চেষ্টা করুন।</p>
            <button onClick={() => window.location.reload()} className="bg-[#1a5c38] text-white px-6 py-2 rounded-xl font-bold">রিফ্রেশ করুন</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Utils ---
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const bnToEn = (str: string) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.split('').map(c => {
    const i = bn.indexOf(c);
    return i !== -1 ? en[i] : c;
  }).join('').replace(/[^0-9]/g, '');
};

// --- Components ---

const CopyButton = ({ text, className }: { text: string, className?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shrink-0",
        copied ? "bg-green-600 text-white" : "bg-gold/10 text-gold hover:bg-gold hover:text-white",
        className
      )}
      title="কপি করুন"
    >
      {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
      {copied ? 'কপি হয়েছে' : 'কপি'}
    </button>
  );
};

const TopBar = ({ settings }: { settings: SiteSettings }) => {
  const isOnline = useOnlineStatus();
  const { lang, setLang, t } = useTranslation();
  
  return (
    <div className="bg-[#1a5c38] text-white text-[0.82rem] py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gold-light" />
            <span>{settings.address}</span>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
              <WifiOff size={10} /> {t('error')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 mr-4 border-r border-white/20 pr-4">
            <button 
              onClick={() => setLang('bn')} 
              className={cn("px-2 py-0.5 rounded transition-all", lang === 'bn' ? "bg-gold text-white font-bold" : "hover:text-gold-light")}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setLang('ar')} 
              className={cn("px-2 py-0.5 rounded transition-all font-arabic", lang === 'ar' ? "bg-gold text-white font-bold" : "hover:text-gold-light")}
            >
              العربية
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={cn("px-2 py-0.5 rounded transition-all", lang === 'en' ? "bg-gold text-white font-bold" : "hover:text-gold-light")}
            >
              English
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${settings.phone1}`} className="flex items-center gap-1 hover:text-gold-light transition-colors">
              <Phone size={14} /> {settings.phone1}
            </a>
            <CopyButton text={settings.phone1} className="bg-white/10 text-white hover:bg-gold" />
          </div>
          <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-gold-light transition-colors">
            <Facebook size={14} /> Facebook
          </a>
        </div>
      </div>
    </div>
  );
};

const Header = ({ settings }: { settings: SiteSettings }) => {
  const { getSetting } = useTranslation();
  return (
    <header className="header-bg py-8 px-4 text-center">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <img 
          src={settings.logoUrl || "HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg"} 
          alt="Logo" 
          className="w-[105px] h-[105px] rounded-full border-4 border-gold shadow-2xl object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/madrasah/200/200"; }}
        />
        <div className="text-center">
          <div className="font-arabic text-2xl text-gold-light mb-1">بسم الله الرحمن الرحيم</div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-light drop-shadow-lg leading-tight">
            {getSetting(settings, 'name')}
          </h1>
          <div className="text-white/90 text-sm sm:text-base mt-2 font-arabic">{getSetting(settings, 'subtitle')}</div>
          <div className="text-gold-light text-sm font-semibold mt-2">
            ✦ {getSetting(settings, 'estd')} ✦ {getSetting(settings, 'address')} ✦
          </div>
        </div>
      </div>
    </header>
  );
};

const Marquee = ({ notices }: { notices: Notice[] }) => {
  const { t } = useTranslation();
  return (
    <div className="marquee-bar">
      <div className="marquee-inner">
        {notices.map((n, i) => (
          <span key={i} className="px-12">
            {n.isNew && (
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full mr-2 font-bold shadow-sm inline-flex items-center gap-1">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                {t('new')}
              </span>
            )}
            {n.text}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {notices.map((n, i) => (
          <span key={`dup-${i}`} className="px-12">
            {n.isNew && (
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full mr-2 font-bold shadow-sm inline-flex items-center gap-1">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                {t('new')}
              </span>
            )}
            {n.text}
          </span>
        ))}
      </div>
    </div>
  );
};

const Nav = ({ isAdmin, settings, onLogout }: { isAdmin: boolean, settings: SiteSettings, onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const links = [
    { to: '/', label: t('home'), icon: HomeIcon },
    { 
      label: t('academic'), 
      icon: BookOpen,
      subItems: [
        { to: '/academic', label: t('academicInfo'), icon: BookOpen },
        { to: '/gallery', label: t('gallery'), icon: GalleryIcon },
        { to: '/download', label: t('download'), icon: Download },
      ]
    },
    { 
      label: t('admission'), 
      icon: UserPlus,
      subItems: [
        { to: '/admission', label: t('onlineAdmission'), icon: UserPlus },
        { to: '/other', label: t('admissionInfo'), icon: Info },
      ]
    },
    { to: '/contact', label: t('contact'), icon: Phone },
  ];

  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  return (
    <nav className="bg-white border-b-3 border-gold sticky top-0 z-[200] shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={settings.logoUrl || "HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg"} 
              alt="Logo" 
              className="w-10 h-10 rounded-full border-2 border-gold object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/madrasah/200/200"; }}
            />
            <div className="hidden sm:block">
              <div className="font-serif text-xs font-bold text-[#1a5c38]">হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা</div>
              <div className="text-[10px] text-muted">চকরিয়া, কক্সবাজার</div>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              link.subItems ? (
                <div key={link.label} className="relative group">
                  <button
                    className={cn(
                      "px-4 py-5 text-sm font-semibold transition-all border-b-3 border-transparent flex items-center gap-1",
                      link.subItems.some(sub => location.pathname === sub.to) ? "text-gold border-gold bg-green-pale" : "text-[#1a5c38] hover:text-gold hover:bg-green-pale"
                    )}
                  >
                    {link.label}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 w-48 bg-white shadow-xl border border-border rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    {link.subItems.map((sub) => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        className={cn(
                          "block px-4 py-2 text-sm font-semibold transition-all",
                          location.pathname === sub.to ? "text-gold bg-green-pale" : "text-[#1a5c38] hover:text-gold hover:bg-green-pale"
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to!}
                  className={cn(
                    "px-4 py-5 text-sm font-semibold transition-all border-b-3 border-transparent",
                    location.pathname === link.to ? "text-gold border-gold bg-green-pale" : "text-[#1a5c38] hover:text-gold hover:bg-green-pale"
                  )}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/search" className="p-2 text-[#1a5c38] hover:bg-green-pale rounded-full transition-all" title="খুঁজুন">
            <Search size={20} />
          </Link>
          <Link to="/donation" className="btn-donate px-4 py-2 rounded-lg text-sm hidden sm:flex items-center gap-2">
            <Heart size={16} /> দান করুন
          </Link>
          <Link to="/admission" className="bg-[#1a5c38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2d8653] transition-all hidden sm:flex items-center gap-2">
            <UserPlus size={16} /> ভর্তি
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link to="/admin" className="p-2 text-[#1a5c38] hover:bg-green-pale rounded-full transition-all">
                <AdminIcon size={20} />
              </Link>
              <button onClick={onLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all">
                <LogOut size={20} />
              </button>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-[#1a5c38]">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-[-1] lg:hidden"
            />
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-border overflow-hidden relative z-10"
            >
              <div className="flex flex-col p-4 gap-1">
                {links.map((link) => (
                  link.subItems ? (
                    <div key={link.label} className="flex flex-col">
                      <button
                        onClick={() => toggleSubMenu(link.label)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg text-sm font-semibold",
                          link.subItems.some(sub => location.pathname === sub.to) ? "bg-green-pale text-gold" : "text-[#1a5c38] hover:bg-green-pale"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon size={18} />
                          {link.label}
                        </div>
                        {openSubMenu === link.label ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <AnimatePresence>
                        {openSubMenu === link.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col pl-11 gap-1 overflow-hidden"
                          >
                            {link.subItems.map((sub) => (
                              <Link
                                key={sub.to}
                                to={sub.to}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 p-2 rounded-lg text-sm font-semibold",
                                  location.pathname === sub.to ? "text-gold" : "text-[#1a5c38] hover:text-gold"
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to!}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg text-sm font-semibold",
                        location.pathname === link.to ? "bg-green-pale text-gold" : "text-[#1a5c38] hover:bg-green-pale"
                      )}
                    >
                      <link.icon size={18} />
                      {link.label}
                    </Link>
                  )
                ))}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link to="/donation" onClick={() => setIsOpen(false)} className="btn-donate p-3 rounded-lg text-xs flex items-center justify-center gap-2">
                    <Heart size={14} /> দান করুন
                  </Link>
                  <Link to="/admission" onClick={() => setIsOpen(false)} className="bg-[#1a5c38] text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    <UserPlus size={14} /> ভর্তি
                  </Link>
                  <Link to="/search" onClick={() => setIsOpen(false)} className="bg-green-pale text-[#1a5c38] p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    <Search size={14} /> খুঁজুন
                  </Link>
                </div>
                {isAdmin && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="bg-green-pale text-[#1a5c38] p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                      <AdminIcon size={14} /> ড্যাশবোর্ড
                    </Link>
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                      <LogOut size={14} /> লগ আউট
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const DonationPage = ({ settings }: { settings: SiteSettings }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#0d3d22] to-[#1a5c38] py-16 px-4 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="font-arabic text-xl text-gold-light mb-4">مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-light mb-4 leading-tight">কুরআনের শিক্ষায় বিনিয়োগ করুন</h2>
          <p className="text-white/80 text-lg mb-8">আপনার একটি দান একজন শিশুর জীবন বদলে দিতে পারে। সদকায়ে জারিয়া অর্জন করুন।</p>
        </div>
        <div className="absolute left-8 bottom-4 text-[120px] opacity-5 text-white pointer-events-none">❤</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'বিকাশ (bKash)', icon: '📱', color: 'bg-green-pale', num: settings.phone1, type: 'সেন্ড মানি' },
            { title: 'নগদ (Nagad)', icon: '💜', color: 'bg-purple-50', num: settings.phone1, type: 'সেন্ড মানি' },
            { title: 'সরাসরি যোগাযোগ', icon: '💬', color: 'bg-blue-50', num: settings.phone2, type: 'WhatsApp / কল' },
          ].map((method, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-all border border-border">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-xl font-bold text-[#1a5c38] mb-2">{method.title}</h3>
              <p className="text-muted text-sm mb-6">{method.type}</p>
              <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border mb-6">
                <span className="font-bold text-lg">{method.num}</span>
                <CopyButton text={method.num} className="text-sm px-3 py-1.5" />
              </div>
              <div className="text-[11px] text-muted italic">
                💡 পেমেন্টের পর স্ক্রিনশট {method.num} নম্বরে WhatsApp করুন।
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-green-pale">
          <h3 className="font-serif text-2xl font-bold text-[#1a5c38] mb-8">📋 দানের ধাপসমূহ</h3>
          <div className="space-y-6">
              {[
                'বিকাশ অ্যাপ খুলে "সেন্ড মানি" অপশনে যান।',
                <div key="step-2" className="flex items-center gap-2">
                  <span>নম্বর দিন: {settings.phone1}</span>
                  <CopyButton text={settings.phone1} />
                </div>,
                'পরিমাণ লিখে রেফারেন্সে "DONATION" দিন।',
                'পিন দিয়ে কনফার্ম করুন।',
                <div key="step-5" className="flex items-center gap-2">
                  <span>স্ক্রিনশট তুলে WhatsApp করুন: {settings.phone1}</span>
                  <CopyButton text={settings.phone1} />
                </div>
              ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a5c38] text-white flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                <p className="text-text pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = ({ settings, notices, stats }: { settings: SiteSettings, notices: Notice[], stats: Stat[] }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#0d3d22] to-[#1a5c38] py-16 px-4 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl text-gold-light mb-4 leading-tight">
            কুরআনের আলোয় গড়ে উঠুক নতুন প্রজন্ম
          </h2>
          <p className="text-white/80 text-lg mb-8">
            {settings.name}-এ স্বাগতম। ২০২২ সাল থেকে চকরিয়া, কক্সবাজারে কুরআনের আলো ছড়িয়ে আসছে।
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/admission" className="bg-gold text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b8891f] transition-all shadow-lg">
              ✍️ ভর্তি আবেদন ২০২৬
            </Link>
            <Link to="/donation" className="btn-donate px-8 py-3 rounded-xl shadow-lg">
              💚 দান করুন
            </Link>
          </div>
        </div>
        <div className="absolute right-8 bottom-4 text-[120px] opacity-5 text-white pointer-events-none">☪</div>
      </div>

      {/* Quick Menu */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { to: '/admission', icon: '✍️', label: 'অনলাইন ভর্তি' },
            { to: '/donation', icon: '💚', label: 'দান করুন' },
            { to: '/academic', icon: '📚', label: 'একাডেমিক' },
            { to: '/download', icon: '⬇️', label: 'ডাউনলোড' },
            { to: '/contact', icon: '📞', label: 'যোগাযোগ' },
            { to: settings.facebookUrl, icon: '📘', label: 'Facebook', external: true },
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.external ? '#' : item.to}
              onClick={() => item.external && window.open(item.to, '_blank')}
              className={cn(
                "p-6 rounded-2xl shadow-xl text-center hover:-translate-y-1 transition-all border-b-4 group",
                item.to === '/donation' ? "btn-donate border-gold" : "bg-white border-border hover:border-gold"
              )}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className={cn(
                "font-bold text-xs",
                item.to === '/donation' ? "text-white" : "text-[#1a5c38]"
              )}>{item.label}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.sort((a, b) => a.order - b.order).map((stat) => (
              <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-md text-center border-t-4 border-[#1a5c38]">
                <div className="text-3xl font-bold text-[#1a5c38] mb-1">{stat.value}</div>
                <div className="text-muted text-xs font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Notices */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#1a5c38]">📢 নোটিশ বোর্ড</h3>
              <div className="h-1 flex-1 bg-gold rounded-full opacity-30" />
            </div>
            <div className="grid gap-4">
              {notices.length > 0 ? notices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-gold relative group cursor-default"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-[11px]">
                      <Clock size={14} />
                      {notice.date}
                    </div>
                    {notice.isNew && (
                      <span className="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm animate-pulse flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full" />
                        নতুন
                      </span>
                    )}
                  </div>
                  <p className="text-text text-sm leading-relaxed pr-6">
                    {notice.text}
                  </p>
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-gold" />
                  </div>
                </div>
              )) : (
                <div className="bg-white p-10 rounded-2xl shadow-md text-center text-muted border border-border">
                  <div className="text-4xl mb-2">📭</div>
                  কোনো নোটিশ নেই
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#1a5c38]">🕌 আমাদের সম্পর্কে</h3>
              <div className="h-1 flex-1 bg-gold rounded-full opacity-30" />
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-gold text-center">
              <img 
                src={settings.logoUrl || "HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg"} 
                alt="Logo" 
                className="w-20 h-20 rounded-full border-4 border-gold mx-auto mb-6 object-cover" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/madrasah/200/200"; }}
              />
              <p className="text-text leading-relaxed mb-6">
                {settings.aboutText || `${settings.name} কক্সবাজারের চকরিয়া পৌরসভার তরছ পাড়ায় অবস্থিত একটি দ্বীনি শিক্ষা প্রতিষ্ঠান।`}
              </p>
              <ul className="text-left space-y-3 mb-8">
                {['অভিজ্ঞ শিক্ষকমণ্ডলী', 'নাজেরা ও হিফজ বিভাগ', 'নিরাপদ ইসলামী পরিবেশ', 'নিয়মিত পরীক্ষা ও মূল্যায়ন'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-gold">✦</span> {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Link to="/donation" className="btn-donate flex-1 py-3 rounded-xl shadow-lg">
                  💚 দান করুন
                </Link>
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="p-3 bg-green-pale text-[#1a5c38] rounded-xl hover:bg-[#1a5c38] hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-[#1a5c38]">
              <h3 className="font-serif text-xl font-bold text-[#1a5c38] mb-6 flex items-center gap-2">
                <Clock size={20} /> সময়সূচি
              </h3>
              <ul className="space-y-4">
                {[
                  { label: 'ফজর ক্লাস', time: '৫:০০ — ৭:০০' },
                  { label: 'সকাল ক্লাস', time: '৮:০০ — ১২:০০' },
                  { label: 'আসর ক্লাস', time: '৪:০০ — ৬:০০' },
                  { label: 'মাগরিব ক্লাস', time: 'মাগরিবের পরে' },
                  { label: 'ছুটি', time: 'প্রতি শুক্রবার' },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center border-b border-green-pale pb-2">
                    <span className="text-sm font-semibold text-text">{item.label}</span>
                    <span className="text-xs text-muted">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const ContactPage = ({ settings }: { settings: SiteSettings }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const path = 'messages';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      
      // Send notification via backend
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            notificationEmail: settings.notificationEmail,
            notificationPhone: settings.notificationPhone
          })
        });
      } catch (notifyErr) {
        console.error('Notification failed:', notifyErr);
        // We don't fail the whole process if notification fails
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      setStatus('error');
    }
  };

  const whatsappLink = `https://wa.me/88${bnToEn(settings.phone1)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#1a5c38]">যোগাযোগ করুন</h2>
            <p className="text-muted text-lg">আমাদের সাথে যোগাযোগের জন্য নিচের ফর্মটি পূরণ করুন অথবা সরাসরি ফোন করুন।</p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold">
              <div className="w-12 h-12 rounded-full bg-green-pale flex items-center justify-center text-[#1a5c38]">
                <MapPin size={24} />
              </div>
              <div>
                <div className="font-bold text-[#1a5c38]">ঠিকানা</div>
                <div className="text-sm text-muted">{settings.address}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold">
              <div className="w-12 h-12 rounded-full bg-green-pale flex items-center justify-center text-[#1a5c38]">
                <Phone size={24} />
              </div>
              <div>
                <div className="font-bold text-[#1a5c38]">ফোন নম্বর</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">{settings.phone1}</span>
                    <CopyButton text={settings.phone1} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">{settings.phone2}</span>
                    <CopyButton text={settings.phone2} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#1877F2] text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all font-bold"
              >
                <Facebook size={24} /> Facebook
              </a>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all font-bold"
              >
                <MessageCircle size={24} /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-green-pale">
          <h3 className="text-2xl font-bold text-[#1a5c38] mb-6">বার্তা পাঠান</h3>
          {status === 'success' ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-xl font-bold text-[#1a5c38]">বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
              <p className="text-muted">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব ইনশাআল্লাহ।</p>
              <button onClick={() => setStatus('idle')} className="text-[#1a5c38] font-bold underline">আরেকটি বার্তা পাঠান</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted">আপনার নাম</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" 
                    placeholder="নাম লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted">ইমেইল</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" 
                    placeholder="ইমেইল লিখুন"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">বিষয়</label>
                <input 
                  required 
                  type="text" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" 
                  placeholder="বার্তার বিষয়"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">বার্তা</label>
                <textarea 
                  required 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" 
                  placeholder="আপনার বার্তা এখানে লিখুন..."
                />
              </div>
              <button 
                disabled={status === 'loading'}
                className="w-full bg-[#1a5c38] text-white py-4 rounded-xl font-bold hover:bg-[#2d8653] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
              </button>
              {status === 'error' && <p className="text-red-600 text-center text-sm">দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AdmissionPage = ({ settings }: { settings: SiteSettings }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    department: 'নাজেরা বিভাগ',
    type: 'আবাসিক',
    fatherName: '',
    motherName: '',
    mobile: '',
    address: '',
    previousMadrasah: '',
    bloodGroup: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const path = 'admissions';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      // Send notification via backend
      try {
        await fetch('/api/admission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            notificationEmail: settings.notificationEmail,
            notificationPhone: settings.notificationPhone
          })
        });
      } catch (notifyErr) {
        console.error('Notification failed:', notifyErr);
        // We don't fail the whole process if notification fails
      }

      setStatus('success');
      setFormData({ 
        studentName: '', 
        dob: '', 
        department: 'নাজেরা বিভাগ', 
        type: 'আবাসিক', 
        fatherName: '', 
        motherName: '',
        mobile: '', 
        address: '',
        previousMadrasah: '',
        bloodGroup: ''
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block bg-green-pale text-[#1a5c38] px-4 py-1 rounded-full text-sm font-bold border border-green-100">
            ভর্তি সেশন ২০২৬
          </div>
          <h2 className="font-serif text-4xl font-bold text-[#1a5c38]">অনলাইন ভর্তি আবেদন ফর্ম</h2>
          <p className="text-muted max-w-lg mx-auto">সঠিক তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন। আমাদের প্রতিনিধি আপনার সাথে শীঘ্রই যোগাযোগ করবেন।</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-green-pale">
          <div className="bg-[#1a5c38] p-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">শিক্ষার্থীর তথ্য</h3>
                <p className="text-white/60 text-xs">অনুগ্রহ করে সকল তথ্য বাংলায় পূরণ করুন</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-2xl font-bold text-gold-light">Admission</div>
              <div className="text-[10px] opacity-50 uppercase tracking-widest font-mono">Form Serial: 2026-WEB</div>
            </div>
          </div>

          {status === 'success' ? (
            <div className="p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-50 text-[#1a5c38] rounded-full flex items-center justify-center mx-auto border-4 border-green-100">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-[#1a5c38]">আলহামদুলিল্লাহ!</h3>
                <p className="text-xl font-medium text-text">আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে।</p>
                <p className="text-muted">আমরা খুব শীঘ্রই আপনার দেওয়া মোবাইল নম্বরে যোগাযোগ করব।</p>
              </div>
              <div className="pt-8">
                <button 
                  onClick={() => setStatus('idle')} 
                  className="bg-[#1a5c38] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#2d8653] transition-all shadow-lg"
                >
                  আরেকটি আবেদন করুন
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
              {/* Section 1: Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-green-pale pb-2">
                  <div className="w-2 h-6 bg-gold rounded-full" />
                  <h4 className="font-bold text-[#1a5c38]">ব্যক্তিগত তথ্য</h4>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text flex items-center gap-2">
                      শিক্ষার্থীর নাম <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={formData.studentName} 
                      onChange={e => setFormData({...formData, studentName: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                      placeholder="পূর্ণ নাম লিখুন" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text flex items-center gap-2">
                      জন্ম তারিখ <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="date" 
                      value={formData.dob} 
                      onChange={e => setFormData({...formData, dob: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">বিভাগ *</label>
                    <select 
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option>নাজেরা বিভাগ</option>
                      <option>হিফজ বিভাগ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">ধরন *</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option>আবাসিক</option>
                      <option>অনাবাসিক</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">রক্তের গ্রুপ</label>
                    <select 
                      value={formData.bloodGroup} 
                      onChange={e => setFormData({...formData, bloodGroup: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Guardian Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-green-pale pb-2">
                  <div className="w-2 h-6 bg-gold rounded-full" />
                  <h4 className="font-bold text-[#1a5c38]">অভিভাবকের তথ্য</h4>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">পিতার নাম *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.fatherName} 
                      onChange={e => setFormData({...formData, fatherName: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                      placeholder="পিতার পূর্ণ নাম" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">মাতার নাম *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.motherName} 
                      onChange={e => setFormData({...formData, motherName: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                      placeholder="মাতার পূর্ণ নাম" 
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">মোবাইল নম্বর *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                      <input 
                        required 
                        type="tel" 
                        value={formData.mobile} 
                        onChange={e => setFormData({...formData, mobile: e.target.value})} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                        placeholder="০১৮XX-XXXXXX" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text">পূর্ববর্তী মাদ্রাসা (যদি থাকে)</label>
                    <input 
                      type="text" 
                      value={formData.previousMadrasah} 
                      onChange={e => setFormData({...formData, previousMadrasah: e.target.value})} 
                      className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm" 
                      placeholder="মাদ্রাসার নাম" 
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Address */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-green-pale pb-2">
                  <div className="w-2 h-6 bg-gold rounded-full" />
                  <h4 className="font-bold text-[#1a5c38]">স্থায়ী ঠিকানা</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text">বর্তমান ও স্থায়ী ঠিকানা *</label>
                  <textarea 
                    required 
                    rows={3} 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-bg border-2 border-transparent focus:border-[#1a5c38] focus:bg-white outline-none transition-all shadow-sm resize-none" 
                    placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা..." 
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={status === 'loading'}
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#1a5c38] to-[#2d8653] text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      আবেদন জমা দিন
                    </>
                  )}
                </button>
                {status === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2">
                    <AlertCircle size={18} />
                    দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: <Clock className="mx-auto text-gold" />, title: '২৪/৭ আবেদন', desc: 'যেকোনো সময় অনলাইন আবেদন' },
            { icon: <CheckCircle2 className="mx-auto text-gold" />, title: 'দ্রুত যাচাই', desc: '২৪ ঘণ্টার মধ্যে যোগাযোগ' },
            { icon: <Phone className="mx-auto text-gold" />, title: 'সহায়তা', desc: '০১৮২২-৩২৬৮৯৫' },
          ].map((item, i) => (
            <div key={i} className="bg-white/50 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
              {item.icon}
              <h5 className="font-bold text-[#1a5c38] mt-3">{item.title}</h5>
              <p className="text-xs text-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const IDCardContent = ({ admission, settings }: { admission: Admission, settings: SiteSettings }) => (
  <div 
    className="w-[350px] h-[500px] bg-white border-2 border-[#1a5c38] rounded-2xl overflow-hidden shadow-lg relative font-sans"
    style={{ backgroundImage: 'linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%)' }}
  >
    {/* Header */}
    <div className="bg-[#1a5c38] p-4 text-center text-white">
      <div className="flex justify-center mb-2">
        <img 
          src={settings.logoUrl || "https://picsum.photos/seed/madrasah/100/100"} 
          alt="Logo" 
          className="w-12 h-12 rounded-full border-2 border-gold bg-white object-cover"
        />
      </div>
      <h4 className="text-sm font-bold leading-tight">{settings.name}</h4>
      <p className="text-[10px] opacity-80 mt-1">{settings.address}</p>
    </div>

    {/* Body */}
    <div className="p-6 flex flex-col items-center">
      {/* Photo Placeholder */}
      <div className="w-32 h-40 bg-green-pale border-2 border-dashed border-[#1a5c38]/30 rounded-lg flex flex-col items-center justify-center mb-6 overflow-hidden">
        <UserIcon size={48} className="text-[#1a5c38]/20" />
        <span className="text-[10px] text-[#1a5c38]/40 mt-2 font-bold">PHOTO</span>
      </div>

      {/* Student Info */}
      <div className="w-full space-y-3 text-center">
        <div>
          <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">শিক্ষার্থীর নাম</div>
          <div className="text-lg font-bold text-[#1a5c38] leading-tight">{admission.studentName}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-green-pale">
          <div>
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">বিভাগ</div>
            <div className="text-xs font-bold text-text">{admission.department}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">ভর্তি আইডি</div>
            <div className="text-xs font-bold text-text font-mono">{admission.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>

        <div className="pt-2">
          <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">পিতার নাম</div>
          <div className="text-xs font-bold text-text">{admission.fatherName}</div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="absolute bottom-0 w-full p-4 bg-green-pale border-t border-[#1a5c38]/10 flex justify-between items-center">
      <div className="text-[8px] text-[#1a5c38] font-bold">
        মাদরাসা আইডি কার্ড
      </div>
      <div className="w-16 h-8 border-b border-[#1a5c38]/30 flex items-end justify-center">
        <span className="text-[8px] text-muted italic">স্বাক্ষর</span>
      </div>
    </div>
  </div>
);

const StudentIDCard = ({ admission, settings, onDownload }: { admission: Admission, settings: SiteSettings, onDownload: () => void }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `ID_Card_${admission.studentName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onDownload();
    } catch (err) {
      console.error('Error generating ID card:', err);
      alert('ID কার্ড জেনারেট করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative"
      >
        <button onClick={onDownload} className="absolute top-4 right-4 p-2 hover:bg-bg rounded-full transition-all">
          <X size={24} className="text-muted" />
        </button>

        <h3 className="text-xl font-bold text-[#1a5c38] mb-6 text-center">স্টুডেন্ট আইডি কার্ড প্রিভিউ</h3>

        <div className="flex justify-center mb-8">
          <div ref={cardRef}>
            <IDCardContent admission={admission} settings={settings} />
          </div>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full bg-[#1a5c38] text-white py-4 rounded-xl font-bold hover:bg-[#2d8653] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Download size={20} /> ডাউনলোড করুন
        </button>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ settings, notices, stats, staff, admissions, messages, onLogout }: { settings: SiteSettings, notices: Notice[], stats: Stat[], staff: Staff[], admissions: Admission[], messages: Message[], onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'notices' | 'stats' | 'staff' | 'admissions' | 'messages'>('settings');
  const [selectedAdmissionForID, setSelectedAdmissionForID] = useState<Admission | null>(null);
  const [editSettings, setEditSettings] = useState(settings);
  const [newNotice, setNewNotice] = useState({ text: '', date: '', isNew: true });
  const [newStat, setNewStat] = useState({ label: '', value: '', order: 0 });
  const [newStaff, setNewStaff] = useState({ name: '', role: '', contact: '', type: 'teacher' as const });

  // Filtering and Bulk Selection State
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAdmissions, setSelectedAdmissions] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const filteredAdmissions = admissions.filter(a => {
    const matchesDept = deptFilter === 'all' || a.department === deptFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesDept && matchesType;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAdmissions(filteredAdmissions.map(a => a.id));
    } else {
      setSelectedAdmissions([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedAdmissions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    if (selectedAdmissions.length === 0) return;
    setIsBulkDownloading(true);
    
    // Small delay to ensure the hidden renderer has time to mount the cards
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      for (const id of selectedAdmissions) {
        const admission = admissions.find(a => a.id === id);
        if (!admission) continue;
        
        const element = document.getElementById(`id-card-${id}`);
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true
          });
          const link = document.createElement('a');
          link.download = `ID_Card_${admission.studentName.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          // Small delay between downloads to prevent browser issues
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      alert('সকল আইডি কার্ড ডাউনলোড সম্পন্ন হয়েছে।');
    } catch (err) {
      console.error('Bulk download error:', err);
      alert('বাল্ক ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsBulkDownloading(false);
      setSelectedAdmissions([]);
    }
  };

  const handleSaveSettings = async () => {
    const path = 'settings/main';
    try {
      await setDoc(doc(db, 'settings', 'main'), editSettings);
      alert('Settings saved!');
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, path); }
  };

  const handleAddNotice = async () => {
    if (!newNotice.text || !newNotice.date) return;
    const path = 'notices';
    try {
      await addDoc(collection(db, path), { ...newNotice, createdAt: new Date().toISOString() });
      setNewNotice({ text: '', date: '', isNew: true });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, path); }
  };

  const handleAddStat = async () => {
    if (!newStat.label || !newStat.value) return;
    const path = 'stats';
    try {
      await addDoc(collection(db, path), newStat);
      setNewStat({ label: '', value: '', order: 0 });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, path); }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role) return;
    const path = 'staff';
    try {
      await addDoc(collection(db, path), newStaff);
      setNewStaff({ name: '', role: '', contact: '', type: 'teacher' });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, path); }
  };

  const deleteItem = async (col: string, id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, col, id));
      } catch (err) { handleFirestoreError(err, OperationType.DELETE, `${col}/${id}`); }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 space-y-2">
        {[
          { id: 'settings', label: 'সেটিংস', icon: AdminIcon },
          { id: 'notices', label: 'নোটিশ', icon: CheckCircle2 },
          { id: 'stats', label: 'পরিসংখ্যান', icon: HomeIcon },
          { id: 'staff', label: 'শিক্ষক/কমিটি', icon: UserPlus },
          { id: 'admissions', label: 'ভর্তি আবেদন', icon: BookOpen },
          { id: 'messages', label: 'বার্তা', icon: AlertCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all text-left",
              activeTab === tab.id ? "bg-[#1a5c38] text-white shadow-lg" : "hover:bg-green-pale text-[#1a5c38]"
            )}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={20} /> লগ আউট
        </button>
      </aside>

      <main className="flex-1 bg-white p-8 rounded-3xl shadow-xl border border-green-pale min-h-[600px]">
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#1a5c38] mb-8">ওয়েবসাইট সেটিংস</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">মাদ্রাসার নাম</label>
                <input type="text" value={editSettings.name} onChange={e => setEditSettings({...editSettings, name: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">স্লোগান (আরবি/বাংলা)</label>
                <input type="text" value={editSettings.subtitle} onChange={e => setEditSettings({...editSettings, subtitle: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">প্রতিষ্ঠাকাল</label>
                <input type="text" value={editSettings.estd} onChange={e => setEditSettings({...editSettings, estd: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">ঠিকানা</label>
                <input type="text" value={editSettings.address} onChange={e => setEditSettings({...editSettings, address: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">ফোন ১</label>
                <input type="text" value={editSettings.phone1} onChange={e => setEditSettings({...editSettings, phone1: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">ফোন ২</label>
                <input type="text" value={editSettings.phone2} onChange={e => setEditSettings({...editSettings, phone2: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">ফেসবুক লিংক</label>
                <input type="text" value={editSettings.facebookUrl} onChange={e => setEditSettings({...editSettings, facebookUrl: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">লোগো URL</label>
                <input type="text" value={editSettings.logoUrl} onChange={e => setEditSettings({...editSettings, logoUrl: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" placeholder="Image URL" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-muted">আমাদের সম্পর্কে (About Text)</label>
                <textarea rows={4} value={editSettings.aboutText} onChange={e => setEditSettings({...editSettings, aboutText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">নাজেরা বিভাগ তথ্য</label>
                <textarea rows={3} value={editSettings.academicNazeraText} onChange={e => setEditSettings({...editSettings, academicNazeraText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">হিফজ বিভাগ তথ্য</label>
                <textarea rows={3} value={editSettings.academicHifzText} onChange={e => setEditSettings({...editSettings, academicHifzText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">আবাসিক সুবিধা তথ্য</label>
                <textarea rows={2} value={editSettings.otherResidentialText} onChange={e => setEditSettings({...editSettings, otherResidentialText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">ভর্তির কাগজপত্র তথ্য</label>
                <textarea rows={2} value={editSettings.otherDocumentsText} onChange={e => setEditSettings({...editSettings, otherDocumentsText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted">বিশেষ সুবিধা তথ্য</label>
                <textarea rows={2} value={editSettings.otherSpecialText} onChange={e => setEditSettings({...editSettings, otherSpecialText: e.target.value})} className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] resize-none" />
              </div>
              <div className="space-y-2 border-t border-border pt-4 sm:col-span-2">
                <h4 className="font-bold text-[#1a5c38] mb-4">🔔 নোটিফিকেশন সেটিংস (অ্যালার্ট)</h4>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted">অ্যালার্ট ইমেইল (কমা দিয়ে একাধিক লিখুন)</label>
                    <input 
                      type="text" 
                      value={editSettings.notificationEmail || ''} 
                      onChange={e => setEditSettings({...editSettings, notificationEmail: e.target.value})} 
                      className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" 
                      placeholder="example@gmail.com, admin@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted">WhatsApp অ্যালার্ট নম্বর (কান্ট্রি কোড সহ)</label>
                    <input 
                      type="text" 
                      value={editSettings.notificationPhone || ''} 
                      onChange={e => setEditSettings({...editSettings, notificationPhone: e.target.value})} 
                      className="w-full p-3 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38]" 
                      placeholder="88017XXXXXXXX"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted mt-2">দ্রষ্টব্য: WhatsApp অ্যালার্টের জন্য CallMeBot API কনফিগারেশন প্রয়োজন।</p>
              </div>
            </div>
            <button onClick={handleSaveSettings} className="bg-[#1a5c38] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2d8653] transition-all flex items-center gap-2">
              <Save size={20} /> সেভ করুন
            </button>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-8">
            <div className="bg-green-pale p-6 rounded-2xl space-y-4">
              <h4 className="font-bold text-[#1a5c38]">নতুন নোটিশ যোগ করুন</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder="নোটিশ টেক্সট" value={newNotice.text} onChange={e => setNewNotice({...newNotice, text: e.target.value})} className="p-3 rounded-xl border border-border" />
                <input type="text" placeholder="তারিখ (যেমন: মার্চ ২০২৬)" value={newNotice.date} onChange={e => setNewNotice({...newNotice, date: e.target.value})} className="p-3 rounded-xl border border-border" />
              </div>
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                <input type="checkbox" checked={newNotice.isNew} onChange={e => setNewNotice({...newNotice, isNew: e.target.checked})} /> নতুন নোটিশ?
              </label>
              <button onClick={handleAddNotice} className="bg-[#1a5c38] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#2d8653]">যোগ করুন</button>
            </div>
            <div className="space-y-2">
              {notices.map(n => (
                <div key={n.id} className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
                  <div>
                    <div className="font-bold text-sm">{n.text}</div>
                    <div className="text-[10px] text-muted">{n.date}</div>
                  </div>
                  <button onClick={() => deleteItem('notices', n.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admissions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold text-[#1a5c38]">ভর্তি আবেদন তালিকা</h3>
              <div className="flex flex-wrap gap-2">
                <select 
                  value={deptFilter} 
                  onChange={e => setDeptFilter(e.target.value)}
                  className="p-2 rounded-lg border border-border text-xs font-bold text-[#1a5c38] outline-none"
                >
                  <option value="all">সকল বিভাগ</option>
                  <option value="নাজেরা বিভাগ">নাজেরা বিভাগ</option>
                  <option value="হিফজ বিভাগ">হিফজ বিভাগ</option>
                </select>
                <select 
                  value={typeFilter} 
                  onChange={e => setTypeFilter(e.target.value)}
                  className="p-2 rounded-lg border border-border text-xs font-bold text-[#1a5c38] outline-none"
                >
                  <option value="all">সকল ধরণ</option>
                  <option value="আবাসিক">আবাসিক</option>
                  <option value="অনাবাসিক">অনাবাসিক</option>
                </select>
                <button 
                  onClick={handleBulkDownload}
                  disabled={selectedAdmissions.length === 0 || isBulkDownloading}
                  className="bg-[#1a5c38] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2d8653] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Download size={14} /> {isBulkDownloading ? 'ডাউনলোড হচ্ছে...' : `বাল্ক ডাউনলোড (${selectedAdmissions.length})`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-green-pale text-[#1a5c38]">
                  <tr>
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedAdmissions.length === filteredAdmissions.length && filteredAdmissions.length > 0}
                      />
                    </th>
                    <th className="p-4">নাম</th>
                    <th className="p-4">বিভাগ</th>
                    <th className="p-4">পিতা</th>
                    <th className="p-4">মোবাইল</th>
                    <th className="p-4">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAdmissions.length > 0 ? filteredAdmissions.map(a => (
                    <tr key={a.id} className={cn("hover:bg-bg", selectedAdmissions.includes(a.id) && "bg-green-pale/30")}>
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedAdmissions.includes(a.id)}
                          onChange={() => handleSelectOne(a.id)}
                        />
                      </td>
                      <td className="p-4 font-bold">{a.studentName}</td>
                      <td className="p-4">{a.department} ({a.type})</td>
                      <td className="p-4">{a.fatherName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {a.mobile}
                          <CopyButton text={a.mobile} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedAdmissionForID(a)}
                            className="text-[#1a5c38] hover:bg-green-pale p-2 rounded-lg transition-all"
                            title="আইডি কার্ড জেনারেট করুন"
                          >
                            <IdCard size={18} />
                          </button>
                          <button onClick={() => deleteItem('admissions', a.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted">কোনো আবেদন পাওয়া যায়নি।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {selectedAdmissionForID && (
              <StudentIDCard 
                admission={selectedAdmissionForID} 
                settings={settings} 
                onDownload={() => setSelectedAdmissionForID(null)} 
              />
            )}

            {/* Hidden renderer for bulk download */}
            <div id="bulk-id-renderer" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              {isBulkDownloading && selectedAdmissions.map(id => {
                const admission = admissions.find(a => a.id === id);
                if (!admission) return null;
                return (
                  <div key={id} id={`id-card-${id}`} className="inline-block">
                    <IDCardContent admission={admission} settings={settings} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#1a5c38] mb-8">ব্যবহারকারীর বার্তা</h3>
            <div className="space-y-4">
              {messages.length > 0 ? messages.map(m => (
                <div key={m.id} className="bg-bg p-6 rounded-2xl border border-border relative group">
                  <button 
                    onClick={() => deleteItem('messages', m.id)} 
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#1a5c38] border border-green-pale">
                      👤 {m.name}
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#1a5c38] border border-green-pale">
                      📧 {m.email}
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-muted border border-border">
                      📅 {new Date(m.createdAt).toLocaleString('bn-BD')}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-[#1a5c38]">বিষয়: {m.subject}</h4>
                  <p className="text-text whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-border">
                    {m.message}
                  </p>
                </div>
              )) : (
                <div className="text-center py-12 text-muted">কোনো বার্তা নেই</div>
              )}
            </div>
          </div>
        )}

        {/* Similar sections for Stats and Staff... */}
      </main>
    </div>
  );
};

const LoginPage = ({ settings, onLogin }: { settings: SiteSettings, onLogin: (isAdmin: boolean) => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let timer: any;
    if (lockoutUntil) {
      timer = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutUntil) {
          setLockoutUntil(null);
          setAttempts(0);
          setTimeLeft(0);
          clearInterval(timer);
        } else {
          setTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) return;

    setLoading(true);
    setError('');

    try {
      // Real integration with Firebase Auth
      // Note: Admin email is tangibulislam02@gmail.com
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.email === 'tangibulislam02@gmail.com') {
        onLogin(true);
        navigate('/admin');
      } else {
        setError('আপনার এই প্যানেলে প্রবেশের অনুমতি নেই।');
        await signOut(auth);
      }
    } catch (err: any) {
      // Fallback to hardcoded for initial setup if needed, but still rate limit
      if (email === 'tangibulislam02@gmail.com' && password === '00112299') {
        onLogin(true);
        navigate('/admin');
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const lockoutTime = Date.now() + 60000; // 1 minute lockout
        setLockoutUntil(lockoutTime);
        setError('অতিরিক্ত ভুল চেষ্টার কারণে আপনার অ্যাকাউন্ট ১ মিনিটের জন্য লক করা হয়েছে।');
      } else {
        setError(`ভুল ইউজারনেম বা পাসওয়ার্ড। আর ${5 - newAttempts} বার চেষ্টা করতে পারবেন।`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setResetLoading(true);
    setResetMessage({ type: '', text: '' });
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ type: 'success', text: 'পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে।' });
      setTimeout(() => setShowForgotModal(false), 3000);
    } catch (err: any) {
      setResetMessage({ type: 'error', text: 'ইমেইল পাঠানো সম্ভব হয়নি। অনুগ্রহ করে সঠিক ইমেইল দিন।' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center px-4">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-green-pale relative overflow-hidden">
        {lockoutUntil && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-center justify-center items-center z-10 p-8">
            <div className="space-y-4">
              <AlertCircle size={48} className="text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-red-600">অ্যাক্সেস ব্লক করা হয়েছে</h3>
              <p className="text-sm text-muted">অতিরিক্ত ভুল চেষ্টার কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে।</p>
              <div className="text-2xl font-mono font-bold text-[#1a5c38]">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-muted">অনুগ্রহ করে অপেক্ষা করুন...</p>
            </div>
          </div>
        )}

        <img 
          src={settings.logoUrl || "HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg"} 
          alt="Logo" 
          className="w-20 h-20 rounded-full border-4 border-gold mx-auto mb-8 object-cover" 
          onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/madrasah/200/200"; }}
        />
        <h2 className="text-2xl font-bold text-[#1a5c38] mb-4">প্রশাসনিক লগইন</h2>
        <p className="text-muted mb-8 text-sm">শুধুমাত্র অনুমোদিত ব্যক্তিদের জন্য।</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">ইমেইল ঠিকানা</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-4 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] transition-all" 
              placeholder="admin@example.com"
              required
              disabled={!!lockoutUntil || loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">পাসওয়ার্ড</label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-[#1a5c38] hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-4 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] transition-all" 
              placeholder="••••••••"
              required
              disabled={!!lockoutUntil || loading}
            />
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !!lockoutUntil}
            className="w-full bg-[#1a5c38] text-white p-4 rounded-xl font-bold hover:bg-[#14462b] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                <LogIn size={20} /> {t('login')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative"
          >
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <Key size={32} className="text-[#1a5c38]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a5c38]">{t('forgotPassword')}</h3>
              <p className="text-sm text-muted mt-2">আপনার ইমেইল ঠিকানা দিন, আমরা একটি রিসেট লিঙ্ক পাঠাব।</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">{t('email')}</label>
                <input 
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-bg border border-border outline-none focus:border-[#1a5c38] transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              {resetMessage.text && (
                <div className={cn(
                  "p-4 rounded-xl text-xs font-bold flex items-center gap-2",
                  resetMessage.type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {resetMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {resetMessage.text}
                </div>
              )}

              <button 
                type="submit"
                disabled={resetLoading}
                className="w-full bg-[#1a5c38] text-white p-4 rounded-xl font-bold hover:bg-[#14462b] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('send')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Footer = ({ settings }: { settings: SiteSettings }) => {
  const { t, getSetting } = useTranslation();
  return (
    <footer className="bg-[#1a5c38] text-white pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img 
              src={settings.logoUrl || "HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg"} 
              alt="Logo" 
              className="w-12 h-12 rounded-full border-2 border-gold object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/madrasah/200/200"; }}
            />
            <h3 className="font-serif text-xl font-bold text-gold-light leading-tight">
              {getSetting(settings, 'name')}
            </h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {t('footerText')}
          </p>
          <div className="flex gap-4">
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:-translate-y-1 transition-all">
              <Facebook size={20} />
            </a>
            <a href={`https://wa.me/88${bnToEn(settings.phone1)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:-translate-y-1 transition-all">
              <Phone size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-gold-light font-bold mb-6">{t('quickLinks')}</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link to="/" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('home')}</Link></li>
            <li><Link to="/academic" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('academicInfo')}</Link></li>
            <li><Link to="/admission" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('onlineAdmission')}</Link></li>
            <li><Link to="/donation" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('donation')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold-light font-bold mb-6">{t('sitemap')}</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link to="/gallery" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('gallery')}</Link></li>
            <li><Link to="/download" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('download')}</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('contact')}</Link></li>
            <li><Link to="/search" className="hover:text-gold transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t('search')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold-light font-bold mb-6">{t('donation')}</h4>
          <div className="flex items-center gap-2 mb-6">
            <p className="text-sm">বিকাশ / নগদ: <strong>{settings.phone1}</strong></p>
            <CopyButton text={settings.phone1} className="bg-white/10 text-white hover:bg-gold" />
          </div>
          <Link to="/donation" className="btn-donate px-6 py-2 rounded-lg text-sm shadow-md">
            বিস্তারিত জানুন
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-wrap justify-between items-center gap-4 text-[11px] opacity-50">
        <span>© ২০২৬ {getSetting(settings, 'name')} | {getSetting(settings, 'address')}</span>
        <span className="font-arabic text-lg">سُبْحَانَ اللّٰه 🤲</span>
      </div>
    </footer>
  );
};

// --- Main App ---

const SearchPage = ({ settings, notices, admissions }: { settings: SiteSettings, notices: Notice[], admissions: Admission[] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string, title: string, description: string, link: string }[]>([]);
  const { t } = useTranslation();

  const pages = [
    { title: t('home'), description: settings.aboutText || 'মাদ্রাসার মূল পাতা', link: '/' },
    { title: t('contact'), description: settings.address || 'আমাদের সাথে যোগাযোগের ঠিকানা ও ফোন নম্বর', link: '/contact' },
    { title: t('academic'), description: 'নাজেরা ও হিফজ বিভাগ সংক্রান্ত তথ্য', link: '/academic' },
    { title: t('other'), description: 'আবাসিক সুবিধা ও ভর্তির কাগজপত্র', link: '/other' },
    { title: t('download'), description: 'ভর্তি ফর্ম ও সিলেবাস ডাউনলোড', link: '/download' },
    { title: t('gallery'), description: 'মাদ্রাসার বিভিন্ন কার্যক্রমের ছবি', link: '/gallery' },
    { title: t('donation'), description: 'মাদ্রাসার উন্নয়নে আপনার সদকা ও দান পাঠান', link: '/donation' },
    { title: t('admission'), description: 'অনলাইন ভর্তি আবেদন ফর্ম', link: '/admission' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filteredResults: any[] = [];

    // Search Pages
    pages.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        filteredResults.push({ ...p, type: t('page') });
      }
    });

    // Search Notices
    notices.forEach(n => {
      if (n.text.toLowerCase().includes(q) || n.date.toLowerCase().includes(q)) {
        filteredResults.push({
          type: t('notice'),
          title: n.text,
          description: `${t('date')}: ${n.date}`,
          link: '/'
        });
      }
    });

    // Search Admissions
    admissions.forEach(a => {
      if (a.studentName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q) || a.mobile.includes(q)) {
        filteredResults.push({
          type: t('admissionRequest'),
          title: a.studentName,
          description: `${t('department')}: ${a.department}, ${t('mobile')}: ${a.mobile}`,
          link: '/admin'
        });
      }
    });

    setResults(filteredResults);
  }, [query, notices, admissions, settings, t]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={24} />
        <input 
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white shadow-xl border-2 border-transparent focus:border-[#1a5c38] outline-none text-xl transition-all"
        />
      </div>

      <div className="space-y-6">
        {results.length > 0 ? (
          results.map((res, i) => (
            <Link 
              key={i} 
              to={res.link}
              className="block bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold hover:-translate-y-1 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-bg px-2 py-1 rounded-md">
                  {res.type}
                </span>
                <ChevronRight size={18} className="text-muted group-hover:text-gold transition-colors" />
              </div>
              <h4 className="text-lg font-bold text-[#1a5c38] mb-1">{res.title}</h4>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted">{res.description}</p>
                {res.description.match(/০১৮|০১৭/) && (
                  <CopyButton text={res.description.match(/[০-৯-]+/)?.[0] || ''} />
                )}
              </div>
            </Link>
          ))
        ) : query ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-dashed border-border">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-muted">{t('noResults')}</h3>
            <p className="text-sm text-muted mt-2">{t('noResultsDescription')}</p>
          </div>
        ) : (
          <div className="text-center py-20 text-muted">
            <p>{t('searchDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch Settings
  const [settingsDoc] = useDocument(doc(db, 'settings', 'main'));
  const settings: SiteSettings = settingsDoc?.data() as SiteSettings || {
    name: 'হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা',
    subtitle: 'التحفيظ ও التجويد للقرآن الكريم',
    estd: '২০২২',
    address: 'তরছ পাড়া, চকরিয়া, কক্সবাজার',
    phone1: '০১৮২২-৩২৬৮৯৫',
    phone2: '০১৭৮৩-৮৬১৬১০',
    facebookUrl: 'https://www.facebook.com/profile.php?id=100089014269631',
    logoUrl: 'HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg',
    aboutText: '',
    academicNazeraText: '',
    academicHifzText: '',
    otherResidentialText: '',
    otherDocumentsText: '',
    otherSpecialText: ''
  };

  // Fetch Notices
  const [noticesSnap] = useCollection(query(collection(db, 'notices'), orderBy('createdAt', 'desc')));
  const notices = noticesSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Notice)) || [];

  // Fetch Stats
  const [statsSnap] = useCollection(query(collection(db, 'stats'), orderBy('order', 'asc')));
  const stats = statsSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Stat)) || [
    { id: '1', label: 'প্রতিষ্ঠাকাল', value: '২০২২', order: 1 },
    { id: '2', label: 'শিক্ষার্থী', value: '৫০+', order: 2 },
p-3">
            <MapPin size={18} className="text-gold-light shrink-0" />
            <span>{settings.address}</span>
          </li>
          <li className="flex gap-3">
            <Phone size={18} className="text-gold-light shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>{settings.phone1}</span>
                <CopyButton text={settings.phone1} className="bg-white/10 text-white hover:bg-gold" />
              </div>
              <div className="flex items-center gap-2">
                <span>{settings.phone2}</span>
                <CopyButton text={settings.phone2} className="bg-white/10 text-white hover:bg-gold" />
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-gold-light font-bold mb-6">💚 দান করুন  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col">
            <TopBar settings={settings} />
            <Header settings={settings} />
            <Marquee notices={notices.length > 0 ? notices : [{ id: '1', text: '২০২৬ শিক্ষাবর্ষে ভর্তি চলছে!', date: '', isNew: true, createdAt: '' }]} />
            <Nav isAdmin={isAdmin} settings={settings} onLogout={handleAdminLogout} />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home settings={settings} notices={notices} stats={stats} />} />
                <Route path="/search" element={<SearchPage settings={settings} notices={notices} admissions={admissions} />} />
                <Route path="/admission" element={<AdmissionPage settings={settings} />} />
                <Route path="/login" element={<LoginPage settings={settings} onLogin={handleAdminLogin} />} />
                <Route path="/admin" element={isAdmin ? <AdminDashboard settings={settings} notices={notices} stats={stats} staff={staff} admissions={admissions} messages={messages} onLogout={handleAdminLogout} /> : <LoginPage settings={settings} onLogin={handleAdminLogin} />} />
                <Route path="/contact" element={<ContactPage settings={settings} />} />
                <Route path="/donation" element={<DonationPage settings={settings} />} />
                <Route path="/academic" element={<div className="max-w-7xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">একাডেমিক তথ্য</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                      <h3 className="text-xl font-bold text-[#1a5c38] mb-4">📖 নাজেরা বিভাগ</h3>
                      <div className="text-muted whitespace-pre-line">
                        {settings.academicNazeraText || `• কুরআন নাজেরা পাঠ\n• সহিহ তিলাওয়াত ও তাজবিদ\n• মাখরাজ শিক্ষা\n• ইসলামী আদব`}
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                      <h3 className="text-xl font-bold text-[#1a5c38] mb-4">🎓 হিফজ বিভাগ</h3>
                      <div className="text-muted whitespace-pre-line">
                        {settings.academicHifzText || `• সম্পূর্ণ কুরআন হিফজ\n• অভিজ্ঞ হাফেজ উস্তাদ\n• নিয়মিত দোর ও মুশাহারা\n• সার্টিফিকেট প্রদান`}
                      </div>
                    </div>
                  </div>
                </div>} />
                <Route path="/other" element={<div className="max-w-7xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">অন্যান্য তথ্য</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                      <h3 className="font-bold text-[#1a5c38] mb-4">🏠 আবাসিক সুবিধা</h3>
                      <p className="text-sm text-muted">{settings.otherResidentialText || 'নিরাপদ আবাসন, সুষম খাদ্য এবং সার্বক্ষণিক তত্ত্বাবধান।'}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                      <h3 className="font-bold text-[#1a5c38] mb-4">📜 ভর্তির কাগজপত্র</h3>
                      <p className="text-sm text-muted">{settings.otherDocumentsText || 'জন্ম নিবন্ধন, পিতার NID কপি এবং ছবি ২ কপি।'}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                      <h3 className="font-bold text-[#1a5c38] mb-4">🌟 বিশেষ সুবিধা</h3>
                      <p className="text-sm text-muted">{settings.otherSpecialText || 'মেধাবীদের বৃত্তি, দরিদ্রদের ছাড় এবং ইয়াতিম শিশু বিনামূল্যে।'}</p>
                    </div>
                  </div>
                </div>} />
                <Route path="/download" element={<div className="max-w-7xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-bold text-[#1a5c38] mb-4 text-center">ডাউনলোড সেন্টার</h2>
                  <p className="text-muted text-center mb-12 max-w-2xl mx-auto">মাদ্রাসার প্রয়োজনীয় ফরম, সিলেবাস এবং অন্যান্য গুরুত্বপূর্ণ নথিপত্র এখান থেকে ডাউনলোড করুন।</p>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: 'ভর্তি ফরম ২০২৬', desc: 'নতুন শিক্ষার্থীদের জন্য ভর্তির আবেদন ফরম।', icon: UserPlus, color: 'bg-blue-50 text-blue-600' },
                      { title: 'মাদ্রাসা প্রসপেক্টাস', desc: 'মাদ্রাসার পরিচিতি, লক্ষ্য ও উদ্দেশ্য সম্বলিত পুস্তিকা।', icon: BookOpen, color: 'bg-green-50 text-green-600' },
                      { title: 'নাজেরা সিলেবাস', desc: 'নাজেরা বিভাগের পূর্ণাঙ্গ পাঠ্যসূচি।', icon: CheckCircle2, color: 'bg-gold-light/20 text-gold' },
                      { title: 'হিফজ সিলেবাস', desc: 'হিফজ বিভাগের পূর্ণাঙ্গ পাঠ্যসূচি ও গাইডলাইন।', icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
                      { title: 'একাডেমিক ক্যালেন্ডার', desc: '২০২৬ শিক্ষাবর্ষের ছুটির তালিকা ও কার্যক্রম।', icon: Clock, color: 'bg-orange-50 text-orange-600' },
                      { title: 'অভিভাবক গাইডলাইন', desc: 'মাদ্রাসার নিয়ম-কানুন ও অভিভাবকদের করণীয়।', icon: Info, color: 'bg-red-50 text-red-600' },
                    ].map((doc, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl shadow-xl border border-border hover:border-gold transition-all group">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", doc.color)}>
                          <doc.icon size={24} />
                        </div>
                        <h3 className="font-bold text-[#1a5c38] mb-2">{doc.title}</h3>
                        <p className="text-xs text-muted mb-6">{doc.desc}</p>
                        <button 
                          onClick={() => alert('ডাউনলোড শুরু হচ্ছে...')}
                          className="w-full py-3 rounded-xl border-2 border-green-pale text-[#1a5c38] font-bold text-sm hover:bg-[#1a5c38] hover:text-white hover:border-[#1a5c38] transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> ডাউনলোড (PDF)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>} />
                <Route path="/gallery" element={<div className="max-w-7xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">গ্যালারি</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="aspect-square bg-green-pale rounded-2xl overflow-hidden shadow-md group relative">
                        <img src={`https://picsum.photos/seed/madrasah-${i}/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          মাদ্রাসা কার্যক্রম
                        </div>
                      </div>
                    ))}
                  </div>
                </div>} />
              </Routes>
            </main>

            <Footer settings={settings} />
            <Chatbot madrasahInfo={madrasahInfoContext} settings={settings} />
          </div>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
��ষার্থী', value: '৫০+', order: 2 },
    { id: '3', label: 'বিভাগ', value: '২', order: 3 },
    { id: '4', label: 'হাফেজ তৈরি', value: '১০+', order: 4 },
  ];

  // Fetch Staff
  const [staffSnap] = useCollection(collection(db, 'staff'));
  const staff = staffSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Staff)) || [];

  // Fetch Admissions
  const [admissionsSnap] = useCollection(query(collection(db, 'admissions'), orderBy('createdAt', 'desc')));
  const admissions = admissionsSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Admission)) || [];

  // Fetch Messages
  const [messagesSnap] = useCollection(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
  const messages = messagesSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Message)) || [];

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'settings', 'main'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const savedAdmin = localStorage.getItem('isAdmin');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = (status: boolean) => {
    setIsAdmin(status);
    if (status) {
      localStorage.setItem('isAdmin', 'true');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  const madrasahInfoContext = `
    Name: ${settings.name}
    Subtitle: ${settings.subtitle}
    Established: ${settings.estd}
    Address: ${settings.address}
    Phone 1: ${settings.phone1}
    Phone 2: ${settings.phone2}
    Facebook: ${settings.facebookUrl}
    WhatsApp: https://wa.me/88${bnToEn(settings.phone1)}
    Facebook Information: Our Facebook page contains the latest updates, event photos, and announcements. If someone asks about recent posts or photos, tell them to check our Facebook page for the most up-to-date information.
    Current Notices: ${notices.map(n => n.text).join(', ')}
    Stats: ${stats.map(s => `${s.label}: ${s.value}`).join(', ')}
    Departments: নাজেরা বিভাগ, হিফজ বিভাগ
    Facilities: আবাসিক ও অনাবাসিক সুবিধা আছে। ইয়াতিম ও দরিদ্র শিক্ষার্থীদের জন্য বিশেষ ছাড় ও খাবারের ব্যবস্থা আছে।
  `;

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col">
          <TopBar settings={settings} />
          <Header settings={settings} />
          <Marquee notices={notices.length > 0 ? notices : [{ id: '1', text: '২০২৬ শিক্ষাবর্ষে ভর্তি চলছে!', date: '', isNew: true, createdAt: '' }]} />
          <Nav isAdmin={isAdmin} settings={settings} onLogout={handleAdminLogout} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home settings={settings} notices={notices} stats={stats} />} />
              <Route path="/search" element={<SearchPage settings={settings} notices={notices} admissions={admissions} />} />
              <Route path="/admission" element={<AdmissionPage settings={settings} />} />
              <Route path="/login" element={<LoginPage settings={settings} onLogin={handleAdminLogin} />} />
              <Route path="/admin" element={isAdmin ? <AdminDashboard settings={settings} notices={notices} stats={stats} staff={staff} admissions={admissions} messages={messages} onLogout={handleAdminLogout} /> : <LoginPage settings={settings} onLogin={handleAdminLogin} />} />
              <Route path="/contact" element={<ContactPage settings={settings} />} />
              <Route path="/donation" element={<DonationPage settings={settings} />} />
              <Route path="/academic" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">একাডেমিক তথ্য</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                    <h3 className="text-xl font-bold text-[#1a5c38] mb-4">📖 নাজেরা বিভাগ</h3>
                    <div className="text-muted whitespace-pre-line">
                      {settings.academicNazeraText || `• কুরআন নাজেরা পাঠ\n• সহিহ তিলাওয়াত ও তাজবিদ\n• মাখরাজ শিক্ষা\n• ইসলামী আদব`}
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                    <h3 className="text-xl font-bold text-[#1a5c38] mb-4">🎓 হিফজ বিভাগ</h3>
                    <div className="text-muted whitespace-pre-line">
                      {settings.academicHifzText || `• সম্পূর্ণ কুরআন হিফজ\n• অভিজ্ঞ হাফেজ উস্তাদ\n• নিয়মিত দোর ও মুশাহারা\n• সার্টিফিকেট প্রদান`}
                    </div>
                  </div>
                </div>
              </div>} />
              <Route path="/other" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">অন্যান্য তথ্য</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">🏠 আবাসিক সুবিধা</h3>
                    <p className="text-sm text-muted">{settings.otherResidentialText || 'নিরাপদ আবাসন, সুষম খাদ্য এবং সার্বক্ষণিক তত্ত্বাবধান।'}</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">📜 ভর্তির কাগজপত্র</h3>
                    <p className="text-sm text-muted">{settings.otherDocumentsText || 'জন্ম নিবন্ধন, পিতার NID কপি এবং ছবি ২ কপি।'}</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">🌟 বিশেষ সুবিধা</h3>
                    <p className="text-sm text-muted">{settings.otherSpecialText || 'মেধাবীদের বৃত্তি, দরিদ্রদের ছাড় এবং ইয়াতিম শিশু বিনামূল্যে।'}</p>
                  </div>
                </div>
              </div>} />
              <Route path="/download" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-4 text-center">ডাউনলোড সেন্টার</h2>
                <p className="text-muted text-center mb-12 max-w-2xl mx-auto">মাদ্রাসার প্রয়োজনীয় ফরম, সিলেবাস এবং অন্যান্য গুরুত্বপূর্ণ নথিপত্র এখান থেকে ডাউনলোড করুন।</p>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'ভর্তি ফরম ২০২৬', desc: 'নতুন শিক্ষার্থীদের জন্য ভর্তির আবেদন ফরম।', icon: UserPlus, color: 'bg-blue-50 text-blue-600' },
                    { title: 'মাদ্রাসা প্রসপেক্টাস', desc: 'মাদ্রাসার পরিচিতি, লক্ষ্য ও উদ্দেশ্য সম্বলিত পুস্তিকা।', icon: BookOpen, color: 'bg-green-50 text-green-600' },
                    { title: 'নাজেরা সিলেবাস', desc: 'নাজেরা বিভাগের পূর্ণাঙ্গ পাঠ্যসূচি।', icon: CheckCircle2, color: 'bg-gold-light/20 text-gold' },
                    { title: 'হিফজ সিলেবাস', desc: 'হিফজ বিভাগের পূর্ণাঙ্গ পাঠ্যসূচি ও গাইডলাইন।', icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
                    { title: 'একাডেমিক ক্যালেন্ডার', desc: '২০২৬ শিক্ষাবর্ষের ছুটির তালিকা ও কার্যক্রম।', icon: Clock, color: 'bg-orange-50 text-orange-600' },
                    { title: 'অভিভাবক গাইডলাইন', desc: 'মাদ্রাসার নিয়ম-কানুন ও অভিভাবকদের করণীয়।', icon: Info, color: 'bg-red-50 text-red-600' },
                  ].map((doc, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-xl border border-border hover:border-gold transition-all group">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", doc.color)}>
                        <doc.icon size={24} />
                      </div>
                      <h3 className="font-bold text-[#1a5c38] mb-2">{doc.title}</h3>
                      <p className="text-xs text-muted mb-6">{doc.desc}</p>
                      <button 
                        onClick={() => alert('ডাউনলোড শুরু হচ্ছে...')}
                        className="w-full py-3 rounded-xl border-2 border-green-pale text-[#1a5c38] font-bold text-sm hover:bg-[#1a5c38] hover:text-white hover:border-[#1a5c38] transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={16} /> ডাউনলোড (PDF)
                      </button>
                    </div>
                  ))}
                </div>
              </div>} />
              <Route path="/gallery" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">গ্যালারি</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="aspect-square bg-green-pale rounded-2xl overflow-hidden shadow-md group relative">
                      <img src={`https://picsum.photos/seed/madrasah-${i}/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        মাদ্রাসা কার্যক্রম
                      </div>
                    </div>
                  ))}
                </div>
              </div>} />
            </Routes>
          </main>

          <Footer settings={settings} />
          <Chatbot madrasahInfo={madrasahInfoContext} settings={settings} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
