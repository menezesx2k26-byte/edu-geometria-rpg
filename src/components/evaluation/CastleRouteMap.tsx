import type { EvaluationCastleQuestion } from '../../data/evaluationCastle';

interface CastleRouteMapProps {
  questions: EvaluationCastleQuestion[];
  activeQuestionId: string;
}

export function CastleRouteMap({ questions, activeQuestionId }: CastleRouteMapProps) {
  const activeIndex = questions.findIndex((question) => question.id === activeQuestionId);

  return (
    <nav className="castle-route" aria-label="Rota do castelo mental">
      <ol>
        {questions.map((question, index) => {
          const current = question.id === activeQuestionId;
          const completed = activeIndex >= 0 && index < activeIndex;
          return (
            <li
              key={question.id}
              className={`castle-room-marker${current ? ' is-current' : ''}${completed ? ' is-complete' : ''}`}
              aria-current={current ? 'step' : undefined}
            >
              <span aria-hidden="true">{index + 1}</span>
              <strong aria-current={current ? 'step' : undefined}>{question.room.name}</strong>
              <small>{completed ? 'concluída' : current ? 'agora' : 'depois'}</small>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
