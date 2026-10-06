import { skills } from './bootstrap';
import type { MasteryDimension } from '../types/domain';

export type EvaluationRoomId =
  | 'portraits'
  | 'diagonal-staircase'
  | 'four-towers-bridge'
  | 'room-of-requirement'
  | 'potions-ramp'
  | 'isosceles-chamber';

export type EvaluationFigureKind =
  | 'classification-gallery'
  | 'parallelogram-diagonals'
  | 'quadrilateral-diagonals'
  | 'cevian-construction'
  | 'ramp-similarity'
  | 'isosceles-parallelogram';

export interface EvaluationHint {
  tier: 1 | 2 | 3;
  label: 'Olhar' | 'Ferramenta' | 'Conexão';
  text: string;
}

export interface EvaluationFigureAnchor {
  id: string;
  label: string;
}

export interface ProofGrimoireStep {
  id: string;
  phase: 'given' | 'property' | 'conclusion';
  statement: string;
  dependsOn: string[];
}

interface EvaluationRoom {
  id: EvaluationRoomId;
  name: string;
  mnemonic: string;
}

interface EvaluationFigure {
  kind: EvaluationFigureKind;
  anchors: EvaluationFigureAnchor[];
}

interface EvaluationBaseQuestion {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  room: EvaluationRoom;
  figure: EvaluationFigure;
  hints: EvaluationHint[];
  grimoire: ProofGrimoireStep[];
  skillIds: string[];
  masteryDimensions: MasteryDimension[];
}

export interface EvaluationSingleQuestion extends EvaluationBaseQuestion {
  kind: 'single';
  options: Array<{ id: string; label: string }>;
  correctId: string;
  explanation: string;
}

export interface EvaluationMultiQuestion extends EvaluationBaseQuestion {
  kind: 'multi';
  statements: Array<{
    id: string;
    text: string;
    answer: 'V' | 'F';
    explanation: string;
  }>;
}

export type EvaluationCastleQuestion = EvaluationSingleQuestion | EvaluationMultiQuestion;

export const EVALUATION_ROOM_ORDER: EvaluationRoomId[] = [
  'portraits',
  'diagonal-staircase',
  'four-towers-bridge',
  'room-of-requirement',
  'potions-ramp',
  'isosceles-chamber',
];

const hints = (look: string, tool: string, connection: string): EvaluationHint[] => [
  { tier: 1, label: 'Olhar', text: look },
  { tier: 2, label: 'Ferramenta', text: tool },
  { tier: 3, label: 'Conexão', text: connection },
];

