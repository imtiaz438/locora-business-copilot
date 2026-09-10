import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  ArrowRight,
  Linkedin,
  Facebook,
} from 'lucide-react';

interface QuickChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ContactView: React.FC = () => {
  const { setActiveTab } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: 'demo',
    budget: '1k-5k',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick AI Copilot Drawer State (No Login Required)
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<QuickChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! I'm Locora's Live AI Business Copilot. How can I assist you today? Ask me anything about our automated proposals, local SEO tools, client CRM, or pricing plans!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isQuickChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isQuickChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fallbackId = `LOC-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.ticketId) {
        setTicketId(data.ticketId);
      } else {
        setTicketId(fallbackId);
      }
    } catch (err) {
      console.error('Failed to submit contact query:', err);
      setTicketId(fallbackId);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleStartCopilotChat = () => {
    setIsQuickChatOpen(true);
  };

  const handleSendQuickChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || isAiTyping) return;

    const userMsg: QuickChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    if (!customText) setChatInput('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          businessProfile: {
            name: 'Visitor / Potential Client',
            industry: 'Local Services / Marketing Agency',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            sender: 'assistant',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('API response invalid');
      }
    } catch (err) {
      console.error('Quick AI Chat error:', err);
      // Smart Fallback Assistant Answer
      let fallbackAnswer = "Locora AI helps local service businesses and agencies automate proposals, generate SEO strategies, manage client CRMs, and issue professional invoices in minutes. Would you like to test our free 25 copilot credits or book a 15-minute VIP demo?";
      if (textToSend.toLowerCase().includes('price') || textToSend.toLowerCase().includes('cost')) {
        fallbackAnswer = "Our plans start with a Free Explorer tier, Pro Growth at $29/mo (or $249/yr billed annually), and Agency Elite at $99/mo (or $790/yr billed annually). You can test Locora AI risk-free!";
      } else if (textToSend.toLowerCase().includes('feature') || textToSend.toLowerCase().includes('seo')) {
        fallbackAnswer = "Locora includes 6 core OS modules: AI Document Generator, Proposal & Contract Builder, Local SEO & Google Business Optimization, Client CRM, Invoice Engine, and Marketing Planner.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'assistant',
          text: fallbackAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="space-y-16 py-12 px-6 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
          <Mail className="w-4 h-4 text-[#059669]" />
          <span>We'd Love to Hear From You</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
          Get in Touch with Locora AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          Have questions about our AI Copilot, custom agency workflows, or enterprise tier features? Our growth team responds within 2 business hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold font-heading text-slate-900">Direct Communication Channels</h2>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <Mail className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Email Support & Sales</p>
                  <a href="mailto:support@locoraai.com" className="text-[#059669] hover:underline text-[11px] font-semibold block">
                    support@locoraai.com
                  </a>
                  <p className="text-[10px] text-slate-500 pt-0.5">Avg Response: &lt; 2 Hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Phone Support (US Toll Free)</p>
                  <a href="tel:+1 (571) 706-2446" className="text-indigo-600 hover:underline text-[11px] font-semibold block">
                    +1 (571) 706-2446
                  </a>
                  <p className="text-[10px] text-slate-500 pt-0.5">Mon - Fri • 8am - 8pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Locora AI Headquarters</p>
                  <p className="text-slate-600 text-[11px]">100 Innovation Way, Suite 400</p>
                  <p className="text-slate-600 text-[11px]">San Francisco, CA 94105, United States</p>
                </div>
              </div>

              {/* Social Channels */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-900 mb-2">Follow Our Official Channels</p>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.linkedin.com/company/locoracopilot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.facebook.com/people/Locora-AI/61593321283379/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#1877f2] hover:border-[#1877f2]/30 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Instant AI Chat Prompt */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 font-sans">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <p className="text-xs font-bold text-slate-900">Need an Instant Answer?</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ask our live AI Business Copilot directly in your workspace.
              </p>
              <button
                onClick={handleStartCopilotChat}
                className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Copilot Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="p-8 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in duration-300 font-sans">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-slate-900">Message Received!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Your inquiry reference ticket ID is <span className="font-mono text-[#059669] font-bold">{ticketId}</span>. Our growth specialist will contact you shortly at <strong>{formData.email}</strong>.
              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              <h2 className="text-xl font-bold font-heading text-slate-900">Send Us a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Company / Business Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Growth Agency"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (512) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Inquiry Type</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  >
                    <option value="demo">Book 15-Min VIP Demo</option>
                    <option value="sales">Enterprise & Agency Sales</option>
                    <option value="support">Technical Support Inquiry</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Est. Monthly Client Retainers</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  >
                    <option value="under1k">Under $1,000 / mo</option>
                    <option value="1k-5k">$1,000 - $5,000 / mo</option>
                    <option value="5k-20k">$5,000 - $20,000 / mo</option>
                    <option value="20k+">$20,000+ / mo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Message / Details *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your agency workflow or any specific features you'd like to explore..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Quick AI Assistance Side Drawer (No Login / Signup Required) */}
      {isQuickChatOpen && (
        <div
          onClick={() => setIsQuickChatOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col font-sans border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white flex items-center gap-1.5">
                    Live AI Business Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400">Instant Quick Assistance • No Account Needed</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickChatOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
              <button
                onClick={() => handleSendQuickChat(undefined, 'What features does Locora AI offer?')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#059669] rounded-full text-slate-700 hover:text-[#059669] font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                💡 Platform Features
              </button>
              <button
                onClick={() => handleSendQuickChat(undefined, 'How much does Locora AI cost?')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#059669] rounded-full text-slate-700 hover:text-[#059669] font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                🏷️ Pricing & Credits
              </button>
              <button
                onClick={() => handleSendQuickChat(undefined, 'How to generate local SEO proposals?')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#059669] rounded-full text-slate-700 hover:text-[#059669] font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                ⚡ SEO Proposals
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                      msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#059669] text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#059669]" />
                  <span>Locora AI is composing response...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Drawer Input */}
            <form onSubmit={handleSendQuickChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI Copilot anything..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#059669] transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiTyping}
                className="p-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
