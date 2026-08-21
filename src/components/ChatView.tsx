import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Paperclip,
  Bot,
  User,
  MessageSquare,
  ChevronRight,
  BookOpen,
  Cpu,
  AlertTriangle,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { getProviderConfig } from '../services/aiProvider';

const PROMPT_TEMPLATES = [
  {
    title: 'Draft Client Pitch',
    prompt: 'Draft a compelling business pitch email to a potential local client offering our digital marketing and SEO services.',
  },
  {
    title: 'Invoice Follow-up',
    prompt: 'Write a firm but polite follow-up email for an overdue invoice that was issued 14 days ago.',
  },
  {
    title: 'Price Increase Notice',
    prompt: 'Write a professional notice to existing clients informing them of a modest 10% rate update starting next month due to increased service quality.',
  },
  {
    title: 'Social Media Strategy',
    prompt: 'Give me 5 viral social media post concepts with captions for our local business to post this week.',
  },
  {
    title: 'Meeting Agenda',
    prompt: 'Draft a clean 30-minute discovery call agenda for onboarding a new client.',
  },
  {
    title: 'Review Reply',
    prompt: 'Draft a polite and helpful response to a negative 2-star Google review complaining about wait time.',
  },
];

export const ChatView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessageToConversation,
    deleteConversation,
    businessProfile,
    settings,
    customers,
    projects,
    user,
    hasEnoughCredits,
    consumeAiCredit,
    updateUser,
    setActiveTab,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<{
    type: 'customer' | 'project';
    id: string;
    label: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const convMessages = activeConv?.messages || [];
  const provider = getProviderConfig(settings.activeProvider);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages, loading]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim() || loading) return;

    // Check AI credit availability (1 credit)
    if (!hasEnoughCredits(1)) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    // Attach user message
    addMessageToConversation(convId, {
      sender: 'user',
      text: textToSend,
      contextAttached: selectedContext || undefined,
    });

    if (!overridePrompt) setInput('');
    setLoading(true);

    try {
      const currentConv = conversations.find((c) => c.id === convId);
      const pastMessages = currentConv
        ? [...currentConv.messages, { sender: 'user', text: textToSend }]
        : [{ sender: 'user', text: textToSend }];

      // Fetch AI response from Express server endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: pastMessages,
          businessProfile,
          context: selectedContext,
          provider: settings.activeProvider,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI Copilot response failed');
      }

      if (typeof data.creditsUsed === 'number') {
        updateUser({ aiCreditsUsed: data.creditsUsed });
      } else {
        consumeAiCredit(1);
      }

      addMessageToConversation(convId, {
        sender: 'assistant',
        text: data.text || 'I have generated the response for you.',
      });
    } catch (err: any) {
      addMessageToConversation(convId, {
        sender: 'assistant',
        text: `⚠️ Error: ${err.message || 'Failed to connect to AI provider. Please check API Key in Settings.'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden text-slate-900 font-sans">
      {/* Sidebar: Conversation History & Templates */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Conversations</span>
          <button
            onClick={() => createConversation()}
            className="p-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-sans">No previous conversations yet.</p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`group px-3 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-200 text-[#059669] font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`} />
                    <span className="truncate font-sans">{conv.title || 'Untitled Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Context Selector Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 font-sans">
            <Paperclip className="w-3 h-3 text-[#059669]" />
            <span>Attach Context</span>
          </div>
          <select
            value={selectedContext ? `${selectedContext.type}:${selectedContext.id}` : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSelectedContext(null);
                return;
              }
              const [type, id] = val.split(':');
              if (type === 'customer') {
                const c = customers.find((cust) => cust.id === id);
                if (c) setSelectedContext({ type: 'customer', id, label: `Client: ${c.name} (${c.company})` });
              } else {
                const p = projects.find((proj) => proj.id === id);
                if (p) setSelectedContext({ type: 'project', id, label: `Project: ${p.title}` });
              }
            }}
            className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#059669] font-sans cursor-pointer"
          >
            <option value="">No Context Attached</option>
            <optgroup label="Customers & Leads">
              {customers.map((c) => (
                <option key={c.id} value={`customer:${c.id}`}>
                  Customer: {c.name} ({c.company})
                </option>
              ))}
            </optgroup>
            <optgroup label="Active Projects">
              {projects.map((p) => (
                <option key={p.id} value={`project:${p.id}`}>
                  Project: {p.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-900">
                {activeConv?.title || 'AI Business Copilot'}
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-sans">
                <Cpu className="w-3 h-3 text-[#059669]" />
                <span>Powered by {provider.name}</span>
              </p>
            </div>
          </div>

          {selectedContext && (
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold flex items-center gap-1.5 font-sans">
              <Paperclip className="w-3 h-3" />
              <span>{selectedContext.label}</span>
              <button
                onClick={() => setSelectedContext(null)}
                className="hover:text-slate-900 font-bold ml-1 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {(!activeConv || convMessages.length === 0) && (
            <div className="max-w-3xl mx-auto py-8 space-y-8 font-sans">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#059669] flex items-center justify-center text-white mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold font-heading text-slate-900">How can I assist your business today?</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Ask me to draft emails, handle customer inquiries, summarize projects, create marketing campaigns, or analyze business documents.
                </p>
              </div>

              {/* Prompt Templates Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Popular Business Prompt Templates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROMPT_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(tmpl.prompt)}
                      className="p-3.5 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left space-y-1 transition-all group shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#059669] font-heading">{tmpl.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] transition-colors" />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{tmpl.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {convMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isError = !isUser && (msg.text.startsWith('⚠️ Error:') || msg.text.includes('API key is invalid') || msg.text.includes('API Key is invalid') || msg.text.includes('API Error:'));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                    isUser
                      ? 'bg-slate-900'
                      : isError
                      ? 'bg-rose-600'
                      : 'bg-[#059669]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : isError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans ${
                    isUser
                      ? 'bg-[#059669] text-white rounded-tr-none shadow-2xs'
                      : isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-none shadow-2xs space-y-3'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {msg.contextAttached && (
                    <div className="mb-2 p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#059669] font-semibold flex items-center gap-1.5">
                      <Paperclip className="w-3 h-3" />
                      <span>{msg.contextAttached.label}</span>
                    </div>
                  )}

                  {isError ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-rose-200/60 text-rose-800 flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-rose-950 font-heading">AI Provider Execution Error</p>
                          <p className="text-xs text-rose-800 mt-0.5 whitespace-pre-wrap">{msg.text.replace('⚠️ Error: ', '')}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-200/80">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>0 AI Credits Deducted (Balance Protected)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('settings')}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          <span>Update API Key in Settings</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto font-sans">
              <div className="w-8 h-8 rounded-xl bg-[#059669] flex items-center justify-center text-white text-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-600 flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                <span>Locora AI Copilot is crafting response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Locora AI anything about your business operations..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
