import { useState, useRef, useEffect, type FC, type FormEvent } from 'react';
import type { GuideMessage, AppPage } from '../types';
import { STARTER_QUESTIONS, findVerifiedAnswer } from '../data/guideKnowledge';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ShieldCheck, 
  BookOpen, 
  Telescope, 
  Orbit, 
  AlertCircle,
  HelpCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface AIGuideProps {
  onNavigate?: (page: AppPage) => void;
}

interface BackendStatus {
  isAiConfigured: boolean;
  isNasaConfigured?: boolean;
  nasaApiConnected?: boolean;
  mode: 'live' | 'demonstration';
  model?: string;
  message?: string;
  services?: {
    nasaOpenData?: {
      status: string;
      source: string;
      authenticated: boolean;
    };
  };
}

let msgSequence = 0;
function createMessageId(prefix: string): string {
  msgSequence += 1;
  return `${prefix}-${msgSequence}-${Date.now()}`;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const AIGuide: FC<AIGuideProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check backend AI status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendStatus(data);
          }
        } else {
          if (isMounted) {
            setBackendStatus({
              isAiConfigured: false,
              mode: 'demonstration',
              message: 'Backend API unavailable. Operating with local verified educational database.'
            });
          }
        }
      } catch {
        if (isMounted) {
          setBackendStatus({
            isAiConfigured: false,
            mode: 'demonstration',
            message: 'Operating in client-side demonstration mode with verified educational database.'
          });
        }
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll chat to bottom smoothly
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when loading ends
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Handle starting a new conversation
  const handleStartNewConversation = () => {
    setMessages([]);
    setErrorMessage(null);
    setInputValue('');
  };

  // Send a message to backend /api/chat with fallback
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);

    // 1. Add User Message
    const userMsg: GuideMessage = {
      id: createMessageId('user'),
      sender: 'user',
      text: query,
      timestamp: getFormattedTime()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    // Build recent conversation history for multi-turn context
    const historyPayload = nextMessages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: GuideMessage = {
        id: createMessageId('bot'),
        sender: 'assistant',
        text: data.reply,
        timestamp: getFormattedTime(),
        mode: data.mode,
        isAiConnected: data.isAiConnected,
        suggestions: data.suggestions,
        links: data.links,
        scientificReference: data.scientificReference,
        notice: data.notice,
        warning: data.warning
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Failed to connect to the assistant.';
      console.warn('AI Guide request failed, falling back to verified educational knowledge base:', errorText);

      // Gracefully switch to verified educational knowledge base
      const localVerified = findVerifiedAnswer(query);

      let fallbackReply = '';
      let fallbackSuggestions = STARTER_QUESTIONS.slice(0, 4);
      let fallbackLinks = [
        { label: 'SPHEREx Explorer', page: 'spherex' as AppPage, reason: 'Inspect 102 infrared spectral channels and interstellar ices' },
        { label: 'Planet X Investigation Lab', page: 'planet-x' as AppPage, reason: 'Review extreme TNO orbits and gravitational clustering models' }
      ];
      let fallbackRef = 'NASA Astrophysics & Minor Planet Center Educational Archive';

      if (localVerified) {
        fallbackReply = localVerified.answer;
        fallbackSuggestions = localVerified.suggestions;
        fallbackLinks = localVerified.links || fallbackLinks;
        fallbackRef = localVerified.scientificReference;
      } else {
        fallbackReply = `That is an interesting question about the cosmos!

In educational demonstration mode, our verified database focuses on infrared astrophysics (SPHEREx), interstellar water ices, and outer Solar System dynamics (hypothetical Planet X).

Key astronomical principles:
- **Observation vs. Simulation**: Astronomical knowledge is established through multi-wavelength observations (optical, infrared, radio) and rigorous orbital mechanics. Visualizations and models in this app help illustrate concepts but are not observational discoveries.
- **Hypotheses vs. Confirmations**: Hypothesized bodies (like Planet X) remain unconfirmed until direct observational proof is verified by the astronomical community.

You can explore any of our core educational questions or inspect our interactive explorers.`;
      }

      const fallbackMsg: GuideMessage = {
        id: createMessageId('bot'),
        sender: 'assistant',
        text: fallbackReply,
        timestamp: getFormattedTime(),
        mode: 'demonstration',
        isAiConnected: false,
        suggestions: fallbackSuggestions,
        links: fallbackLinks,
        scientificReference: fallbackRef,
        notice: 'Demonstration Mode: Operating with verified educational knowledge base.'
      };

      setMessages(prev => [...prev, fallbackMsg]);
      setErrorMessage(`Network notice: External AI service was unreachable. Verified educational fallback was used.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Educational Astronomy Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Cosmic AI Guide
          </h1>
          <p className="text-sm sm:text-base text-[#A7B4CC] mt-1">
            Your friendly guide to the universe.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          {/* New Conversation Button */}
          <button
            onClick={handleStartNewConversation}
            disabled={isLoading || messages.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-medium text-[#A7B4CC] hover:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
            aria-label="Start a new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </button>

          {/* Operational Mode Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${
              backendStatus?.isAiConfigured
                ? 'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/30'
                : 'bg-[#F5C451]/10 text-[#F5C451] border-[#F5C451]/30'
            }`}
            title={backendStatus?.message || 'Operational status'}
          >
            {backendStatus?.isAiConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Live: {backendStatus.model || 'Gemini'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demonstration Mode</span>
              </>
            )}
          </div>

          {/* NASA Open Data API Status Badge */}
          {backendStatus?.isNasaConfigured && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono bg-[#10B981]/10 text-[#34D399] border-[#10B981]/30"
              title="NASA Open Data API authenticated via api.nasa.gov"
            >
              <span className="flex h-2 w-2 relative">
                <span className="beacon-pulse absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span>NASA API: Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Scientific Integrity & Educational Mission Notice */}
      <div className="p-4 rounded-xl bg-[#0B1630] border border-[#1E293B] flex items-start gap-3 text-xs text-[#A7B4CC]">
        <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[#F8FAFC] font-medium">
            Scientific Accuracy & Beginner-Friendly Guidelines
          </p>
          <p className="leading-relaxed">
            COSMIC AI GUIDE explains astronomy concepts in simple language without unnecessary jargon. All answers strictly distinguish verified observational facts from hypothetical models (such as Planet X) and educational simulations. No telescope observations, coordinates, or measurements are fabricated.
          </p>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div 
          role="alert"
          className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#FCA5A5] flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#FCA5A5] hover:text-[#FFFFFF] text-xs font-mono font-bold"
            aria-label="Dismiss error notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Chat Interface */}
      <div 
        className="rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col h-150"
        role="region"
        aria-label="Chat conversation area"
      >
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Empty State / Starter Questions */}
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-4 max-w-xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shadow-inner">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#F8FAFC]">
                  Welcome to COSMIC AI GUIDE
                </h3>
                <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
                  I can help you understand infrared astronomy, how NASA’s SPHEREx mission explores the early universe and water ices, and the scientific clues behind hypothetical Planet X.
                </p>
              </div>

              {/* Clickable Starter Questions */}
              <div className="w-full space-y-2 text-left">
                <p className="text-[11px] font-mono text-[#F5C451] uppercase font-bold tracking-wider text-center">
                  Suggested Questions to Get Started:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STARTER_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(question)}
                      className="p-3 text-left rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] hover:bg-[#0B1630] text-xs text-[#A7B4CC] hover:text-[#F8FAFC] transition-all flex items-start gap-2.5 group cursor-pointer focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium leading-snug">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'} animate-message-enter`}
                >
                  {/* Clean SVG/Lucide Avatar (No emoji avatars) */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isAssistant
                        ? 'bg-linear-to-br from-[#0F172A] to-[#1E293B] border border-[#38BDF8]/30 text-[#38BDF8]'
                        : 'bg-[#38BDF8] text-[#050B1A]'
                    }`}
                    aria-hidden="true"
                  >
                    {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5 font-bold" />}
                  </div>

                  {/* Message Bubble & Supplementary Content */}
                  <div className={`space-y-2.5 max-w-[85%] sm:max-w-[80%] ${!isAssistant ? 'text-right' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left ${
                        isAssistant
                          ? 'bg-[#050B1A] border border-[#1E293B] text-[#F8FAFC]'
                          : 'bg-[#38BDF8] text-[#050B1A] font-medium shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Demonstration Mode Notice */}
                    {isAssistant && msg.notice && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#F5C451] px-1">
                        <ShieldCheck className="w-3 h-3 text-[#F5C451]" />
                        <span>{msg.notice}</span>
                      </div>
                    )}

                    {/* Links to Relevant Explorers */}
                    {isAssistant && msg.links && msg.links.length > 0 && onNavigate && (
                      <div className="pt-1 space-y-1.5 text-left">
                        <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider block">
                          Related Explorers:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.links.map((link, lIdx) => {
                            const isSpherex = link.page === 'spherex';
                            return (
                              <button
                                key={lIdx}
                                onClick={() => onNavigate(link.page)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isSpherex
                                    ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]'
                                    : 'bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6]'
                                }`}
                                title={link.reason}
                              >
                                {isSpherex ? (
                                  <Telescope className="w-3.5 h-3.5" />
                                ) : (
                                  <Orbit className="w-3.5 h-3.5" />
                                )}
                                <span>{link.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Scientific Reference Attribution */}
                    {isAssistant && msg.scientificReference && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#A7B4CC] font-mono px-1 text-left">
                        <BookOpen className="w-3 h-3 text-[#38BDF8]" />
                        <span>Reference: {msg.scientificReference}</span>
                      </div>
                    )}

                    {/* Follow-up Suggestions Chips */}
                    {isAssistant && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-1.5 space-y-1 text-left">
                        <span className="text-[10px] font-mono text-[#A7B4CC] uppercase tracking-wider block">
                          Suggested Inquiries:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              disabled={isLoading}
                              className="px-2.5 py-1 rounded-lg bg-[#0E1B38] hover:bg-[#38BDF8] text-[#A7B4CC] hover:text-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono transition-all text-left cursor-pointer focus:ring-1 focus:ring-[#38BDF8] focus:outline-none disabled:opacity-40"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-[10px] text-[#A7B4CC]/60 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 animate-fadeIn" role="status" aria-live="polite">
              <div className="w-9 h-9 rounded-xl bg-[#0F172A] border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#050B1A] border border-[#1E293B] text-xs text-[#A7B4CC] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#F5C451] animate-bounce [animation-delay:300ms]" />
                <span className="ml-1 font-mono text-xs">Formulating educational explanation...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Form */}
        <div className="p-3 sm:p-4 bg-[#0B1630] border-t border-[#1E293B]">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Ask a space question form"
          >
            <label htmlFor="ai-guide-input" className="sr-only">
              Ask any space question
            </label>
            <input
              id="ai-guide-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an astronomy question (e.g., 'What is an astronomical unit?')"
              maxLength={1000}
              className="flex-1 bg-[#050B1A] text-[#F8FAFC] placeholder-[#A7B4CC]/60 px-4 py-3 rounded-xl border border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent text-xs sm:text-sm disabled:opacity-50"
              disabled={isLoading}
              aria-required="true"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-5 py-3 rounded-xl bg-linear-to-r from-[#38BDF8] to-[#0284C7] text-[#050B1A] font-bold text-xs sm:text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#A7B4CC]/60 px-1">
            <span>Press Enter to send. Max 1,000 characters.</span>
            <span>Educational Astronomy Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
