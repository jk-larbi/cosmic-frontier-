import type { FC } from 'react';
import type { ScientificProvenance } from '../../types';
import { ExternalLink, Database, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { getDataFreshness } from '../../services/scientificVerificationService';

interface ScientificProvenanceBadgeProps {
  provenance: Partial<ScientificProvenance>;
  showDetails?: boolean;
  className?: string;
}

export const ScientificProvenanceBadge: FC<ScientificProvenanceBadgeProps> = ({
  provenance,
  showDetails = false,
  className = ''
}) => {
  const freshness = getDataFreshness(
    provenance.retrievalDateUTC || (provenance.isLive ? Date.now() : null)
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Verification Authority */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B1630] border border-[#1E293B] text-[11px] font-mono text-[#F8FAFC]">
          <Database className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>{provenance.sourceOrganization || 'NASA / JPL Open Data'}</span>
        </span>

        {/* Freshness Status */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wider ${freshness.color}`}>
          <Clock className="w-3 h-3" />
          <span>{freshness.label}</span>
        </span>

        {/* Level */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          <span>Peer-Reviewed Archive</span>
        </span>

        {/* Archive link */}
        {provenance.archiveUrl && (
          <a
            href={provenance.archiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38BDF8] hover:text-[#7DD3FC] transition-colors ml-auto"
            title="Open canonical archive citation"
          >
            <span>Archive Record</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Optional Detailed Provenance Breakdown */}
      {showDetails && (
        <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1.5 text-xs font-mono text-[#94A3B8]">
          {provenance.catalogName && (
            <div className="flex justify-between">
              <span>Catalog Identifier:</span>
              <span className="text-[#F8FAFC]">{provenance.catalogName}</span>
            </div>
          )}
          {provenance.bibcode && (
            <div className="flex justify-between">
              <span>Astrophysical Bibcode:</span>
              <a
                href={`https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(provenance.bibcode)}/abstract`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38BDF8] hover:underline"
              >
                {provenance.bibcode}
              </a>
            </div>
          )}
          {provenance.retrievalDateUTC && (
            <div className="flex justify-between">
              <span>Retrieval Timestamp (UTC):</span>
              <span className="text-[#F8FAFC]">{provenance.retrievalDateUTC}</span>
            </div>
          )}
          {provenance.disclaimer && (
            <div className="flex items-start gap-1.5 pt-1 text-amber-300 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>{provenance.disclaimer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
