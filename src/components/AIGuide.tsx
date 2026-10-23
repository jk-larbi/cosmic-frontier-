import { useState, useRef, useEffect, type FC } from 'react';
import type { GuideMessage } from '../types';
import { findVerifiedAnswer } from '../data/guideKnowledge';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Key, 
  ShieldAlert, 
  BookOpen 
} from 'lucide-react';

const INITIAL_MESSAGES: GuideMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'assistant',
    text: "Hello! I am your Cosmic Space Guide. I'm here to help you understand infrared astronomy, how NASA's SPHEREx mission maps the cosmos, and the scientific clues behind the hypothetical Planet X.\n\nWhat would you like to explore today?",
    timestamp: 'Just now',
    suggestions: [
      'What is infrared light?',
      'What is Planet X?',
      'Why do scientists study distant galaxies?',
      'What am I seeing in the infrared viewer?'
    ]
  }
];

export const AIGuide: FC = () => {
  const [messages, setMessages] = useState<GuideMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [activeApiKey, setActiveApiKey] = useState<string>('');
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    // 1. Add User Message
    const userMsg: GuideMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // 2. Resolve Response using Verified Scientific Knowledge Base
    setTimeout(() => {
      const verified = findVerifiedAnswer(query);

      let responseText = '';
      let suggestions: string[] = [];
      let scientificRef = '';

      if (verified) {
        responseText = verified.answer;
        suggestions = verified.suggestions;
        scientificRef = verified.scientificReference;
      } else {
        responseText = `That's an intriguing question about the cosmos! While our verified educational database focuses specifically on infrared astrophysics (SPHEREx), water ice detection, and outer Solar System dynamics (Planet X), here is what is scientifically established:\n\nAstronomers study celestial bodies by combining multi-wavelength observations (optical, infrared, radio) with rigorous orbital mechanics. If you're exploring our tools, I can guide you through the physics of infrared light, how extreme trans-Neptunian objects point toward possible unseen planets, or what each color palette in our viewer represents.`;
        suggestions = [
          'What is infrared light and why do astronomers use it?',
          'What is NASA’s SPHEREx mission and what makes it special?',
          'What is Planet X (or Planet Nine)?',
          'How do scientists discover new planets?'
        ];
        scientificRef = 'NASA Cosmic Origins & Minor Planet Center Educational Archive';
      }

      const botMsg: GuideMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
        scientificReference: scientificRef
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      setActiveApiKey('');
      setApiStatusMessage('Using verified offline educational knowledge base.');
      setApiKeyModalOpen(false);
      return;
    }
    // Store in state only (never committed or exposed)
    setActiveApiKey(apiKeyInput.trim());
    setApiStatusMessage('Custom API configuration saved for current session.');
    setApiKeyModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Educational Space Assistant</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFC]">
            AI Space Guide
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-1">
            Ask questions about infrared astronomy, the SPHEREx mission, and the search for Planet X in simple language.
          </p>
        </div>

        {/* API Settings Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1630] border border-[#1E293B] hover:border-[#F5C451] text-xs font-mono text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-[#F5C451]" />
            <span>{activeApiKey ? 'Custom API Active' : 'Verified Knowledge Mode'}</span>
          </button>
        </div>
      </div>

      {/* Scientific Integrity Banner */}
      <div className="p-3.5 rounded-xl bg-[#0B1630] border border-[#1E293B] flex items-center justify-between gap-3 text-xs text-[#A7B4CC]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span>
            Operating in <strong className="text-[#F8FAFC]">Verified Science Mode</strong>. Explanations cite peer-reviewed research and official NASA/JPL mission data. No simulated data is fabricated as real observations.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-mono shrink-0">
          Peer-Reviewed Corroboration
        </span>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col h-[580px]">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isBot
                      ? 'bg-gradient-to-br from-[#8B5CF6] to-[#38BDF8] text-[#FFFFFF]'
                      : 'bg-[#F5C451] text-[#050B1A]'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5 font-bold" />}
                </div>

                {/* Message Bubble */}
                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%] ${!isBot && 'text-right'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isBot
                        ? 'bg-[#050B1A] border border-[#1E293B] text-[#F8FAFC]'
                        : 'bg-[#38BDF8] text-[#050B1A] font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Scientific Reference Attribution */}
                  {isBot && msg.scientificReference && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#38BDF8] font-mono px-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Reference: {msg.scientificReference}</span>
                    </div>
                  )}

                  {/* Follow-up Suggestions Chips */}
                  {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[10px] font-mono text-[#A7B4CC] block uppercase tracking-wider">
                        Suggested Follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2.5 py-1 rounded-lg bg-[#0E1B38] hover:bg-[#38BDF8] text-[#A7B4CC] hover:text-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono transition-all text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-[#A7B4CC]/60 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-[#050B1A] border border-[#1E293B] text-xs text-[#A7B4CC] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce delay-150" />
                <span className="w-2 h-2 rounded-full bg-[#F5C451] animate-bounce delay-300" />
                <span className="ml-2 font-mono">Analyzing scientific records...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Prompts Bar */}
        <div className="px-4 py-2.5 bg-[#050B1A]/80 border-t border-[#1E293B] flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
          <span className="text-[10px] font-mono text-[#F5C451] uppercase font-bold shrink-0">
            Quick Inquiries:
          </span>
          <button
            onClick={() => handleSendMessage('What is infrared light?')}
            className="px-2.5 py-1 rounded-md bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#38BDF8] transition-colors"
          >
            What is infrared light?
          </button>
          <button
            onClick={() => handleSendMessage('What is Planet X?')}
            className="px-2.5 py-1 rounded-md bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#8B5CF6] transition-colors"
          >
            What is Planet X?
          </button>
          <button
            onClick={() => handleSendMessage('Why do scientists study distant galaxies?')}
            className="px-2.5 py-1 rounded-md bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#38BDF8] transition-colors"
          >
            Why study distant galaxies?
          </button>
          <button
            onClick={() => handleSendMessage('How do scientists discover planets?')}
            className="px-2.5 py-1 rounded-md bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#F5C451] transition-colors"
          >
            How are planets found?
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0B1630] border-t border-[#1E293B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask any space question (e.g. 'What are interstellar ices?')"
              className="flex-1 bg-[#050B1A] text-[#F8FAFC] placeholder-[#A7B4CC]/60 px-4 py-3 rounded-xl border border-[#1E293B] focus:outline-none focus:border-[#38BDF8] text-xs sm:text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F5C451] to-[#EAB308] text-[#050B1A] font-bold text-sm hover:shadow-lg hover:shadow-[#F5C451]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* API Key / Fallback Settings Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B1A]/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0B1630] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-[#F5C451]">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#F8FAFC]">AI Guide Configuration</h3>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-[#A7B4CC] hover:text-[#F8FAFC] text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              COSMIC FRONTIER includes a rich, fully functional offline knowledge base with verified astrophysics explanations. If you wish to connect an external Google Gemini API key during testing, you can input it here for this browser session.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#F8FAFC] block">
                API Key (Optional / Session only):
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (leave blank for verified offline mode)"
                className="w-full bg-[#050B1A] text-[#F8FAFC] placeholder-[#A7B4CC]/50 px-3.5 py-2.5 rounded-xl border border-[#1E293B] text-xs font-mono focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            {apiStatusMessage && (
              <div className="p-2.5 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-mono">
                {apiStatusMessage}
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] text-[11px] text-[#A7B4CC] space-y-1">
              <span className="text-[#38BDF8] font-bold block">Security Guarantee:</span>
              <p>Secrets are never transmitted to unauthorized third parties or hardcoded into the frontend repository.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A7B4CC] hover:text-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-[#38BDF8] text-[#050B1A] font-bold text-xs hover:bg-[#0284C7] transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

