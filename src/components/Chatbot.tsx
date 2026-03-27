import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Facebook } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  text: string;
  isBot: boolean;
  time: string;
}

interface ChatbotProps {
  madrasahInfo: string;
  settings: {
    facebookUrl: string;
    phone1: string;
  };
}

const bnToEn = (str: string) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.split('').map(c => {
    const i = bn.indexOf(c);
    return i !== -1 ? en[i] : c;
  }).join('').replace(/[^0-9]/g, '');
};

export default function Chatbot({ madrasahInfo, settings }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'আসসালামু আলাইকুম! 🌙 হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসায় স্বাগতম। আমি কীভাবে সাহায্য করতে পারি? (Assalamu Alaikum! Welcome to Haji Sayed Ahmad (Rh.) Madrasah. How can I help you? | السلام عليكم! مرحبًا بكم في مدرسة الحاج سيد أحمد. كيف يمكنني مساعدتك؟)',
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const whatsappLink = `https://wa.me/88${bnToEn(settings.phone1)}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      text: input,
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const botResponse = await getChatResponse(input, madrasahInfo);
      const botMsg = {
        text: botResponse || 'দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে সরাসরি যোগাযোগ করুন।',
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    'ভর্তি তথ্য',
    'ফি কত?',
    'দান করতে চাই',
    'ঠিকানা কোথায়?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[550px] border border-green-pale"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a5c38] to-[#2d8653] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl border-2 border-white/40">
                  🕌
                </div>
                <div>
                  <div className="font-bold text-sm">মাদ্রাসা সহায়তা</div>
                  <div className="text-[10px] opacity-90 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    অনলাইন আছি
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-gold-light transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Social Shortcuts */}
            <div className="bg-green-pale/30 p-2 flex gap-2 border-b border-border">
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-1.5 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                <Facebook size={12} /> Facebook
              </a>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-1.5 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9fbf9] min-h-[250px]">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col max-w-[85%]", msg.isBot ? "self-start" : "self-end")}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.isBot 
                      ? "bg-white border border-border text-text rounded-tl-none shadow-sm" 
                      : "bg-[#1a5c38] text-white rounded-tr-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {isTyping && (
                <div className="self-start bg-white border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="p-3 bg-white border-t border-border flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setInput(reply)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-green-pale text-[#1a5c38] border border-border hover:bg-[#1a5c38] hover:text-white transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-border flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-bg border-1.5 border-border rounded-full px-4 py-2 text-sm outline-none focus:border-[#1a5c38] transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-[#1a5c38] text-white flex items-center justify-center hover:bg-[#2d8653] transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-[#1a5c38] text-white shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95",
          isOpen ? "bg-[#2d8653]" : "animate-bounce"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
