import type { Exercise, Question } from "../types/geometry";

const f = String.raw;

const originalQuestions: Question[] = [
  {
    id: "q-median",
    skillId: "median-bisector-altitude",
    kind: "hypothesis",
    prompt: "Qual hipótese caracteriza AD como mediana relativa a A?",
    options: ["AD ⟂ BC", "BD ≅ DC", "∠BAD ≅ ∠DAC"],
    correctIndex: 1,
    explanation:
      "Mediana liga um vértice ao ponto médio do lado oposto; portanto D deve dividir BC em segmentos congruentes.",
  },
  {
    id: "q-lal",
    skillId: "lal",
    kind: "criterion",
    prompt:
      "Você conhece dois lados e o ângulo ENTRE eles. Qual critério pode usar?",
    options: ["ALA", "LAL", "LLL"],
    correctIndex: 1,
    explanation:
      "O ângulo compreendido entre os dois lados é exatamente a configuração LAL.",
  },
  {
    id: "q-correspondence",
    skillId: "congruence",
    kind: "correspondence",
    prompt: "Se △ABC ≅ △DEF, qual lado corresponde a AC?",
    options: ["DE", "EF", "DF"],
    correctIndex: 2,
    explanation: "A ↔ D e C ↔ F; logo AC ↔ DF.",
  },
  {
    id: "q-isosceles",
    skillId: "isosceles",
    kind: "conclusion",
    prompt: "Em △ABC, AB ≅ AC. Qual resultado já pode ser usado?",
    options: ["∠A ≅ ∠B", "∠B ≅ ∠C", "BC ≅ AC"],
    correctIndex: 1,
    explanation:
      "Os ângulos opostos aos lados AB e AC são, respectivamente, ∠C e ∠B.",
  },
  {
    id: "q-segment",
    skillId: "fundamentals",
    kind: "logical-error",
    prompt: "Qual escrita distingue corretamente objeto geométrico e medida?",
    options: ["‾AB = 2 cm", "AB = 2 cm", "A = B = 2 cm"],
    correctIndex: 1,
    explanation:
      "Neste curso, AB denota a medida; ‾AB denota o segmento como objeto.",
  },
  {
    id: "q-bisector",
    skillId: "median-bisector-altitude",
    kind: "true-false",
    prompt: "AD é bissetriz. Então BD ≅ DC, em qualquer triângulo.",
    options: ["Verdadeiro", "Falso"],
    correctIndex: 1,
    explanation:
      "Bissetriz divide o ângulo. Ela só coincide com a mediana em configurações especiais, como a ceviana principal do isósceles.",
  },
  {
    id: "q-altitude",
    skillId: "median-bisector-altitude",
    kind: "true-false",
    prompt: "Uma altura pode ficar fora do triângulo.",
    options: ["Verdadeiro", "Falso"],
    correctIndex: 0,
    explanation:
      "Em triângulos obtusângulos, as alturas relativas a vértices agudos encontram a reta suporte fora do lado.",
  },
  {
    id: "q-opv",
    skillId: "segments-angles",
    kind: "calculation",
    prompt:
      "Dois ângulos opostos pelo vértice medem (3x + 5)° e 80°. Quanto vale x?",
    options: ["15", "20", "25"],
    correctIndex: 2,
    explanation: "OPV são congruentes: 3x + 5 = 80, então 3x = 75 e x = 25.",
  },
  {
    id: "q-congruence-similarity",
    skillId: "congruence",
    kind: "comparison",
    prompt: "Qual afirmação distingue congruência de semelhança?",
    options: [
      "Congruência preserva tamanho; semelhança pode mudar a escala.",
      "Semelhança preserva tamanho; congruência não.",
      "São sinônimos.",
    ],
    correctIndex: 0,
    explanation:
      "Triângulos congruentes têm lados correspondentes com a mesma medida; semelhantes podem ter fator de escala diferente de 1.",
  },
  {
    id: "q-drawing",
    skillId: "fundamentals",
    kind: "logical-error",
    prompt:
      "Um lado parece maior no desenho. Isso basta para concluir que sua medida é maior?",
    options: [
      "Sim, se a figura estiver colorida.",
      "Sim, sempre.",
      "Não; marcas e hipóteses justificam.",
    ],
    correctIndex: 2,
    explanation: "O desenho auxilia; as marcas e hipóteses justificam.",
  },
];

