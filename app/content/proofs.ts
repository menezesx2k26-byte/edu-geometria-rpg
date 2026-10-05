import type { Proof } from "../types/geometry";

const f = String.raw;

export const proofs: Proof[] = [
  {
    id: "vertical-angles-proof",
    title: "Ângulos opostos pelo vértice",
    skillId: "segments-angles",
    statement: "Ângulos opostos pelo vértice são congruentes.",
    formula: f`\angle AOB\cong\angle COD`,
    badge: "proposition",
    steps: [
      {
        id: "opv-1",
        dependsOn: [],
        kind: "hypothesis",
        label: "Par linear I",
        formula: f`m(\angle AOB)+m(\angle BOD)=180^\circ`,
        explanation:
          "A e D estão em semirretas opostas; por isso os ângulos adjacentes formam um ângulo raso.",
      },
      {
        id: "opv-2",
        dependsOn: [],
        kind: "hypothesis",
        label: "Par linear II",
        formula: f`m(\angle COD)+m(\angle BOD)=180^\circ`,
        explanation: "C e B também estão em semirretas opostas.",
      },
      {
        id: "opv-3",
        dependsOn: ["opv-1", "opv-2"],
        kind: "inference",
        label: "Subtração legítima",
        formula: f`m(\angle AOB)=m(\angle COD)`,
        explanation:
          "Subtraímos a mesma quantidade m(∠BOD) dos dois membros das duas igualdades.",
      },
      {
        id: "opv-4",
        dependsOn: ["opv-3"],
        kind: "conclusion",
        label: "Conclusão",
        formula: f`\angle AOB\cong\angle COD`,
        explanation: "Ângulos com a mesma medida são congruentes.",
      },
    ],
  },
  {
    id: "isosceles-base-proof",
    title: "Ângulos da base no isósceles",
    skillId: "isosceles",
    statement: "Em um triângulo isósceles, os ângulos da base são congruentes.",
    formula: f`AB\cong AC\Rightarrow\angle ABC\cong\angle BCA`,
    badge: "theorem",
    steps: [
      {
        id: "iso-1",
        dependsOn: [],
        kind: "hypothesis",
        label: "Hipótese",
        formula: f`AB\cong AC`,
        explanation: "O triângulo ABC é isósceles de base BC.",
      },
      {
        id: "iso-2",
        dependsOn: [],
        kind: "construction",
        label: "Construção",
        formula: f`AD\text{ é bissetriz de }\angle BAC`,
        explanation:
          "Traçamos a bissetriz interna do ângulo principal, encontrando BC em D.",
      },
      {
        id: "iso-3",
        dependsOn: ["iso-2"],
        kind: "known-result",
        label: "Reflexividade",
        formula: f`AD\cong AD`,
        explanation: "O segmento AD é lado comum aos dois triângulos.",
      },
      {
        id: "iso-4",
        dependsOn: ["iso-2"],
        kind: "known-result",
        label: "Definição de bissetriz",
        formula: f`\angle BAD\cong\angle DAC`,
        explanation:
          "A construção divide o ângulo principal em duas partes congruentes.",
      },
      {
        id: "iso-5",
        dependsOn: ["iso-1", "iso-3", "iso-4"],
        kind: "inference",
        label: "Critério LAL",
        formula: f`\triangle BAD\cong\triangle CAD`,
        explanation:
          "Lados AB ↔ AC, AD ↔ AD e o ângulo compreendido BAD ↔ CAD.",
      },
      {
        id: "iso-6",
        dependsOn: ["iso-5"],
        kind: "conclusion",
        label: "Correspondência",
        formula: f`\angle ABD\cong\angle ACD`,
        explanation:
          "B ↔ C na congruência. Como D pertence a BC, esses são precisamente os ângulos da base ∠ABC e ∠BCA.",
      },
    ],
  },
  {
    id: "ala-indirect-proof",
    title: "Teorema ALA",
    skillId: "ala",
    statement:
      "Um lado e os dois ângulos a ele adjacentes, ordenadamente congruentes, implicam triângulos congruentes.",
    formula: f`AB\cong DE,\;\angle A\cong\angle D,\;\angle B\cong\angle E\Rightarrow\triangle ABC\cong\triangle DEF`,
    badge: "theorem",
    steps: [
      {
        id: "ala-1",
        dependsOn: [],
        kind: "hypothesis",
        label: "Hipóteses",
        formula: f`AB\cong DE,\quad\angle A\cong\angle D,\quad\angle B\cong\angle E`,
        explanation:
          "O lado AB está entre os dois ângulos conhecidos; o correspondente é DE.",
      },
      {
        id: "ala-2",
        dependsOn: ["ala-1"],
        kind: "construction",
        label: "Suposição indireta",
        formula: f`AC<DF`,
        explanation:
          "Se os lados não fossem congruentes, um seria menor. Sem perda de generalidade, supomos AC < DF.",
      },
      {
        id: "ala-3",
        dependsOn: ["ala-2"],
        kind: "construction",
        label: "Marcação auxiliar",
        formula: f`F'\in\overrightarrow{DF}\quad\text{e}\quad DF'\cong AC`,
        explanation:
          "Marcamos F′ na semirreta DF com a mesma distância de D que C tem de A.",
      },
      {
        id: "ala-4",
        dependsOn: ["ala-3"],
        kind: "known-result",
        label: "Postulado LAL",
        formula: f`\triangle BAC\cong\triangle EDF'`,
        explanation:
          "BA ↔ ED, AC ↔ DF′ e o ângulo compreendido A ↔ D são congruentes.",
      },
      {
        id: "ala-5",
        dependsOn: ["ala-4"],
        kind: "inference",
        label: "Ângulos correspondentes",
        formula: f`\angle ABC\cong\angle DEF'`,
        explanation:
          "Pela correspondência B ↔ E da congruência obtida por LAL.",
      },
      {
        id: "ala-6",
        dependsOn: ["ala-5"],
        kind: "inference",
        label: "Contradição",
        formula: f`\angle DEF'\cong\angle DEF`,
        explanation:
          "A hipótese também dá ∠ABC ≅ ∠DEF. Se F′ ≠ F, duas semirretas distintas EF′ e EF, no mesmo semiplano, formariam exatamente o mesmo ângulo com ED — contrariando a unicidade da semirreta que realiza uma medida angular dada.",
      },
      {
        id: "ala-7",
        dependsOn: ["ala-6"],
        kind: "inference",
        label: "A suposição falha",
        formula: f`F'=F\quad\Rightarrow\quad AC\cong DF`,
        explanation:
          "Logo, não pode ocorrer AC < DF. O caso DF < AC é análogo; resta AC ≅ DF.",
      },
      {
        id: "ala-8",
        dependsOn: ["ala-7"],
        kind: "conclusion",
        label: "LAL final",
        formula: f`\triangle ABC\cong\triangle DEF`,
        explanation:
          "Agora AB ↔ DE, AC ↔ DF e o ângulo compreendido A ↔ D são congruentes.",
      },
    ],
  },
  {
    id: "lll-classical-proof",
    title: "Teorema LLL",
    skillId: "lll",
    statement:
      "Três lados ordenadamente congruentes implicam triângulos congruentes.",
    formula: f`AB\cong DE,\;AC\cong DF,\;BC\cong EF\Rightarrow\triangle ABC\cong\triangle DEF`,
    badge: "theorem",
    complementary: true,
    steps: [
      {
        id: "lll-1",
        dependsOn: [],
        kind: "hypothesis",
        label: "Hipóteses",
        formula: f`AB\cong DE,\quad AC\cong DF,\quad BC\cong EF`,
        explanation: "A ↔ D, B ↔ E, C ↔ F; os triângulos não são degenerados.",
      },
      {
        id: "lll-2",
        dependsOn: ["lll-1"],
        kind: "construction",
        label: "Cópia por ALA",
        formula: f`\triangle ABG\cong\triangle DEF`,
        explanation:
          "Copiamos os ângulos em D e E no mesmo semiplano de C em relação a AB. As semirretas encontram-se em G; por ALA, AG = DF e BG = EF. A existência da interseção segue da soma dos ângulos do triângulo DEF ser menor que 180°.",
      },
      {
        id: "lll-3",
        dependsOn: ["lll-1", "lll-2"],
        kind: "inference",
        label: "Distâncias iguais",
        formula: f`AC=AG,\quad BC=BG`,
        explanation: "Transitividade das medidas correspondentes.",
      },
      {
        id: "lll-4",
        dependsOn: ["lll-3"],
        kind: "inference",
        label: "Se C e G fossem distintos",
        formula: f`A,B\in\text{mediatriz de }CG`,
        explanation:
          "Se C ≠ G, os triângulos ACG e BCG são isósceles. Nos casos não colineares, tome X como ponto médio de CG. Os ângulos da base em C e G são congruentes; LAL usa AC = AG, CX = GX e esses ângulos para obter △ACX ≅ △AGX (analogamente para B). Os ângulos em X são congruentes e suplementares, logo retos. Logo A e B pertencem à mediatriz de CG. Se algum deles for colinear com C e G, as distâncias iguais o tornam o próprio ponto médio, que também pertence à mediatriz.",
      },
      {
        id: "lll-5",
        dependsOn: ["lll-4"],
        kind: "inference",
        label: "Contradição de semiplanos",
        formula: f`C=G`,
        explanation:
          "Como A ≠ B, a reta AB seria a mediatriz de CG. Seus extremos C e G ficariam em semiplanos opostos de AB, contrariando a construção no mesmo semiplano. Portanto C = G.",
      },
      {
        id: "lll-6",
        dependsOn: ["lll-2", "lll-5"],
        kind: "conclusion",
        label: "Conclusão",
        formula: f`\triangle ABC\cong\triangle DEF`,
        explanation:
          "Substituímos G por C na congruência por ALA. A prova não pressupõe que um segmento auxiliar fique dentro de um ângulo.",
      },
    ],
  },
  {
    id: "special-cevian-proof",
    title: "Bissetriz principal no isósceles",
    skillId: "isosceles-cevians",
    statement:
      "No triângulo isósceles, a bissetriz do vértice principal também é mediana e altura.",
    formula: f`\text{bissetriz}=\text{mediana}=\text{altura}`,
    badge: "theorem",
    steps: [
      {
        id: "sp-1",
        dependsOn: [],
        kind: "hypothesis",
        label: "Isósceles",
        formula: f`AB\cong AC`,
        explanation: "ABC é isósceles de base BC.",
      },
      {
        id: "sp-2",
        dependsOn: [],
        kind: "hypothesis",
        label: "Bissetriz",
        formula: f`\angle BAD\cong\angle CAD`,
        explanation:
          "D pertence ao segmento BC; AD é a bissetriz interna e divide o ângulo principal em partes congruentes.",
      },
      {
        id: "sp-3",
        dependsOn: ["sp-2"],
        kind: "known-result",
        label: "Reflexividade",
        formula: f`AD\cong AD`,
        explanation: "AD é lado comum.",
      },
      {
        id: "sp-4",
        dependsOn: ["sp-1", "sp-2", "sp-3"],
        kind: "inference",
        label: "LAL",
        formula: f`\triangle ABD\cong\triangle ACD`,
        explanation: "A correspondência é A ↔ A, B ↔ C, D ↔ D.",
      },
      {
        id: "sp-5",
        dependsOn: ["sp-4"],
        kind: "inference",
        label: "Ponto médio",
        formula: f`BD\cong DC`,
        explanation:
          "Lados correspondentes. Como D pertence a BC, D é ponto médio; logo AD é mediana.",
      },
      {
        id: "sp-6",
        dependsOn: ["sp-4"],
        kind: "inference",
        label: "Ângulos adjacentes",
        formula: f`\angle ADB\cong\angle ADC`,
        explanation:
          "São ângulos correspondentes e, como B, D, C são colineares, também são suplementares.",
      },
      {
        id: "sp-7",
        dependsOn: ["sp-6"],
        kind: "inference",
        label: "Cada ângulo é reto",
        formula: f`2m(\angle ADB)=180^\circ\Rightarrow m(\angle ADB)=90^\circ`,
        explanation:
          "Dois ângulos congruentes cuja soma é 180° medem 90° cada.",
      },
      {
        id: "sp-8",
        dependsOn: ["sp-5", "sp-7"],
        kind: "conclusion",
        label: "Resultado desbloqueado",
        formula: f`AD\perp BC`,
        explanation:
          "AD é também altura. A coincidência vale nesta configuração especial, não em um triângulo genérico.",
      },
    ],
  },
];
