import { useState, type FC } from 'react';
import { 
  EVIDENCE_TOPICS 
} from '../data/evidenceData';
import type { EvidenceTopic } from '../types';
import { 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Telescope, 
  Search, 
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EvidenceDetectiveProps {
  isBeginnerMode?: boolean;
}

export const EvidenceDetective: FC<EvidenceDetectiveProps> = ({
  isBeginnerMode = true
}) => {
  const [selectedTopic, setSelectedTopic] = useState<EvidenceTopic>(EVIDENCE_TOPICS[0]);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState<boolean>(isBeginnerMode);
  const [exploredTopics, setExploredTopics] = useState<Record<string, boolean>>({
    'orbital-clustering': true
  });

  const handleSelectTopic = (t: EvidenceTopic) => {
    setSelectedTopic(t);
    setExploredTopics(prev => ({ ...prev, [t.id]: true }));
  };

  const exploredCount = Object.keys(exploredTopics).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Page Header & Educational Guide */}
      <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center border border-[#8B5CF6]/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[11px] font-mono uppercase font-bold tracking-wider">
                <span>Investigative Astronomy</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                Evidence Detective: The Planet Nine Scientific Debate
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowBeginnerGuide(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B] text-xs font-mono text-[#F5C451] hover:text-[#F8FAFC] transition-colors self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showBeginnerGuide ? 'Hide Detective Guide' : 'How Science Solves Mysteries'}</span>
            {showBeginnerGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Plain Language Detective Walkthrough */}
        {showBeginnerGuide && (
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#8B5CF6]/30 space-y-3 text-xs leading-relaxed text-[#A7B4CC]">
            <div className="flex items-center gap-2 text-[#8B5CF6] font-bold font-mono">
              <Sparkles className="w-4 h-4" />
              <span>How Do Astronomers Decide If an Unseen Planet Is Real?</span>
            </div>
            <p>
              In science, when astronomers see an unusual pattern in space, they don’t just assume they found a new planet. They formulate competing hypotheses and put each one on trial:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="font-bold text-[#38BDF8] block mb-1">1. The Planet Shepherd Hypothesis</span>
                <span>An unseen 5–8 Earth-mass planet exerts gravitational nudges that shepherd icy bodies into clustered orbits on one side of the sky.</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="font-bold text-[#F5C451] block mb-1">2. The Telescope Bias Hypothesis</span>
                <span>Telescopes can only observe in certain directions and seasons. What looks like clustering might just be where we happened to look.</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="font-bold text-[#FB7185] block mb-1">3. Collective Disk Self-Gravity</span>
                <span>Billions of smaller icy objects together have enough combined gravitational pull to align their own orbits without a single giant planet.</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[11px] font-mono">
              <span className="text-[#A7B4CC]">Investigated topics: {exploredCount} of {EVIDENCE_TOPICS.length}</span>
              <span className="text-emerald-400 font-bold">Scientific consensus: Active ongoing debate</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Evidence Topics Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Topic Selector Cards (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono uppercase text-[#A7B4CC] tracking-wider block font-bold">
            Select Investigation Topic:
          </span>

          <div className="space-y-2.5">
            {EVIDENCE_TOPICS.map(topic => {
              const isSelected = selectedTopic.id === topic.id;
              const hasExplored = Boolean(exploredTopics[topic.id]);

              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0B1630] border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/10'
                      : 'bg-[#0B1630]/60 border-[#1E293B] hover:border-[#8B5CF6]/40 hover:bg-[#0B1630]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#8B5CF6]' : 'bg-[#1E293B]'}`} />
                      <h3 className="font-bold text-sm text-[#F8FAFC]">
                        {topic.title}
                      </h3>
                      {hasExplored && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#A7B4CC] line-clamp-2 pl-4">
                      {topic.summary}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-[#8B5CF6] translate-x-1' : 'text-[#A7B4CC]'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Vera Rubin Observatory Highlight Box */}
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#38BDF8]/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#38BDF8] font-bold font-mono">
              <Telescope className="w-4 h-4" />
              <span>Upcoming Test: Vera C. Rubin Observatory</span>
            </div>
            <p className="text-[#A7B4CC] leading-relaxed">
              Equipped with a 3,200-megapixel digital camera, the Vera C. Rubin Observatory (LSST) in Chile will scan the entire southern sky every few nights. Its massive, unbiased survey will discover thousands of new outer solar system bodies, providing the definitive test to confirm or rule out the Planet Nine hypothesis.
            </p>
          </div>
        </div>

        {/* Right: Detailed Topic Inspector (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-6 shadow-xl">
          <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
            <div>
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold tracking-wider block">
                Evidence Dossier
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                {selectedTopic.title}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30 text-[10px] font-mono font-bold uppercase">
              Peer-Reviewed Topic
            </span>
          </div>

          {/* Plain Language Summary */}
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#F5C451] font-bold">
              Core Concept:
            </span>
            <p className="text-sm text-[#F8FAFC] font-medium leading-relaxed">
              {selectedTopic.summary}
            </p>
          </div>

          {/* Full Scientific Explanation */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#A7B4CC] font-bold block">
              In-Depth Astronomical Assessment:
            </span>
            <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed whitespace-pre-line">
              {selectedTopic.fullExplanation}
            </p>
          </div>

          {/* Side-by-Side: Observations vs Debated Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#38BDF8]/20 space-y-1.5">
              <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Observed Facts:</span>
              </span>
              <p className="text-xs text-[#F8FAFC] leading-relaxed">
                {selectedTopic.observationsToDate}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#F5C451]/20 space-y-1.5">
              <span className="text-[10px] font-mono text-[#F5C451] uppercase font-bold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Open Questions & Debates:</span>
              </span>
              <p className="text-xs text-[#F8FAFC] leading-relaxed">
                {selectedTopic.debatedAspects}
              </p>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center gap-3 text-xs text-[#A7B4CC]">
            <ShieldAlert className="w-4 h-4 text-[#F5C451] shrink-0" />
            <span>
              <strong>Scientific Fact:</strong> No direct optical or infrared detection of Planet Nine has been made. Until an image or transit confirms its existence, it remains a mathematical hypothesis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