const classifications: Record<string, Question["category"]> = {
  "q-median": "C",
  "q-lal": "A",
  "q-correspondence": "D",
  "q-isosceles": "D",
  "q-segment": "A",
  "q-bisector": "E",
  "q-altitude": "A",
  "q-opv": "D",
  "q-congruence-similarity": "A",
  "q-drawing": "E",
};
const addedQuestions: Question[] = [
  {
    id: "f-vertices",
    skillId: "fundamentals",
    kind: "hypothesis",
    category: "B",
    figure: "triangle",
    prompt: "Na figura, quais letras identificam pontos (e não medidas)?",
    options: ["A, B e C", "AB, BC e CA", "90°, 60° e 30°"],
    correctIndex: 0,
    explanation:
      "As letras nos vértices nomeiam pontos. Pares de letras podem nomear segmentos ou suas medidas conforme a notação.",
  },
  {
    id: "f-side",
    skillId: "fundamentals",
    kind: "correspondence",
    category: "B",
    figure: "triangle",
    prompt: "Na figura, qual segmento une os pontos B e C?",
    options: ["‾AB", "‾AC", "‾BC"],
    correctIndex: 2,
    explanation: "Os extremos B e C determinam o segmento ‾BC.",
  },
  {
    id: "f-no-mark",
    skillId: "fundamentals",
    kind: "logical-error",
    category: "G",
    figure: "triangle",
    prompt:
      "Este desenho não tem marcas de congruência nem medidas. Podemos concluir AB = AC?",
    options: [
      "Sim, porque o desenho parece simétrico",
      "Não, falta uma hipótese ou marca",
      "Sim, porque ambos são lados",
    ],
    correctIndex: 1,
    explanation: "A aparência da figura não autoriza igualdade de medidas.",
  },
  {
    id: "f-ticks",
    skillId: "fundamentals",
    kind: "hypothesis",
    category: "B",
    figure: "isosceles",
    prompt: "Na figura, que informação é dada pelas marcas iguais nos lados?",
    options: ["AB ≅ AC", "AB ⟂ AC", "BC ≅ AB"],
    correctIndex: 0,
    explanation:
      "Marcas iguais indicam segmentos congruentes, não perpendicularidade.",
  },
  {
    id: "f-equal-measures",
    skillId: "fundamentals",
    kind: "conclusion",
    category: "D",
    prompt: "Dados AB = 7 cm e CD = 7 cm, qual conclusão é justificada?",
    options: ["‾AB ≅ ‾CD", "A = C", "As retas AB e CD são paralelas"],
    correctIndex: 0,
    explanation:
      "Segmentos de mesma medida são congruentes; isso não determina posição.",
  },
  {
    id: "f-scale",
    skillId: "fundamentals",
    kind: "logical-error",
    category: "G",
    prompt:
      "Uma figura foi ampliada na tela. As medidas informadas nas hipóteses mudam?",
    options: [
      "Sim, dobram",
      "Não; o desenho é uma representação",
      "Sim, viram ângulos",
    ],
    correctIndex: 1,
    explanation:
      "Tamanho na tela não altera as medidas declaradas no problema.",
  },
  {
    id: "f-given",
    skillId: "fundamentals",
    kind: "hypothesis",
    category: "C",
    prompt: "O enunciado dá AB = 4 e pede BC. O que é uma hipótese?",
    options: ["BC = 4", "AB = 4", "AB = BC"],
    correctIndex: 1,
    explanation:
      "Hipótese é informação dada; o comprimento BC não foi informado.",
  },
  {
    id: "f-counterexample",
    skillId: "fundamentals",
    kind: "logical-error",
    category: "E",
    figure: "triangle",
    prompt:
      "O aluno afirma: 'três segmentos desenhados têm a mesma medida'. O que falta à justificativa?",
    options: [
      "Uma cor mais forte",
      "Marcas, medidas ou uma propriedade demonstrada",
      "O nome da escola",
    ],
    correctIndex: 1,
    explanation: "Estar desenhado não implica igualdade de medidas.",
  },
  {
    id: "f-midpoint-given",
    skillId: "fundamentals",
    kind: "calculation",
    category: "D",
    prompt:
      "D pertence ao segmento BC; são dados BD = 3 cm e DC = 3 cm. Quanto mede BC?",
    options: ["3 cm", "6 cm", "9 cm"],
    correctIndex: 1,
    explanation: "Como D está entre B e C, BC = BD + DC = 6 cm.",
  },
  {
    id: "f-extension",
    skillId: "fundamentals",
    kind: "hypothesis",
    category: "G",
    prompt:
      "B, C e D estão nessa ordem em uma reta, com BC = 2 e CD = 5. Qual medida é verificável?",
    options: ["BD = 7", "BD = 3", "BC = CD"],
    correctIndex: 0,
    explanation: "C está entre B e D: BD = BC + CD = 7.",
  },
  {
    id: "q-triangle",
    skillId: "triangles",
    kind: "hypothesis",
    category: "C",
    prompt: "Que condição evita um triângulo degenerado?",
    options: [
      "Três pontos não colineares",
      "Três pontos quaisquer, inclusive colineares",
      "Três pontos iguais",
    ],
    correctIndex: 0,
    explanation: "Vértices de um triângulo são três pontos não colineares.",
  },
  {
    id: "q-cevian",
    skillId: "cevians",
    kind: "hypothesis",
    category: "B",
    figure: "median",
    prompt:
      "D pertence ao lado BC. Qual segmento liga o vértice A ao lado oposto?",
    options: ["BD", "AD", "BC"],
    correctIndex: 1,
    explanation: "AD parte de A e termina em D, no lado oposto BC.",
  },
  {
    id: "q-inverse",
    skillId: "inverse-isosceles",
    kind: "conclusion",
    category: "D",
    prompt: "Em △ABC, ∠ABC ≅ ∠BCA. Quais lados são congruentes?",
    options: ["AB ≅ AC", "AB ≅ BC", "AC ≅ BC"],
    correctIndex: 0,
    explanation: "Lados opostos aos ângulos congruentes B e C: AC e AB.",
  },
  {
    id: "q-lll",
    skillId: "lll",
    kind: "criterion",
    category: "C",
    prompt: "AB ≅ DE, AC ≅ DF e BC ≅ EF. Qual critério justifica △ABC ≅ △DEF?",
    options: ["LAL", "ALA", "LLL"],
    correctIndex: 2,
    explanation: "São dados os três pares de lados correspondentes.",
  },
  {
    id: "q-ala",
    skillId: "ala",
    kind: "criterion",
    category: "C",
    prompt: "∠ABC ≅ ∠DEF, ∠BAC ≅ ∠EDF e AB ≅ DE. Qual critério se aplica?",
    options: ["ALA", "LAL", "LLL"],
    correctIndex: 0,
    explanation:
      "AB/DE é o lado compreendido entre os dois ângulos conhecidos.",
  },
  {
    id: "q-special",
    skillId: "isosceles-cevians",
    kind: "conclusion",
    category: "D",
    figure: "isosceles",
    prompt:
      "AB ≅ AC. Traçamos a bissetriz interna AD, com D em BC. O que também podemos provar?",
    options: ["BD ≅ DC e AD ⟂ BC", "AB ⟂ AC", "AD ≅ BC"],
    correctIndex: 0,
    explanation:
      "Por LAL, △ABD ≅ △ACD: D é ponto médio e os ângulos adjacentes em D são retos.",
  },
  {
    id: "q-exterior",
    skillId: "exterior-angle",
    kind: "hypothesis",
    category: "C",
    prompt:
      "A, B, D estão nessa ordem em uma reta e C está fora dela. Qual é o ângulo externo em B do triângulo ABC?",
    options: ["∠ABC", "∠CBD", "∠BAC"],
    correctIndex: 1,
    explanation:
      "BD é prolongamento de AB além de B; ∠CBD é externo e suplementar a ∠ABC.",
  },
];
const opvVariants: Question[] = Array.from({ length: 12 }, (_, i) => {
  const x = i + 8,
    coefficient = (i % 3) + 2,
    constant = (i % 5) + 3,
    measure = coefficient * x + constant;
  return {
    id: `q-opv-variant-${i + 1}`,
    skillId: "segments-angles",
    kind: "calculation",
    category: "D",
    figure: "opv",
    prompt: `A, O, D e B, O, C são colineares, com O entre os extremos. Na figura, ∠AOB mede (${coefficient}x + ${constant})° e ∠COD mede ${measure}°. Quanto vale x?`,
    options: [String(x - 2), String(x), String(x + 3)],
    correctIndex: 1,
    explanation: `Os ângulos são OPV: ${coefficient}x + ${constant} = ${measure}, portanto x = ${x}.`,
  };
});
const correspondenceVariants: Question[] = [
  "PQR/STU",
  "XYZ/LMN",
  "DEF/JKL",
].flatMap((pair, i) => {
  const [a, b] = pair.split("/");
  return [0, 1, 2].map((vertex) => ({
    id: `q-correspondence-${i}-${vertex}`,
    skillId: "congruence",
    kind: "correspondence" as const,
    category: "G" as const,
    prompt: `Se △${a} ≅ △${b}, qual vértice corresponde a ${a[vertex]}?`,
    options: b.split(""),
    correctIndex: vertex,
    explanation: `A ordem da congruência determina ${a[vertex]} ↔ ${b[vertex]}.`,
  }));
});
export const questions: Question[] = [
  ...originalQuestions.map((q) => ({ ...q, category: classifications[q.id] })),
  ...addedQuestions,
  ...opvVariants,
  ...correspondenceVariants,
];

