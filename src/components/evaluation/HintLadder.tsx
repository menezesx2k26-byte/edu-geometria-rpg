import { Lightbulb } from 'lucide-react';
import type { EvaluationHint } from '../../data/evaluationCastle';

interface HintLadderProps {
  hints: EvaluationHint[];
  openedTier: 0 | 1 | 2 | 3;
  onOpenTier: (tier: 1 | 2 | 3) => void;
}

export function HintLadder({ hints, openedTier, onOpenTier }: HintLadderProps) {
  return (
    <section className="hint-ladder" aria-label="Escada de pistas">
      <header><Lightbulb size={17} /><strong>Pistas graduais</strong></header>
      <div>
        {hints.map((hint) => {
          const expanded = openedTier >= hint.tier;
          const enabled = hint.tier === 1 || openedTier >= hint.tier - 1;
          return (
            <div key={hint.tier} className={expanded ? 'is-open' : ''}>
              <button
                type="button"
                aria-expanded={expanded}
                disabled={!enabled}
                onClick={() => onOpenTier(hint.tier)}
              >
                {hint.label} · pista {hint.tier}
              </button>
              {expanded && <p>{hint.text}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
