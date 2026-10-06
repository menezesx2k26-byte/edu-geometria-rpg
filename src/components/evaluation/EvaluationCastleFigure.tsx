import type { EvaluationFigureAnchor, EvaluationFigureKind } from '../../data/evaluationCastle';

interface EvaluationCastleFigureProps {
  kind: EvaluationFigureKind;
  anchors: EvaluationFigureAnchor[];
  selectedAnchorIds: string[];
  onToggleAnchor: (anchorId: string) => void;
}

const selected = (ids: string[], id: string) => ids.includes(id) ? ' is-highlighted' : '';

function FigureSvg({ kind, selectedAnchorIds }: { kind: EvaluationFigureKind; selectedAnchorIds: string[] }) {
  if (kind === 'parallelogram-diagonals') {
    return (
      <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica do paralelogramo ABCD com diagonais cruzando em O">
        <polygon points="70,55 280,55 320,190 110,190" className={`geo-shape${selected(selectedAnchorIds, 'side-ab-cd')}`} />
        <line x1="70" y1="55" x2="320" y2="190" className={`geo-diagonal${selected(selectedAnchorIds, 'angle-bao-dco')}`} />
        <line x1="280" y1="55" x2="110" y2="190" className={`geo-diagonal${selected(selectedAnchorIds, 'angle-abo-cdo')}`} />
        <text x="54" y="48">A</text><text x="286" y="48">B</text><text x="325" y="205">C</text><text x="91" y="207">D</text><text x="192" y="128">O</text>
      </svg>
    );
  }

  if (kind === 'quadrilateral-diagonals') {
    return (
      <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica de um quadrilátero ABCD com duas diagonais">
        <polygon points="65,70 280,45 315,185 95,205" className="geo-shape" />
        <line x1="65" y1="70" x2="315" y2="185" className={`geo-diagonal${selected(selectedAnchorIds, 'ac-paths')}`} />
        <line x1="280" y1="45" x2="95" y2="205" className={`geo-diagonal${selected(selectedAnchorIds, 'bd-paths')}`} />
        <text x="48" y="67">A</text><text x="285" y="42">B</text><text x="320" y="199">C</text><text x="78" y="220">D</text>
      </svg>
    );
  }

  if (kind === 'cevian-construction') {
    return (
      <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica do triângulo ABC com ponto médio e perpendicular">
        <polygon points="80,190 285,190 205,45" className="geo-shape" />
        <circle cx="182.5" cy="190" r="5" className={`geo-point${selected(selectedAnchorIds, 'midpoint-ab')}`} />
        <line x1="205" y1="45" x2="182.5" y2="190" className={`geo-helper${selected(selectedAnchorIds, 'midpoint-ab')}`} />
        <line x1="80" y1="190" x2="242" y2="94" className={`geo-helper${selected(selectedAnchorIds, 'perpendicular-bc')}`} />
        <text x="64" y="207">A</text><text x="290" y="207">B</text><text x="207" y="36">C</text><text x="169" y="213">M</text>
      </svg>
    );
  }

  if (kind === 'ramp-similarity') {
    return (
      <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica da rampa com triângulos semelhantes">
        <line x1="45" y1="200" x2="320" y2="200" className="geo-shape" />
        <line x1="45" y1="200" x2="320" y2="55" className="geo-ramp" />
        <line x1="130" y1="155" x2="130" y2="200" className={`geo-helper${selected(selectedAnchorIds, 'small-height-1')}`} />
        <line x1="320" y1="55" x2="320" y2="200" className={`geo-helper${selected(selectedAnchorIds, 'large-height-h')}`} />
        <text x="82" y="168">2 m</text><text x="215" y="105">6 m</text><text x="137" y="181">1 m</text><text x="326" y="132">h</text>
      </svg>
    );
  }

  if (kind === 'isosceles-parallelogram') {
    return (
      <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica de triângulo isósceles com paralelogramo interno">
        <polygon points="180,35 55,205 305,205" className={`geo-shape${selected(selectedAnchorIds, 'isosceles-sides')}`} />
        <line x1="113" y1="126" x2="246" y2="126" className={`geo-helper${selected(selectedAnchorIds, 'pe-parallel-ac')}`} />
        <line x1="246" y1="126" x2="305" y2="205" className={`geo-helper${selected(selectedAnchorIds, 'pd-parallel-ab')}`} />
        <text x="177" y="27">A</text><text x="39" y="220">B</text><text x="310" y="220">C</text><text x="100" y="121">E</text><text x="252" y="121">D</text><text x="246" y="220">P</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 240" role="img" aria-label="Figura geométrica para classificar famílias de figuras">
      <rect x="45" y="55" width="100" height="100" className={`geo-shape${selected(selectedAnchorIds, 'square-family')}`} />
      <polygon points="205,65 315,65 285,150 175,150" className="geo-shape" />
      <polygon points="235,180 285,220 185,220" className={`geo-shape${selected(selectedAnchorIds, 'counterexample')}`} />
      <text x="64" y="178">quadrado</text><text x="200" y="174">quadrilátero</text>
    </svg>
  );
}

export function EvaluationCastleFigure({
  kind,
  anchors,
  selectedAnchorIds,
  onToggleAnchor,
}: EvaluationCastleFigureProps) {
  return (
    <figure className="evaluation-figure">
      <FigureSvg kind={kind} selectedAnchorIds={selectedAnchorIds} />
      <figcaption>Toque nas relações que você quer manter visíveis enquanto raciocina.</figcaption>
      <div className="evaluation-anchor-list" aria-label="Relações da figura">
        {anchors.map((anchor) => {
          const isSelected = selectedAnchorIds.includes(anchor.id);
          return (
            <button
              type="button"
              key={anchor.id}
              aria-pressed={isSelected}
              className={isSelected ? 'is-selected' : ''}
              onClick={() => onToggleAnchor(anchor.id)}
            >
              {anchor.label}
            </button>
          );
        })}
      </div>
    </figure>
  );
}
