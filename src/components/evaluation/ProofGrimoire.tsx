import type { ProofGrimoireStep } from '../../data/evaluationCastle';

const phaseLabels: Record<ProofGrimoireStep['phase'], string> = {
  given: 'DADO',
  property: 'PROPRIEDADE',
  conclusion: 'CONCLUSÃO',
};

export function ProofGrimoire({ steps }: { steps: ProofGrimoireStep[] }) {
  return (
    <section className="proof-grimoire" aria-label="Grimório da demonstração">
      <header>
        <small>Grimório</small>
        <strong>DADO → PROPRIEDADE → CONCLUSÃO</strong>
      </header>
      <ol>
        {steps.map((step) => (
          <li key={step.id} data-phase={step.phase}>
            <span>{phaseLabels[step.phase]}</span>
            <p>{step.statement}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
