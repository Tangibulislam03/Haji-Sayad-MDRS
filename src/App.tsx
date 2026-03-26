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
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
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
import { getAuth, onAuthStateChanged, signOut, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { getDocFromServer } from 'firebase/firestore';
import { db, auth } from './firebase';
import { cn } from './lib/utils';
import Chatbot from './components/Chatbot';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface SiteSettings {
  name: string;
  subtitle: string;
  estd: string;
  address: string;
  phone1: string;
  phone2: string;
  facebookUrl: string;
  logoUrl: string;
}

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

// --- Components ---

const TopBar = ({ settings }: { settings: SiteSettings }) => (
  <div className="bg-[#1a5c38] text-white text-[0.82rem] py-2 px-4">
    <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-gold-light" />
        <span>{settings.address}</span>
      </div>
      <div className="flex items-center gap-4">
        <a href={`tel:${settings.phone1}`} className="flex items-center gap-1 hover:text-gold-light transition-colors">
          <Phone size={14} /> {settings.phone1}
        </a>
        <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-gold-light transition-colors">
          <Facebook size={14} /> Facebook
        </a>
      </div>
    </div>
  </div>
);

const Header = ({ settings }: { settings: SiteSettings }) => (
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
          {settings.name}
        </h1>
        <div className="text-white/90 text-sm sm:text-base mt-2 font-arabic">{settings.subtitle}</div>
        <div className="text-gold-light text-sm font-semibold mt-2">
          ✦ প্রতিষ্ঠাকাল: {settings.estd} ✦ {settings.address} ✦
        </div>
      </div>
    </div>
  </header>
);

const Marquee = ({ notices }: { notices: Notice[] }) => (
  <div className="marquee-bar">
    <div className="marquee-inner">
      {notices.map((n, i) => (
        <span key={i} className="px-12">
          {n.isNew && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full mr-2">নতুন</span>}
          {n.text}
        </span>
      ))}
      {/* Duplicate for seamless loop */}
      {notices.map((n, i) => (
        <span key={`dup-${i}`} className="px-12">
          {n.isNew && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full mr-2">নতুন</span>}
          {n.text}
        </span>
      ))}
    </div>
  </div>
);

const Nav = ({ isAdmin }: { isAdmin: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: '/', label: 'হোম', icon: HomeIcon },
    { to: '/contact', label: 'যোগাযোগ', icon: Phone },
    { to: '/academic', label: 'একাডেমিক', icon: BookOpen },
    { to: '/other', label: 'অন্যান্য', icon: Info },
    { to: '/download', label: 'ডাউনলোড', icon: Download },
    { to: '/gallery', label: 'গ্যালারি', icon: GalleryIcon },
  ];

  return (
    <nav className="bg-white border-b-3 border-gold sticky top-0 z-[200] shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-gold object-cover" />
            <div className="hidden sm:block">
              <div className="font-serif text-xs font-bold text-[#1a5c38]">হাজ্বী ছৈয়দ আহমদ (রহ:)</div>
              <div className="text-[10px] text-muted">মাদ্রাসা কমপ্লেক্স • চকরিয়া</div>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-4 py-5 text-sm font-semibold transition-all border-b-3 border-transparent",
                  location.pathname === link.to ? "text-gold border-gold bg-green-pale" : "text-[#1a5c38] hover:text-gold hover:bg-green-pale"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/donation" className="btn-donate px-4 py-2 rounded-lg text-sm hidden sm:flex items-center gap-2">
            <Heart size={16} /> দান করুন
          </Link>
          <Link to="/admission" className="bg-[#1a5c38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2d8653] transition-all hidden sm:flex items-center gap-2">
            <UserPlus size={16} /> ভর্তি
          </Link>
          {isAdmin && (
            <Link to="/admin" className="p-2 text-[#1a5c38] hover:bg-green-pale rounded-full transition-all">
              <AdminIcon size={20} />
            </Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-[#1a5c38]">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-sm font-semibold",
                    location.pathname === link.to ? "bg-green-pale text-gold" : "text-[#1a5c38] hover:bg-green-pale"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link to="/donation" onClick={() => setIsOpen(false)} className="btn-donate p-3 rounded-lg text-xs flex items-center justify-center gap-2">
                  <Heart size={14} /> দান করুন
                </Link>
                <Link to="/admission" onClick={() => setIsOpen(false)} className="bg-[#1a5c38] text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                  <UserPlus size={14} /> ভর্তি
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const DonationPage = ({ settings }: { settings: SiteSettings }) => {
  const copyNum = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, ''));
    alert('নম্বর কপি হয়েছে!');
  };

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
                <button onClick={() => copyNum(method.num)} className="text-[#1a5c38] font-bold text-sm hover:underline">কপি</button>
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
              `নম্বর দিন: ${settings.phone1}`,
              'পরিমাণ লিখে রেফারেন্সে "DONATION" দিন।',
              'পিন দিয়ে কনফার্ম করুন।',
              'স্ক্রিনশট তুলে WhatsApp করুন: ০১৮২২-৩২৬৮৯৫'
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
              className="bg-white p-6 rounded-2xl shadow-xl text-center hover:-translate-y-1 transition-all border-b-4 border-border hover:border-gold group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="font-bold text-xs text-[#1a5c38]">{item.label}</div>
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-[#1a5c38] text-white p-4 font-bold flex items-center gap-2">
                <CheckCircle2 size={18} /> সর্বশেষ নোটিশ
              </div>
              <div className="divide-y divide-border">
                {notices.length > 0 ? notices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-green-pale transition-colors flex gap-4">
                    <div className="text-gold font-bold text-xs whitespace-nowrap pt-1 w-24">
                      {notice.date}
                    </div>
                    <div className="text-sm flex-1">
                      {notice.text}
                      {notice.isNew && <span className="ml-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">নতুন</span>}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted">কোনো নোটিশ নেই</div>
                )}
              </div>
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
              <img src="HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg" alt="Logo" className="w-20 h-20 rounded-full border-4 border-gold mx-auto mb-6 object-cover" />
              <p className="text-text leading-relaxed mb-6">
                {settings.name} কক্সবাজারের চকরিয়া পৌরসভার তরছ পাড়ায় অবস্থিত একটি দ্বীনি শিক্ষা প্রতিষ্ঠান।
              </p>
              <ul className="text-left space-y-3 mb-8">
                {['অভিজ্ঞ শিক্ষকমণ্ডলী', 'নাজেরা ও হিফজ বিভাগ', 'নিরাপদ ইসলামী পরিবেশ', 'নিয়মিত পরীক্ষা ও মূল্যায়ন'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-gold">✦</span> {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Link to="/donation" className="flex-1 bg-[#1a5c38] text-white py-3 rounded-xl font-bold hover:bg-[#2d8653] transition-all">
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

const AdmissionPage = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    department: 'নাজেরা বিভাগ',
    type: 'আবাসিক',
    fatherName: '',
    mobile: '',
    address: ''
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
      setStatus('success');
      setFormData({ studentName: '', dob: '', department: 'নাজেরা বিভাগ', type: 'আবাসিক', fatherName: '', mobile: '', address: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-[#1a5c38] mb-4">✍️ অনলাইন ভর্তি আবেদন — ২০২৬</h2>
        <p className="text-muted">নিচের ফর্মটি পূরণ করুন। আমরা আপনার সাথে যোগাযোগ করব।</p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-green-pale">
        {status === 'success' ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-green-pale text-[#1a5c38] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[#1a5c38]">আবেদন জমা হয়েছে!</h3>
            <p className="text-muted">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ইনশাআল্লাহ।</p>
            <button onClick={() => setStatus('idle')} className="text-gold font-bold hover:underline">আরেকটি আবেদন করুন</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">শিক্ষার্থীর নাম *</label>
                <input required type="text" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all" placeholder="পূর্ণ নাম" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">জন্ম তারিখ *</label>
                <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">বিভাগ *</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all">
                  <option>নাজেরা বিভাগ</option>
                  <option>হিফজ বিভাগ</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">ধরন *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all">
                  <option>আবাসিক</option>
                  <option>অনাবাসিক</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">পিতার নাম *</label>
                <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all" placeholder="পিতার নাম" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a5c38]">মোবাইল *</label>
                <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all" placeholder="০১৮XX-XXXXXX" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1a5c38]">ঠিকানা *</label>
              <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 rounded-xl bg-bg border-1.5 border-border focus:border-[#1a5c38] outline-none transition-all" placeholder="গ্রাম, উপজেলা, জেলা..." />
            </div>

            <button 
              disabled={status === 'loading'}
              type="submit" 
              className="w-full bg-[#1a5c38] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2d8653] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? 'প্রক্রিয়াকরণ হচ্ছে...' : '📨 আবেদন জমা দিন'}
            </button>
            {status === 'error' && <p className="text-red-600 text-center text-sm">দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>}
          </form>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ settings, notices, stats, staff, admissions }: { settings: SiteSettings, notices: Notice[], stats: Stat[], staff: Staff[], admissions: Admission[] }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'notices' | 'stats' | 'staff' | 'admissions'>('settings');
  const [editSettings, setEditSettings] = useState(settings);
  const [newNotice, setNewNotice] = useState({ text: '', date: '', isNew: true });
  const [newStat, setNewStat] = useState({ label: '', value: '', order: 0 });
  const [newStaff, setNewStaff] = useState({ name: '', role: '', contact: '', type: 'teacher' as const });

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
        <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all">
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
            <h3 className="text-2xl font-bold text-[#1a5c38] mb-8">ভর্তি আবেদন তালিকা</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-green-pale text-[#1a5c38]">
                  <tr>
                    <th className="p-4">নাম</th>
                    <th className="p-4">বিভাগ</th>
                    <th className="p-4">পিতা</th>
                    <th className="p-4">মোবাইল</th>
                    <th className="p-4">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admissions.map(a => (
                    <tr key={a.id} className="hover:bg-bg">
                      <td className="p-4 font-bold">{a.studentName}</td>
                      <td className="p-4">{a.department} ({a.type})</td>
                      <td className="p-4">{a.fatherName}</td>
                      <td className="p-4">{a.mobile}</td>
                      <td className="p-4">
                        <button onClick={() => deleteItem('admissions', a.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Similar sections for Stats and Staff... */}
      </main>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/admin');
    } catch (err) { alert('Login failed'); }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center px-4">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-green-pale">
        <img src="HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg" alt="Logo" className="w-20 h-20 rounded-full border-4 border-gold mx-auto mb-8 object-cover" />
        <h2 className="text-2xl font-bold text-[#1a5c38] mb-4">প্রশাসনিক লগইন</h2>
        <p className="text-muted mb-8 text-sm">শুধুমাত্র অনুমোদিত ব্যক্তিদের জন্য।</p>
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border p-4 rounded-xl font-bold hover:bg-bg transition-all"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Google দিয়ে লগইন করুন
        </button>
      </div>
    </div>
  );
};

const Footer = ({ settings }: { settings: SiteSettings }) => (
  <footer className="bg-[#0d3d22] text-white/70 py-16 px-4 mt-24">
    <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <img src="HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg" alt="Logo" className="w-14 h-14 rounded-full border-2 border-gold object-cover" />
          <h4 className="font-serif text-gold-light font-bold leading-tight">{settings.name}</h4>
        </div>
        <p className="text-sm leading-relaxed">২০২২ সাল থেকে চকরিয়া, কক্সবাজারে কুরআনের আলো ছড়িয়ে আসছে।</p>
        <div className="flex gap-3">
          <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-all">
            <Facebook size={18} />
          </a>
        </div>
      </div>
      <div>
        <h4 className="font-serif text-gold-light font-bold mb-6">🔗 দ্রুত লিংক</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="/" className="hover:text-gold-light transition-colors">হোম</Link></li>
          <li><Link to="/admission" className="hover:text-gold-light transition-colors">অনলাইন ভর্তি</Link></li>
          <li><Link to="/donation" className="hover:text-gold-light transition-colors">💚 দান করুন</Link></li>
          <li><Link to="/academic" className="hover:text-gold-light transition-colors">একাডেমিক</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-gold-light font-bold mb-6">📞 যোগাযোগ</h4>
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin size={18} className="text-gold-light shrink-0" />
            <span>{settings.address}</span>
          </li>
          <li className="flex gap-3">
            <Phone size={18} className="text-gold-light shrink-0" />
            <div>
              <div>{settings.phone1}</div>
              <div>{settings.phone2}</div>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-gold-light font-bold mb-6">💚 দান করুন</h4>
        <p className="text-sm mb-6">বিকাশ / নগদ: <strong>{settings.phone1}</strong></p>
        <Link to="/donation" className="inline-block bg-gold text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#b8891f] transition-all">
          বিস্তারিত জানুন
        </Link>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-wrap justify-between items-center gap-4 text-[11px] opacity-50">
      <span>© ২০২৬ {settings.name} | চকরিয়া, কক্সবাজার</span>
      <span className="font-arabic text-lg">سُبْحَانَ اللّٰه 🤲</span>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch Settings
  const [settingsDoc] = useDocument(doc(db, 'settings', 'main'));
  const settings: SiteSettings = settingsDoc?.data() as SiteSettings || {
    name: 'হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স',
    subtitle: 'দার التحفيظ ও التجويد للقرآن الكريم',
    estd: '২০২২',
    address: 'তরছ পাড়া, চকরিয়া, কক্সবাজার',
    phone1: '০১৮২২-৩২৬৮৯৫',
    phone2: '০১৭৮৩-৮৬১৬১০',
    facebookUrl: 'https://www.facebook.com/profile.php?id=100089014269631',
    logoUrl: 'HAJI_SAYED_AHMAD__RH___MADRASAH__LOGO.jpg'
  };

  // Fetch Notices
  const [noticesSnap] = useCollection(query(collection(db, 'notices'), orderBy('createdAt', 'desc')));
  const notices = noticesSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Notice)) || [];

  // Fetch Stats
  const [statsSnap] = useCollection(query(collection(db, 'stats'), orderBy('order', 'asc')));
  const stats = statsSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Stat)) || [
    { id: '1', label: 'প্রতিষ্ঠাকাল', value: '২০২২', order: 1 },
    { id: '2', label: 'শিক্ষার্থী', value: '৫০+', order: 2 },
    { id: '3', label: 'বিভাগ', value: '২', order: 3 },
    { id: '4', label: 'হাফেজ তৈরি', value: '১০+', order: 4 },
  ];

  // Fetch Staff
  const [staffSnap] = useCollection(collection(db, 'staff'));
  const staff = staffSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Staff)) || [];

  // Fetch Admissions
  const [admissionsSnap] = useCollection(query(collection(db, 'admissions'), orderBy('createdAt', 'desc')));
  const admissions = admissionsSnap?.docs.map(d => ({ id: d.id, ...d.data() } as Admission)) || [];

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

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email === 'tangibulislam02@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  const madrasahInfoContext = `
    Name: ${settings.name}
    Subtitle: ${settings.subtitle}
    Established: ${settings.estd}
    Address: ${settings.address}
    Phone 1: ${settings.phone1}
    Phone 2: ${settings.phone2}
    Facebook: ${settings.facebookUrl}
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
          <Nav isAdmin={isAdmin} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home settings={settings} notices={notices} stats={stats} />} />
              <Route path="/admission" element={<AdmissionPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={isAdmin ? <AdminDashboard settings={settings} notices={notices} stats={stats} staff={staff} admissions={admissions} /> : <LoginPage />} />
              <Route path="/contact" element={<div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                <h2 className="text-3xl font-bold text-[#1a5c38]">যোগাযোগ করুন</h2>
                <p className="text-muted">তরছ পাড়া, ১নং ওয়ার্ড, চকরিয়া পৌরসভা, কক্সবাজার</p>
                <div className="flex flex-col gap-2 font-bold text-xl">
                  <a href={`tel:${settings.phone1}`} className="text-[#1a5c38]">{settings.phone1}</a>
                  <a href={`tel:${settings.phone2}`} className="text-[#1a5c38]">{settings.phone2}</a>
                </div>
              </div>} />
              <Route path="/donation" element={<DonationPage settings={settings} />} />
              <Route path="/academic" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">একাডেমিক তথ্য</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                    <h3 className="text-xl font-bold text-[#1a5c38] mb-4">📖 নাজেরা বিভাগ</h3>
                    <ul className="space-y-2 text-muted">
                      <li>• কুরআন নাজেরা পাঠ</li>
                      <li>• সহিহ তিলাওয়াত ও তাজবিদ</li>
                      <li>• মাখরাজ শিক্ষা</li>
                      <li>• ইসলামী আদব</li>
                    </ul>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                    <h3 className="text-xl font-bold text-[#1a5c38] mb-4">🎓 হিফজ বিভাগ</h3>
                    <ul className="space-y-2 text-muted">
                      <li>• সম্পূর্ণ কুরআন হিফজ</li>
                      <li>• অভিজ্ঞ হাফেজ উস্তাদ</li>
                      <li>• নিয়মিত দোর ও মুশাহারা</li>
                      <li>• সার্টিফিকেট প্রদান</li>
                    </ul>
                  </div>
                </div>
              </div>} />
              <Route path="/other" element={<div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-8 text-center">অন্যান্য তথ্য</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">🏠 আবাসিক সুবিধা</h3>
                    <p className="text-sm text-muted">নিরাপদ আবাসন, সুষম খাদ্য এবং সার্বক্ষণিক তত্ত্বাবধান।</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">📜 ভর্তির কাগজপত্র</h3>
                    <p className="text-sm text-muted">জন্ম নিবন্ধন, পিতার NID কপি এবং ছবি ২ কপি।</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-[#1a5c38]">
                    <h3 className="font-bold text-[#1a5c38] mb-4">🌟 বিশেষ সুবিধা</h3>
                    <p className="text-sm text-muted">মেধাবীদের বৃত্তি, দরিদ্রদের ছাড় এবং ইয়াতিম শিশু বিনামূল্যে।</p>
                  </div>
                </div>
              </div>} />
              <Route path="/download" element={<div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold text-[#1a5c38] mb-4">ডাউনলোড</h2>
                <div className="bg-green-pale p-8 rounded-3xl border border-border inline-block">
                  <p className="text-muted">শীঘ্রই ভর্তি ফর্ম এবং সিলেবাস এখানে পাওয়া যাবে।</p>
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
          <Chatbot madrasahInfo={madrasahInfoContext} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
