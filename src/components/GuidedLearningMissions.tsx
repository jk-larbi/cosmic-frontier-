import { useState, useEffect, type FC } from 'react';
import { 
  GUIDED_LEARNING_MISSIONS, 
  type LearningMission 
} from '../utils/planetXPhysics';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Award, 
  HelpCircle, 
  RotateCcw,
  BookOpen,
  Compass
} from 'lucide-react';

interface GuidedLearningMissionsProps {
  isBeginnerMode?: boolean;
  onNavigateTab?: (tab: 'orbit' | 'distance' | 'evidence' | 'blink') => void;
}

const STORAGE_KEY = 'cosmic_frontier_learning_missions_completed';

export const GuidedLearningMissions: FC<GuidedLearningMissionsProps> = ({
  isBeginnerMode = true,
  onNavigateTab
}) => {
  const [activeMission, setActiveMission] = useState<LearningMission>(GUIDED_LEARNING_MISSIONS[0]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  // Load saved progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedMissionIds(parsed.filter(id => typeof id === 'string'));
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Save progress
  const saveProgress = (newCompleted: string[]) => {
    setCompletedMissionIds(newCompleted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSelectAnswer = (missionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [missionId]: optionIndex }));
    setShowFeedback(prev => ({ ...prev, [missionId]: true }));

    const mission = GUIDED_LEARNING_MISSIONS.find(m => m.id === missionId);
    if (mission && optionIndex === mission.question.correctIndex) {
      if (!completedMissionIds.includes(missionId)) {
        const updated = [...completedMissionIds, missionId];
        saveProgress(updated);
      }
    }
  };

  const handleResetProgress = () => {
    saveProgress([]);
    setSelectedAnswers({});
    setShowFeedback({});
  };

  const completedCount = completedMissionIds.length;
  const progressPercent = Math.round((completedCount / GUIDED_LEARNING_MISSIONS.length) * 100);

  const activeUserAnswer = selectedAnswers[activeMission.id];
  const isQuestionAnswered = showFeedback[activeMission.id] && activeUserAnswer !== undefined;
  const isAnswerCorrect = isQuestionAnswered && activeUserAnswer === activeMission.question.correctIndex;
  const isMissionCompleted = completedMissionIds.includes(activeMission.id);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Overall Mission Progress */}
      <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono uppercase font-bold tracking-wider">
                <span>Astronomy Academy</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                5 Guided Learning Missions
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-mono text-[#A7B4CC] block">Progress:</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {completedCount} / {GUIDED_LEARNING_MISSIONS.length} Completed ({progressPercent}%)
              </span>
            </div>
            {completedCount > 0 && (
              <button
                onClick={handleResetProgress}
                className="p-2 rounded-lg bg-[#050B1A] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
                title="Reset Mission Progress"
                aria-label="Reset mission progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-[#050B1A] overflow-hidden border border-[#1E293B]">
          <div 
            className="h-full bg-linear-to-r from-emerald-500 to-[#38BDF8] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-[#A7B4CC] leading-relaxed">
          {isBeginnerMode
            ? 'Step through five guided astronomy missions designed for beginners. Learn about astronomical distances, weird outer solar system orbits, and how astronomers hunt for undiscovered worlds.'
            : 'Explore foundational concepts of outer Solar System dynamics, observational selection bias, and deep-space survey methodologies.'}
        </p>
      </div>

      {/* 2. Mission Selection Fleet */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {GUIDED_LEARNING_MISSIONS.map((mission) => {
          const isSelected = activeMission.id === mission.id;
          const isDone = completedMissionIds.includes(mission.id);

          return (
            <button
              key={mission.id}
              onClick={() => setActiveMission(mission)}
              className={`p-3.5 rounded-xl text-left border transition-all space-y-1.5 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0B1630] border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-[#0B1630]/60 border-[#1E293B] hover:border-emerald-500/40 hover:bg-[#0B1630]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  isSelected ? 'text-emerald-400' : 'text-[#A7B4CC]'
                }`}>
                  Mission 0{mission.missionNumber}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#1E293B]" />
                )}
              </div>
              <h3 className="font-bold text-xs text-[#F8FAFC] line-clamp-2">
                {mission.title}
              </h3>
              <span className="text-[10px] font-mono text-[#A7B4CC] block">
                {mission.estimatedMinutes} mins
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Mission Deep-Dive & Interactive Challenge */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-6 shadow-xl">
        {/* Mission Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                Mission 0{activeMission.missionNumber} of 05
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] font-mono font-bold uppercase border border-[#38BDF8]/30">
                {activeMission.badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              {activeMission.title}
            </h3>
            <p className="text-xs text-[#F5C451] font-medium mt-0.5">
              {activeMission.subtitle}
            </p>
          </div>

          {isMissionCompleted && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mission Completed</span>
            </span>
          )}
        </div>

        {/* Plain Concept Overview */}
        <div className="p-4 rounded-xl bg-[#050B1A] border border-emerald-500/30 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Big Picture (In Plain English):</span>
          </span>
          <p className="text-sm text-[#F8FAFC] leading-relaxed">
            {activeMission.plainConcept}
          </p>
        </div>

        {/* Narrative Lesson */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[#A7B4CC] font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Mission Briefing:</span>
          </span>
          <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
            {activeMission.lessonNarrative}
          </p>
        </div>

        {/* Interactive Challenge Action */}
        <div className="p-4 rounded-xl bg-linear-to-r from-[#050B1A] to-[#0E1B38] border border-[#38BDF8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#38BDF8] font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Practical Exercise:</span>
            </span>
            <p className="text-xs text-[#F8FAFC]">
              {activeMission.interactiveChallenge.instruction}
            </p>
          </div>

          {onNavigateTab && activeMission.interactiveChallenge.targetTab && (
            <button
              onClick={() => onNavigateTab(activeMission.interactiveChallenge.targetTab!)}
              className="px-4 py-2 rounded-xl bg-[#38BDF8] text-[#050B1A] text-xs font-mono font-bold hover:bg-[#38BDF8]/90 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-[#38BDF8]/20"
            >
              <span>{activeMission.interactiveChallenge.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Concept Check Question */}
        <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#F8FAFC] font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#F5C451]" />
              <span>Mission Checkpoint: Test Your Understanding</span>
            </span>
            <span className="text-[10px] font-mono text-[#A7B4CC]">
              Instant Verification
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#F8FAFC]">
            {activeMission.question.question}
          </h4>

          {/* Answer Options */}
          <div className="space-y-2">
            {activeMission.question.options.map((opt, idx) => {
              const isSelected = activeUserAnswer === idx;
              const isCorrect = idx === activeMission.question.correctIndex;

              let btnStyle = 'bg-[#0B1630] text-[#F8FAFC] border-[#1E293B] hover:border-[#38BDF8]/40';
              if (showFeedback[activeMission.id]) {
                if (isSelected && isCorrect) {
                  btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500 font-medium';
                } else if (isCorrect) {
                  btnStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(activeMission.id, idx)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showFeedback[activeMission.id] && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Display */}
          {isQuestionAnswered && (
            <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
              isAnswerCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAnswerCorrect ? 'Excellent! Mission Goal Achieved!' : 'Not Quite — Keep Investigating!'}</span>
              </div>
              <p className="text-[#A7B4CC] leading-relaxed">
                {activeMission.question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