export const exercises: Exercise[] = [
  {
    id: "board-ala",
    figure: "ala",
    title: "O encontro das duas lâminas",
    subtitle: "Exercício da lousa · ALA",
    skillId: "ala",
    difficulty: "Quest",
    introduction:
      "Nos triângulos CBA e CDE, B, C, D são colineares, com C entre B e D; A, C, E são colineares, com C entre A e E. São dados ∠CBA ≅ ∠CDE e BC ≅ CD. Avance identificando cada justificativa antes de calcular x e y.",
    steps: [
      {
        id: "ala-ex-1",
        prompt: "Que relação existe entre ∠BCA e ∠DCE?",
        options: [
          "São complementares",
          "São opostos pelo vértice e congruentes",
          "São ângulos da base",
        ],
        correctIndex: 1,
        explanation:
          "As duas retas se cruzam em C; os ângulos estão em regiões opostas pelo vértice.",
      },
      {
        id: "ala-ex-2",
        prompt:
          "Com ∠CBA ≅ ∠CDE, ∠BCA ≅ ∠DCE e BC ≅ CD, qual critério se aplica?",
        options: ["LAL", "LLL", "ALA"],
        correctIndex: 2,
        explanation: "O lado BC/CD está entre os dois ângulos conhecidos.",
      },
      {
        id: "ala-ex-3",
        prompt:
          "Na congruência △CBA ≅ △CDE, qual correspondência está correta?",
        options: [
          "C ↔ C, B ↔ D, A ↔ E",
          "C ↔ D, B ↔ C, A ↔ E",
          "C ↔ E, B ↔ D, A ↔ C",
        ],
        correctIndex: 0,
        explanation: "A ordem dos nomes registra C ↔ C, B ↔ D e A ↔ E.",
      },
      {
        id: "ala-ex-4",
        prompt: "CA ↔ CE. Se CA = 2x − 6 e CE = 22, quanto vale x?",
        formula: f`2x-6=22`,
        options: ["8", "14", "16"],
        correctIndex: 1,
        explanation: "2x = 28, portanto x = 14.",
      },
      {
        id: "ala-ex-5",
        prompt: "BA ↔ DE. Se BA = 35 e DE = 3y + 5, quanto vale y?",
        formula: f`3y+5=35`,
        options: ["10", "12", "15"],
        correctIndex: 0,
        explanation: "3y = 30, portanto y = 10.",
      },
      {
        id: "ala-ex-6",
        prompt:
          "Qual é a razão P₁/P₂ entre os perímetros dos triângulos congruentes?",
        options: ["1/2", "1", "2"],
        correctIndex: 1,
        explanation:
          "Triângulos congruentes têm todos os lados correspondentes com a mesma medida; seus perímetros são iguais.",
      },
    ],
    finalAnswer: "x = 14, y = 10 e P₁/P₂ = 1.",
  },
  {
    id: "board-lal",
    figure: "lal",
    title: "O selo do vértice F",
    subtitle: "Exercício da lousa · LAL",
    skillId: "lal",
    difficulty: "Boss Proof",
    introduction:
      "Compare △AFB e △HFR. A, F, H são colineares, com F entre A e H; B, F, R são colineares, com F entre B e R. São dados AF ≅ FH e BF ≅ FR.",
    steps: [
      {
        id: "lal-ex-1",
        prompt: "Qual par de ângulos pode ser justificado sem medir?",
        options: ["∠FAB ≅ ∠FHR", "∠AFB ≅ ∠HFR", "∠ABF ≅ ∠HRF"],
        correctIndex: 1,
        explanation: "∠AFB e ∠HFR são opostos pelo vértice.",
      },
      {
        id: "lal-ex-2",
        prompt:
          "AF ≅ FH, BF ≅ FR e ∠AFB ≅ ∠HFR. Qual critério conclui a congruência?",
        options: ["ALA", "LAL", "LLL"],
        correctIndex: 1,
        explanation:
          "O ângulo em F está entre os dois lados conhecidos de cada triângulo.",
      },
      {
        id: "lal-ex-3",
        prompt: "Qual ordem registra corretamente a congruência?",
        options: ["△AFB ≅ △HFR", "△ABF ≅ △HFR", "△FAB ≅ △HFR"],
        correctIndex: 0,
        explanation: "A ↔ H, F ↔ F e B ↔ R.",
      },
      {
        id: "lal-ex-4",
        prompt: "Qual consequência segue da correspondência?",
        options: ["AB ≅ HR", "AB ≅ FH", "AF ≅ HR"],
        correctIndex: 0,
        explanation: "O lado entre A e B corresponde ao lado entre H e R.",
      },
      {
        id: "lal-ex-5",
        prompt: "Que par de ângulos também é correspondente?",
        options: ["∠FAB ≅ ∠FHR", "∠FAB ≅ ∠HRF", "∠AFB ≅ ∠HRF"],
        correctIndex: 0,
        explanation:
          "A ↔ H, então os ângulos nesses vértices são correspondentes.",
      },
    ],
    finalAnswer: "△AFB ≅ △HFR por LAL; AB ≅ HR, ∠FAB ≅ ∠FHR e ∠ABF ≅ ∠HRF.",
  },
];
