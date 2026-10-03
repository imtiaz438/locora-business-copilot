import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { trackAiChatStarted } from '../lib/analytics';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface QuickPrompt {
  label: string;
  prompt: string;
  category: string;
}

export const RightAiPanel: React.FC = () => {
  const {
    rightAiPanelOpen,
    setRightAiPanelOpen,
    activeBusiness,
    priorityActions,
    fixItAction,
    consumeAiCredit,
  } = useApp();

  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string; time: string; actionId?: string }>
  >([]);

  // Reset conversation and scope strictly to the active business when switched
  useEffect(() => {
    const greeting = activeBusiness.gbpConnected
      ? `Hello! I'm your Locora AI Business Manager for **${activeBusiness.name}**.\n\n` +
        `Your Google Business Profile is connected with ${activeBusiness.reviewCount || 0} reviews (${activeBusiness.googleRating || 0}★). How can I assist you with ${activeBusiness.name}'s growth today?`
      : `Hello! I'm your Locora AI Business Manager for **${activeBusiness.name}**.\n\n` +
        `This business workspace has zero demo data. Once you connect your Google Business Profile or run a website audit, I will continuously analyze real telemetry. How can I help you today?`;

    setMessages([
      {
        id: `init_${activeBusiness.id}`,
        role: 'assistant',
        content: greeting,
        time: 'Just now',
      },
    ]);
  }, [activeBusiness.id, activeBusiness.name, activeBusiness.gbpConnected, activeBusiness.reviewCount, activeBusiness.googleRating]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const primaryService = activeBusiness.services?.[0] || 'Priority Service';
  const topCompetitor = activeBusiness.competitors?.[0] || 'Local Competitors';

  const quickPrompts: QuickPrompt[] = [
    {
      label: `Why ${primaryService} page matters?`,
      prompt: `Why does creating the "${activeBusiness.city} ${primaryService}" landing page matter for ${activeBusiness.name} and how many monthly inquiries will it bring?`,
      category: 'Visibility',
    },
    {
      label: 'Draft review responses for pending reviews',
      prompt: `Generate empathetic, brand-compliant responses for our unanswered Google client reviews.`,
      category: 'Reputation',
    },
    {
      label: `Competitor gap analysis vs ${topCompetitor}`,
      prompt: `What are our primary competitive advantages against ${topCompetitor} in ${activeBusiness.city}?`,
      category: 'Competitors',
    },
    {
      label: 'Explain LocalBusiness Schema benefits',
      prompt: `Explain how LocalBusiness and Service schema helps Google AI Overviews and Perplexity cite ${activeBusiness.name}.`,
      category: 'Technical SEO',
    },
  ];

  useEffect(() => {
    if (rightAiPanelOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, rightAiPanelOpen]);

  if (!rightAiPanelOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isTyping) return;

    trackAiChatStarted(text, 'copilot_panel');

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user' as const,
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      // Send query to local backend AI proxy — include the business ID so the
      // request takes the business-scoped AI Manager path (Business Brain
      // grounding) instead of the generic context-free path.
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          businessId: activeBusiness.id,
          businessProfile: {
            id: activeBusiness.id,
            name: activeBusiness.name,
            industry: activeBusiness.category,
            website: activeBusiness.website,
            phone: activeBusiness.phone,
          },
          businessContext: {
            name: activeBusiness.name,
            category: activeBusiness.category,
            city: activeBusiness.city,
            state: activeBusiness.state,
            phone: activeBusiness.phone,
            website: activeBusiness.website,
            healthScore: activeBusiness.healthScore,
            unansweredReviews: activeBusiness.unansweredReviews,
            priorityActions: priorityActions.map((a) => ({
              id: a.id,
              title: a.recommendationTitle,
              problem: a.problem,
              expectedImpact: a.expectedImpact,
            })),
          },
        }),
      });

      let aiReply = '';
      if (res.ok) {
        const data = await res.json();
        aiReply = data.reply || data.text || '';
        const engineOk = (data as any).realApiExecuted !== false;
        const grounded = (data as any).hasEnoughData !== false;
        if (!aiReply || !engineOk) {
          // Honest failure: no credit consumed, no fabricated statistics.
          aiReply =
            'The AI assistant is temporarily unavailable. No credit was used for this attempt — please try again in a moment.';
        } else if (grounded) {
          // A real, grounded deliverable was produced — the ONLY point where a credit moves.
          consumeAiCredit(1);
        }
        // else: backend returned an honest "not enough verified data" message —
        // show it, but don't charge for it.
      } else {
        aiReply =
          'The AI assistant returned an error. No credit was used for this attempt — please try again in a moment.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: `The AI assistant couldn't be reached due to a connection problem. No credit was used - please check your connection and try again.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <aside className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 shadow-xl font-sans shrink-0 transition-all duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-heading flex items-center gap-1.5">
              <span>AI Manager Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-500 font-sans truncate max-w-[180px]">
              Managing {activeBusiness.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setRightAiPanelOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Close AI Assistant Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-heading shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#059669]" /> Suggestions:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-slate-200/90 hover:border-emerald-300 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  {isUser ? 'You' : 'Locora AI Manager'}
                </span>
                <span className="text-[9px] text-slate-300">• {m.time}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                  isUser
                    ? 'bg-[#059669] text-white rounded-br-xs shadow-sm font-medium'
                    : 'bg-slate-100/90 text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs space-y-1.5">
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-2xl w-24 text-slate-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask about ${activeBusiness.name} growth...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#059669] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isTyping}
            className="p-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[9px] text-slate-400 text-center pt-2">
          Locora AI controls visibility, reputation, schema, and competitor actions.
        </p>
      </div>
    </aside>
  );
};