export const EVALUATION_CASTLE_QUESTIONS: EvaluationCastleQuestion[] = [
  {
    id: 'q1-vf',
    kind: 'multi',
    title: 'Questão 1 · Verdadeiro ou falso',
    subtitle: 'Definições e propriedades',
    prompt: 'Classifique cada afirmação. Na prova, a letra sozinha não basta: pense na justificativa ou num contraexemplo.',
    room: {
      id: 'portraits',
      name: 'Salão dos Retratos Mutáveis',
      mnemonic: 'Definição sustenta; contraexemplo derruba.',
    },
    figure: {
      kind: 'classification-gallery',
      anchors: [
        { id: 'square-family', label: 'quadrado → paralelogramo' },
        { id: 'counterexample', label: 'procure um contraexemplo para “todo”' },
      ],
    },
    hints: hints(
      'Observe quais palavras são definições e quais são afirmações universais.',
      'Para uma afirmação com “todo”, teste a definição; para refutar, basta um contraexemplo.',
      'Separe inclusão de famílias geométricas de propriedades específicas de uma subclasse.',
    ),
    grimoire: [
      { id: 'q1-given', phase: 'given', statement: 'Uma afirmação universal sobre uma classe geométrica.', dependsOn: [] },
      { id: 'q1-property', phase: 'property', statement: 'Use a definição da classe ou um contraexemplo válido.', dependsOn: ['q1-given'] },
      { id: 'q1-conclusion', phase: 'conclusion', statement: 'Classifique como V ou F com justificativa.', dependsOn: ['q1-property'] },
    ],
    skillIds: ['triangles', 'parallelogram-characterization'],
    masteryDimensions: ['recognition', 'justification'],
    statements: [
      { id: 'square', text: 'Todo quadrado é um paralelogramo.', answer: 'V', explanation: 'V. Um quadrado tem os dois pares de lados opostos paralelos.' },
      { id: 'parallelogram', text: 'Todo paralelogramo é um quadrado.', answer: 'F', explanation: 'F. Um retângulo não quadrado já é contraexemplo.' },
      { id: 'equilateral', text: 'Todo triângulo equilátero é isósceles.', answer: 'V', explanation: 'V, usando isósceles = triângulo com pelo menos dois lados congruentes.' },
      { id: 'trapezoid', text: 'Todo trapézio é um paralelogramo.', answer: 'F', explanation: 'F. Um trapézio com apenas um par de lados paralelos não é paralelogramo.' },
      { id: 'rhombus', text: 'Em um losango, as diagonais são perpendiculares.', answer: 'V', explanation: 'V. As diagonais de um losango se cruzam perpendicularmente.' },
    ],
  },
  {
    id: 'q2-parallelogram',
    kind: 'single',
    title: 'Questão 2 · Diagonais do paralelogramo',
    subtitle: 'Demonstração',
    prompt: 'ABCD é um paralelogramo e as diagonais AC e BD se cruzam em O. Qual roteiro prova que O é ponto médio das duas diagonais?',
    room: {
      id: 'diagonal-staircase',
      name: 'Escadaria das Diagonais',
      mnemonic: 'Paralelas dão ângulos; congruência dá metades.',
    },
    figure: {
      kind: 'parallelogram-diagonals',
      anchors: [
        { id: 'angle-bao-dco', label: '∠BAO ↔ ∠DCO' },
        { id: 'angle-abo-cdo', label: '∠ABO ↔ ∠CDO' },
        { id: 'side-ab-cd', label: 'AB ↔ CD' },
      ],
    },
    hints: hints(
      'Procure dois triângulos opostos no cruzamento das diagonais.',
      'Use as paralelas para obter ângulos congruentes e uma propriedade de lados opostos do paralelogramo.',
      'Depois da congruência, extraia AO=OC e BO=OD como partes correspondentes.',
    ),
    grimoire: [
      { id: 'q2-given-parallel', phase: 'given', statement: 'AB ∥ CD e AD ∥ BC; AC e BD cruzam-se em O.', dependsOn: [] },
      { id: 'q2-alt-1', phase: 'property', statement: '∠BAO ≅ ∠DCO por alternos internos.', dependsOn: ['q2-given-parallel'] },
      { id: 'q2-alt-2', phase: 'property', statement: '∠ABO ≅ ∠CDO por alternos internos.', dependsOn: ['q2-given-parallel'] },
      { id: 'q2-side', phase: 'property', statement: 'AB ≅ CD, lados opostos do paralelogramo.', dependsOn: ['q2-given-parallel'] },
      { id: 'q2-congruence', phase: 'property', statement: '△AOB ≅ △COD por ALA.', dependsOn: ['q2-alt-1', 'q2-alt-2', 'q2-side'] },
      { id: 'q2-conclusion', phase: 'conclusion', statement: 'AO=OC e BO=OD; portanto O é ponto médio de AC e BD.', dependsOn: ['q2-congruence'] },
    ],
    skillIds: ['parallelogram-characterization'],
    masteryDimensions: ['application', 'justification', 'reproduction'],
    options: [
      { id: 'correct', label: 'Comparar △AOB e △COD: usar ângulos vindos das paralelas + lado oposto congruente para provar congruência; então AO=OC e BO=OD.' },
      { id: 'visual', label: 'Como as diagonais parecem se cortar no meio, concluir diretamente que O é ponto médio.' },
      { id: 'opv-only', label: 'Usar apenas ângulos opostos pelo vértice em O; isso já torna os quatro segmentos iguais.' },
      { id: 'circular', label: 'Assumir AO=OC e BO=OD e, depois, usar essas igualdades para provar que O é ponto médio.' },
    ],
    correctId: 'correct',
    explanation: 'O ponto médio precisa ser concluído, não assumido. A congruência de triângulos fornece AO=OC e BO=OD; como O pertence às diagonais, ele é ponto médio de ambas.',
  },
  {
    id: 'q3-inequality',
    kind: 'single',
    title: 'Questão 3 · Diagonais menores que o perímetro',
    subtitle: 'Desigualdade triangular',
    prompt: 'Para um quadrilátero ABCD, qual encadeamento prova AC + BD < AB + BC + CD + DA?',
    room: {
      id: 'four-towers-bridge',
      name: 'Ponte das Quatro Torres',
      mnemonic: 'Cada diagonal tem dois caminhos laterais.',
    },
    figure: {
      kind: 'quadrilateral-diagonals',
      anchors: [
        { id: 'ac-paths', label: 'AC comparada pelos caminhos AB+BC e AD+DC' },
        { id: 'bd-paths', label: 'BD comparada pelos caminhos BA+AD e BC+CD' },
      ],
    },
    hints: hints(
      'Olhe uma diagonal por vez e encontre dois triângulos que a contenham.',
      'Aplique a desigualdade triangular duas vezes para cada diagonal.',
      'Ao somar as quatro desigualdades, aparece um fator 2 dos dois lados.',
    ),
    grimoire: [
      { id: 'q3-given', phase: 'given', statement: 'ABCD é um quadrilátero com diagonais AC e BD.', dependsOn: [] },
      { id: 'q3-ac', phase: 'property', statement: 'AC<AB+BC e AC<AD+DC.', dependsOn: ['q3-given'] },
      { id: 'q3-bd', phase: 'property', statement: 'BD<BA+AD e BD<BC+CD.', dependsOn: ['q3-given'] },
      { id: 'q3-sum', phase: 'property', statement: 'Somando: 2AC+2BD<2(AB+BC+CD+DA).', dependsOn: ['q3-ac', 'q3-bd'] },
      { id: 'q3-conclusion', phase: 'conclusion', statement: 'Dividindo por 2: AC+BD<AB+BC+CD+DA.', dependsOn: ['q3-sum'] },
    ],
    skillIds: ['triangle-inequality'],
    masteryDimensions: ['application', 'justification', 'transfer'],
    options: [
      { id: 'correct', label: 'Usar AC<AB+BC e AC<AD+DC; BD<BA+AD e BD<BC+CD. Somar as quatro desigualdades e dividir por 2.' },
      { id: 'intersection', label: 'Somar as quatro desigualdades dos triângulos formados pelo ponto de interseção das diagonais; isso dá diretamente o resultado pedido.' },
      { id: 'largest', label: 'Afirmar que cada diagonal é menor que qualquer lado do quadrilátero e somar.' },
      { id: 'pythagoras', label: 'Aplicar Pitágoras em cada triângulo, mesmo sem ângulos retos indicados.' },
    ],
    correctId: 'correct',
    explanation: 'Somando: 2AC + 2BD < 2(AB+BC+CD+DA). Dividindo por 2, obtemos exatamente AC+BD < perímetro.',
  },
  {
    id: 'q4-constructions',
    kind: 'single',
    title: 'Questão 4 · Mediana e altura',
    subtitle: 'Régua e compasso',
    prompt: 'No △ABC, qual descrição constrói corretamente a mediana relativa a C e a altura relativa a A?',
    room: {
      id: 'room-of-requirement',
      name: 'Sala Precisa das Cevianas',
      mnemonic: 'Mediana procura ponto médio; altura procura perpendicular.',
    },
    figure: {
      kind: 'cevian-construction',
      anchors: [
        { id: 'midpoint-ab', label: 'ponto médio M de AB' },
        { id: 'perpendicular-bc', label: 'perpendicular a BC passando por A' },
      ],
    },
    hints: hints(
      'Pergunte primeiro: a definição pede ponto médio ou perpendicularidade?',
      'Mediana liga vértice ao ponto médio; altura sai do vértice perpendicular ao lado oposto ou prolongamento.',
      'Para C use o ponto médio de AB; para A use uma perpendicular à reta BC.',
    ),
    grimoire: [
      { id: 'q4-given', phase: 'given', statement: 'Triângulo ABC; pedem mediana relativa a C e altura relativa a A.', dependsOn: [] },
      { id: 'q4-property', phase: 'property', statement: 'Mediana usa ponto médio; altura usa perpendicularidade.', dependsOn: ['q4-given'] },
      { id: 'q4-conclusion', phase: 'conclusion', statement: 'Construa M em AB e trace CM; por A, trace a perpendicular a BC.', dependsOn: ['q4-property'] },
    ],
    skillIds: ['median', 'altitude'],
    masteryDimensions: ['recognition', 'application', 'reproduction'],
    options: [
      { id: 'correct', label: 'Mediana de C: construir o ponto médio M de AB e traçar CM. Altura de A: construir por A a perpendicular à reta BC.' },
      { id: 'swap', label: 'Mediana de C: perpendicular a AB. Altura de A: ligar A ao ponto médio de BC.' },
      { id: 'bisectors', label: 'Nas duas construções, basta construir uma bissetriz angular no vértice indicado.' },
      { id: 'midpoints', label: 'Nas duas construções, basta ligar o vértice ao ponto médio do lado oposto.' },
    ],
    correctId: 'correct',
    explanation: 'Mediana é vértice → ponto médio do lado oposto. Altura é vértice → reta perpendicular ao lado oposto (ou ao seu prolongamento).',
  },
  {
    id: 'q5-ramp',
    kind: 'single',
    title: 'Questão 5 · O erro de Gimli',
    subtitle: 'Semelhança de triângulos',
    prompt: 'Após 2 m de rampa, a altura é 1 m. Desse ponto até o topo ainda faltam 6 m de rampa. Por que 2/1 = 6/h está errado e qual é h?',
    room: {
      id: 'potions-ramp',
      name: 'Aula de Poções da Rampa',
      mnemonic: 'Só misture lados correspondentes de triângulos completos.',
    },
    figure: {
      kind: 'ramp-similarity',
      anchors: [
        { id: 'small-ramp-2', label: 'rampa pequena: 2 m' },
        { id: 'remaining-ramp-6', label: 'trecho restante: 6 m' },
        { id: 'small-height-1', label: 'altura pequena: 1 m' },
        { id: 'large-height-h', label: 'altura total: h' },
      ],
    },
    hints: hints(
      'Identifique os dois triângulos completos antes de escrever qualquer proporção.',
      'Lados correspondentes precisam ocupar a mesma função nos dois triângulos semelhantes.',
      'Os 6 m são só o trecho restante; a hipotenusa grande é a rampa inteira.',
    ),
    grimoire: [
      { id: 'q5-given', phase: 'given', statement: 'Triângulo pequeno: hipotenusa 2 e altura 1; ainda restam 6 na mesma rampa.', dependsOn: [] },
      { id: 'q5-property', phase: 'property', statement: 'Triângulos semelhantes exigem lados completos correspondentes.', dependsOn: ['q5-given'] },
      { id: 'q5-whole', phase: 'property', statement: 'A hipotenusa do triângulo grande é 2+6=8.', dependsOn: ['q5-property'] },
      { id: 'q5-conclusion', phase: 'conclusion', statement: '2/1=8/h, então h=4.', dependsOn: ['q5-whole'] },
    ],
    skillIds: ['triangles'],
    masteryDimensions: ['application', 'justification', 'transfer'],
    options: [
      { id: 'correct', label: 'Os 6 m são só o trecho restante. A hipotenusa do triângulo grande mede 2+6=8 m. Logo 2/1 = 8/h e h=4 m.' },
      { id: 'three', label: 'A proporção 2/1 = 6/h está correta; portanto h=3 m.' },
      { id: 'seven', label: 'A rampa grande mede 7 m porque somamos 6 m com a altura de 1 m; então h=3,5 m.' },
      { id: 'angle', label: 'Não é possível resolver sem conhecer numericamente o ângulo θ.' },
    ],
    correctId: 'correct',
    explanation: 'Gimli comparou a hipotenusa do triângulo pequeno com apenas o pedaço final da hipotenusa maior. O correspondente de 2 m é a rampa inteira: 2+6=8 m. Assim, 2/8 = 1/h e h=4.',
  },
  {
    id: 'q6-isosceles',
    kind: 'single',
    title: 'Questão 6 · Isósceles com paralelas',
    subtitle: 'Boss da avaliação',
    prompt: 'No isósceles ABC, AB=AC e P está no interior de BC. Por P traçam-se paralelas a AB e AC, encontrando AC em D e AB em E. Qual fechamento prova que o paralelogramo AEPD tem perímetro AB+AC?',
    room: {
      id: 'isosceles-chamber',
      name: 'Câmara do Paralelogramo Isósceles',
      mnemonic: 'Reconheça o paralelogramo, produza semelhança e feche com AB=AC.',
    },
    figure: {
      kind: 'isosceles-parallelogram',
      anchors: [
        { id: 'pe-parallel-ac', label: 'PE ∥ AC' },
        { id: 'pd-parallel-ab', label: 'PD ∥ AB' },
        { id: 'isosceles-sides', label: 'AB=AC' },
      ],
    },
    hints: hints(
      'Reconheça primeiro qual quadrilátero as duas paralelas formam.',
      'As paralelas também criam triângulos semelhantes; use isso para comparar segmentos.',
      'Mostre AD=BE e reescreva AE+AD como AE+BE=AB.',
    ),
    grimoire: [
      { id: 'q6-given', phase: 'given', statement: 'AB=AC; PE ∥ AC; PD ∥ AB.', dependsOn: [] },
      { id: 'q6-parallelogram', phase: 'property', statement: 'AEPD é paralelogramo.', dependsOn: ['q6-given'] },
      { id: 'q6-similarity', phase: 'property', statement: 'As paralelas geram semelhanças que fornecem AD=BE.', dependsOn: ['q6-given'] },
      { id: 'q6-sum', phase: 'property', statement: 'AE+AD=AE+BE=AB.', dependsOn: ['q6-similarity'] },
      { id: 'q6-conclusion', phase: 'conclusion', statement: 'Perímetro=2(AE+AD)=2AB=AB+AC.', dependsOn: ['q6-parallelogram', 'q6-sum'] },
    ],
    skillIds: ['parallelogram-characterization', 'isosceles-theorem'],
    masteryDimensions: ['application', 'justification', 'reproduction', 'transfer'],
    options: [
      { id: 'correct', label: 'AEPD é paralelogramo, então P=2(AE+AD). Pelas semelhanças geradas pelas paralelas, AD=BE; logo AE+AD=AE+BE=AB. Como AB=AC, P=2AB=AB+AC.' },
      { id: 'appearance', label: 'Como o desenho é simétrico, AE=AD automaticamente; então o perímetro é AB+AC.' },
      { id: 'all-equal', label: 'Todo paralelogramo formado dentro de um isósceles é um losango, portanto todos os lados são iguais.' },
      { id: 'base', label: 'O perímetro do paralelogramo é sempre igual a 2·BC, independentemente da posição de P.' },
    ],
    correctId: 'correct',
    explanation: 'O ponto-chave é provar AD=BE por semelhança usando as paralelas. Assim, AE+AD=AB e o perímetro do paralelogramo vale 2AB=AB+AC.',
  },
];

export function validateEvaluationCastle(
  questions: EvaluationCastleQuestion[] = EVALUATION_CASTLE_QUESTIONS,
): string[] {
  const errors: string[] = [];
  const knownSkills = new Set(skills.map((skill) => skill.id));
  const questionIds = new Set<string>();
  const roomIds = new Set<EvaluationRoomId>();

  for (const question of questions) {
    if (questionIds.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    questionIds.add(question.id);

    if (roomIds.has(question.room.id)) errors.push(`duplicate room id: ${question.room.id}`);
    roomIds.add(question.room.id);

    const tiers = question.hints.map((hint) => hint.tier);
    if (tiers.join(',') !== '1,2,3') errors.push(`${question.id}: hint tiers must be 1,2,3`);
    if (question.figure.anchors.length === 0) errors.push(`${question.id}: figure requires anchors`);

    for (const skillId of question.skillIds) {
      if (!knownSkills.has(skillId)) errors.push(`${question.id}: unknown skill ${skillId}`);
    }

    const seenSteps = new Set<string>();
    const phases = new Set<ProofGrimoireStep['phase']>();
    for (const step of question.grimoire) {
      phases.add(step.phase);
      for (const dependency of step.dependsOn) {
        if (!seenSteps.has(dependency)) errors.push(`${question.id}: future or missing dependency ${dependency}`);
      }
      seenSteps.add(step.id);
    }
    for (const phase of ['given', 'property', 'conclusion'] as const) {
      if (!phases.has(phase)) errors.push(`${question.id}: missing grimoire phase ${phase}`);
    }
  }

  const actualOrder = questions.map((question) => question.room.id);
  if (actualOrder.join('|') !== EVALUATION_ROOM_ORDER.join('|')) {
    errors.push('room order does not match approved memory-palace sequence');
  }

  return errors;
}
