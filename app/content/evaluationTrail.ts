
export interface EvaluationNode {
  id: string;
  title: string;
  lesson: string[];
  skillIds: string[];
}
export interface EvaluationStep {
  id: string;
  nodeIndex: number;
  variant: number;
  kind: 'vf' | 'construction' | 'proof' | 'choice' | 'number';
  prompt: string;
  options: string[];
  reasons?: string[];
  answer: string[];
  explanation: string;
  hint: string;
  effect?: string;
  shape?: string | undefined;
}

export const evaluationNodes: EvaluationNode[] = [
  { id: 'fundamentos', title: 'Fundamentos sob pressão', skillIds: ['fundamentals'], lesson: [
    'Uma definição diz o que caracteriza uma figura. Um quadrado tem dois pares de lados opostos paralelos, mas um paralelogramo não precisa ter ângulos retos nem quatro lados congruentes.',
    'Usamos a definição inclusiva: isósceles tem pelo menos dois lados congruentes. Portanto um equilátero também é isósceles. Nos materiais consultados a convenção de trapézio não ficou inequívoca: escolha abaixo a adotada em sua aula. A trilha explicita a escolha e não a atribui ao professor.',
    'Para refutar “todo”, basta um contraexemplo que satisfaz a hipótese e falha na conclusão. As diagonais de um losango são perpendiculares; essa propriedade se justifica por congruência, não pela aparência.' ] },
  { id: 'cevianas', title: 'Cevianas na mão', skillIds: ['cevians'], lesson: [
    'Mediana: segmento que liga um vértice ao ponto médio do lado oposto. Primeiro identifique esse lado, depois construa seu ponto médio e una-o ao vértice.',
    'Altura: segmento perpendicular do vértice à reta que contém o lado oposto. O pé pode estar no prolongamento do lado. Ponto médio e perpendicularidade são condições diferentes.',
    'Você construirá a mediana de C e a altura de A. Depois fará a construção em um triângulo obtusângulo com novos nomes.' ] },
  { id: 'diagonais', title: 'Diagonais do paralelogramo', skillIds: ['ala'], lesson: [
    'DADO: ABCD é um paralelogramo; suas diagonais se encontram em O. TESE: AO=CO e BO=DO.',
    'As paralelas fornecem ângulos alternos internos congruentes. Os lados opostos de um paralelogramo são congruentes. Escolha triângulos que incluam os segmentos que deseja comparar.',
    'Uma prova precisa ligar dado, propriedade e conclusão. A figura pode ser girada sem alterar essas relações.' ] },
  { id: 'desigualdade', title: 'Desigualdade no quadrilátero', skillIds: ['triangles'], lesson: [
    'DADO: quadrilátero simples e não degenerado ABCD. TESE: AC+BD < AB+BC+CD+DA.',
    'Em um triângulo não degenerado cada lado é estritamente menor que a soma dos outros dois. As diagonais criam quatro oportunidades de aplicar essa propriedade.',
    'Compare cada diagonal com os dois caminhos pelos lados. Somar as quatro desigualdades conta cada lado duas vezes. Divida os dois membros por 2.' ] },
  { id: 'rampa', title: 'O erro de Gimli', skillIds: ['triangles'], lesson: [
    'Dois triângulos retângulos sobre a mesma rampa têm o mesmo ângulo de inclinação, logo são semelhantes por AA.',
    'Antes de montar uma proporção, decida o que é parte e o que é todo. O trecho restante da rampa não é um lado completo do triângulo maior.',
    'Correspondência: hipotenusa pequena ↔ hipotenusa grande; altura pequena ↔ altura grande. Você diagnosticará a proposta de Gimli antes de calcular a altura.' ] },
  { id: 'boss', title: 'Boss da avaliação', skillIds: ['isosceles'], lesson: [
    'DADO: ABC é isósceles com AB=AC. P está no interior de BC. Por P, a paralela a AC encontra AB em E, e a paralela a AB encontra AC em D.',
    'TESE: AEPD é um paralelogramo e seu perímetro é AB+AC. O ponto precisa estar no interior da base: nos extremos a figura degenera.',
    'Plano: justificar os dois pares de paralelas, comparar um triângulo menor com o original e reescrever o perímetro usando comprimentos já demonstrados.' ] },
];

export function generateRamp(seed: number) {
  if (!Number.isSafeInteger(seed) || seed < 0) throw new Error('A variante da rampa precisa ser um inteiro não negativo.');
  const small = seed === 0 ? 2 : 3 + seed % 4;
  const height = seed === 0 ? 1 : 1 + seed % (small - 1);
  const scale = seed === 0 ? 4 : 2 + seed % 4;
  const whole = small * scale;
  return { small, remaining: whole - small, whole, height, solution: height * whole / small };
}

const names = [['A', 'B', 'C', 'D', 'O'], ['R', 'S', 'T', 'U', 'I'], ['K', 'L', 'M', 'N', 'J']] as const;
export function evaluationNames(variant: number) { return names[variant % names.length]!; }

// Author only the mathematical contract; response validation and rendering are separate.
export function getEvaluationSteps(nodeIndex: number, variant: number): EvaluationStep[] {
  const steps: Omit<EvaluationStep, 'id' | 'nodeIndex' | 'variant'>[] = [];
  const add = (kind: EvaluationStep['kind'], prompt: string, options: string[], correct: string, explanation: string, hint: string, effect?: string) => {
    steps.push({ kind, prompt, options, answer: [correct], explanation, hint, ...(effect ? { effect } : {}) });
  };
  const [a, b, c, d, o] = evaluationNames(variant);
  if (nodeIndex === 0) {
    const assertions = variant === 0 ? [
      ['Todo quadrado é um paralelogramo.', 'V', 'Há dois pares de lados opostos paralelos.', 'Ângulos retos, por si sós, dispensam verificar os lados.', 'square'],
      ['Todo paralelogramo é um quadrado.', 'F', 'Contraexemplo: retângulo de lados 4 e 2.', 'Um quadrado de lado 2 refuta a afirmação.', 'rectangle'],
      ['Todo triângulo equilátero é isósceles.', 'V', 'Três lados congruentes incluem pelo menos dois.', 'Isósceles significa exatamente dois lados congruentes nesta trilha.', 'equilateral'],
      ['Todo trapézio é um paralelogramo.', 'F', 'Contraexemplo: trapézio com exatamente um par de lados paralelos.', 'Um paralelogramo prova que todo trapézio tem dois pares paralelos.', 'trapezoid'],
      ['Em um losango as diagonais são perpendiculares.', 'V', 'As diagonais bissetam-se; dois triângulos adjacentes são congruentes por LLL, e os ângulos adjacentes iguais somam 180°.', 'As diagonais de qualquer paralelogramo são perpendiculares.', 'rhombus'],
    ] : [
      [`Um retângulo ${variant + 4} × ${variant + 2} é necessariamente quadrado.`, 'F', 'Os lados adjacentes têm comprimentos distintos.', 'Ter ângulos retos obriga os quatro lados a serem congruentes.', 'rectangle'],
      ['Um quadrado girado continua tendo dois pares de lados opostos paralelos.', 'V', 'Girar a figura preserva paralelismo.', 'A orientação na tela define o paralelismo.', 'square'],
      [`Um triângulo de lados ${variant + 3}, ${variant + 3}, ${variant + 3} também é isósceles.`, 'V', 'Ele tem pelo menos dois lados congruentes.', 'Equilátero e isósceles são classes disjuntas na definição inclusiva.', 'equilateral'],
      ['Existe trapézio que não é paralelogramo, nas duas convenções.', 'V', 'Um quadrilátero com exatamente um par de lados paralelos pertence às duas definições de trapézio.', 'Todo quadrilátero com um par de paralelas tem dois pares.', 'trapezoid'],
      ['Um losango girado pode perder a perpendicularidade das diagonais.', 'F', 'Rotação preserva ângulos, inclusive os retos.', 'O cruzamento vertical na tela garante a propriedade.', 'rhombus'],
    ];
    for (const [prompt, truth, reason, wrong, shape] of assertions) steps.push({ kind: 'vf', prompt: prompt!, options: ['Verdadeiro', 'Falso'], reasons: [reason!, wrong!], answer: [truth === 'V' ? 'Verdadeiro' : 'Falso', reason!], explanation: reason!, hint: 'Verifique a definição; se for falsa, procure uma figura que satisfaça a hipótese e falhe na conclusão.', shape });
  } else if (nodeIndex === 1) {
    const m = variant === 0 ? 'M' : variant === 1 ? 'N' : 'F';
    add('construction', `Selecione o lado oposto ao vértice ${c}.`, [`${a}${b}`, `${a}${c}`, `${b}${c}`], `${a}${b}`, `O lado ${a}${b} não contém ${c}.`, 'O lado oposto não contém o vértice escolhido.', 'opposite');
    add('construction', `Construa ${m} no lado ${a}${b}. Qual condição marca seu ponto médio?`, [`${a}${m}=${m}${b}`, `${m}${c} perpendicular a ${a}${b}`, `${a}${m}=2${m}${b}`], `${a}${m}=${m}${b}`, `${m} pertence a ${a}${b} e divide esse segmento em dois segmentos congruentes.`, 'Ponto médio exige pertencimento ao segmento e igualdade das duas partes.', 'midpoint');
    add('construction', `Trace a mediana relativa a ${c}.`, [`Unir ${c} a ${m}`, `Unir ${a} a ${m}`, `Traçar por ${c} uma paralela a ${a}${b}`], `Unir ${c} a ${m}`, `O segmento ${c}${m} liga o vértice ao ponto médio do lado oposto.`, 'Use o vértice indicado e o ponto médio que você construiu.', 'median');
    add('construction', `Prepare a altura relativa a ${a}: qual reta contém o lado oposto?`, [`Reta ${b}${c}`, `Reta ${a}${b}`, `Reta ${a}${c}`], `Reta ${b}${c}`, `O pé da altura pode estar na reta ${b}${c}, inclusive fora do segmento.`, 'Considere a reta inteira, não apenas o segmento visível.', 'support');
    add('construction', `Construa o pé H da perpendicular por ${a}.`, [`H na reta ${b}${c}, com ${a}H perpendicular a ${b}${c}`, `H é sempre o ponto médio de ${b}${c}`, `H é qualquer ponto do segmento ${b}${c}`], `H na reta ${b}${c}, com ${a}H perpendicular a ${b}${c}`, 'A altura é determinada pela perpendicularidade; sua posição não exige ponto médio.', 'O encontro precisa formar um ângulo reto.', 'foot');
    add('construction', 'Finalize a altura e justifique a construção.', [`Traçar ${a}H: vértice até o pé perpendicular`, `Traçar ${a}${m}: toda mediana é altura`, 'Unir os pontos médios dos lados'], `Traçar ${a}H: vértice até o pé perpendicular`, `A altura ${a}H fica ${variant ? 'no prolongamento do lado neste triângulo obtusângulo' : 'dentro do triângulo nesta configuração'}. A definição permanece a mesma.`, 'O segmento vai do vértice até o pé da perpendicular.', 'altitude');
  } else if (nodeIndex === 2) {
    add('proof', `DADO ${a}${b}${c}${d} paralelogramo. Selecione os triângulos que comparam as metades das diagonais.`, [`△${a}${b}${o} e △${c}${d}${o}`, `△${a}${b}${c} e △${a}${c}${d}`, `△${a}${b}${o} e △${b}${c}${o}`], `△${a}${b}${o} e △${c}${d}${o}`, 'Esses triângulos contêm uma metade de cada diagonal.', 'Procure pares de triângulos opostos pelo ponto de interseção.');
    add('proof', `Que dado fornece ângulos alternos internos nesses triângulos?`, [`${a}${b} ∥ ${c}${d}`, `${a}${b} ⟂ ${c}${d}`, `${a}${c}=${b}${d}`], `${a}${b} ∥ ${c}${d}`, `As diagonais são transversais às retas paralelas ${a}${b} e ${c}${d}.`, 'Use lados opostos paralelos, não diagonais iguais.');
    add('proof', 'Selecione os dois pares angulares e sua justificativa.', [`∠${b}${a}${o}=∠${d}${c}${o} e ∠${a}${b}${o}=∠${c}${d}${o}, por alternos internos`, 'Os quatro ângulos são retos porque as diagonais se cruzam', 'Todos os ângulos do paralelogramo são iguais'], `∠${b}${a}${o}=∠${d}${c}${o} e ∠${a}${b}${o}=∠${c}${d}${o}, por alternos internos`, 'Cada diagonal é uma transversal distinta ao mesmo par de paralelas.', 'Associe uma transversal a cada par de ângulos.');
    add('proof', 'Qual lado e critério completam a congruência?', [`${a}${b}=${c}${d}, lados opostos; ALA`, `${a}${o}=${c}${o}, pois é a tese; LLL`, 'Dois ângulos bastam para congruência; AA'], `${a}${b}=${c}${d}, lados opostos; ALA`, 'O lado entre os dois ângulos é congruente, portanto os triângulos são congruentes por ALA.', 'AA prova semelhança. Para congruência, inclua o lado já conhecido.');
    add('proof', 'CONCLUSÃO: quais igualdades seguem de lados correspondentes?', [`${a}${o}=${c}${o} e ${b}${o}=${d}${o}`, `${a}${c}=${b}${d}`, `${a}${o}=${b}${o}=${c}${o}=${d}${o}`], `${a}${o}=${c}${o} e ${b}${o}=${d}${o}`, `${o} pertence a ambas as diagonais e divide cada uma em partes iguais: é ponto médio de ambas.`, `${a}↔${c}, ${b}↔${d}, ${o}↔${o}. Correspondência correta é essencial.`, 'conclusion');
  } else if (nodeIndex === 3) {
    add('proof', `Aplique desigualdade triangular à diagonal ${a}${c} pelos dois caminhos.`, [`${a}${c}<${a}${b}+${b}${c} e ${a}${c}<${a}${d}+${d}${c}`, `${a}${c}>${a}${b}+${b}${c}`, `${a}${c}=${a}${b}+${b}${c}`], `${a}${c}<${a}${b}+${b}${c} e ${a}${c}<${a}${d}+${d}${c}`, 'Os triângulos ABC e ADC têm AC como lado comum; cada caminho pelos outros dois lados é maior que AC.', 'Use um triângulo de cada lado da diagonal.');
    add('proof', `Faça o mesmo para a diagonal ${b}${d}.`, [`${b}${d}<${b}${a}+${a}${d} e ${b}${d}<${b}${c}+${c}${d}`, `${b}${d}<${a}${c}`, `${b}${d}=${b}${a}+${a}${d}`], `${b}${d}<${b}${a}+${a}${d} e ${b}${d}<${b}${c}+${c}${d}`, 'Os triângulos BAD e BCD fornecem as duas desigualdades restantes.', 'Não há uma ordem universal entre as duas diagonais.');
    add('proof', 'Some as quatro desigualdades. O que resulta?', [`2(${a}${c}+${b}${d})<2(${a}${b}+${b}${c}+${c}${d}+${d}${a})`, `${a}${c}+${b}${d}<2${a}${b}`, `${a}${c}+${b}${d}=${a}${b}+${b}${c}+${c}${d}+${d}${a}`], `2(${a}${c}+${b}${d})<2(${a}${b}+${b}${c}+${c}${d}+${d}${a})`, 'Cada diagonal aparece duas vezes no primeiro membro, e cada lado aparece duas vezes no segundo.', 'Conte quantas vezes cada segmento aparece.');
    add('proof', 'Conclua preservando o sentido da desigualdade.', [`Dividir por 2 positivo: ${a}${c}+${b}${d}<${a}${b}+${b}${c}+${c}${d}+${d}${a}`, 'Dividir por 2 inverte o sinal', 'A soma transforma a desigualdade estrita em igualdade'], `Dividir por 2 positivo: ${a}${c}+${b}${d}<${a}${b}+${b}${c}+${c}${d}+${d}${a}`, 'Dividir por número positivo preserva o sinal. A soma das diagonais é menor que o perímetro.', 'Somar desigualdades estritas e dividir por um positivo preserva a desigualdade.', 'conclusion');
    add('choice', 'Por que excluímos configurações degeneradas?', ['Pontos colineares podem tornar a desigualdade triangular uma igualdade', 'A prova depende de diagonais perpendiculares', 'Somente quadrados satisfazem a tese'], 'Pontos colineares podem tornar a desigualdade triangular uma igualdade', 'A desigualdade é estrita em triângulos não degenerados. A prova não usa ângulos retos nem lados iguais.', 'Verifique as hipóteses da desigualdade triangular.');
  } else if (nodeIndex === 4) {
    const r = generateRamp(variant);
    add('choice', `Gimli propôs ${r.small}/${r.height}=${r.remaining}/h. Por que isso está errado?`, ['Comparou uma hipotenusa completa com apenas o trecho restante', 'A altura e a rampa sempre têm o mesmo comprimento', 'Não podemos usar semelhança sem conhecer o ângulo em graus'], 'Comparou uma hipotenusa completa com apenas o trecho restante', `Os ${r.remaining} m representam a parte que falta; não a hipotenusa inteira do triângulo maior.`, 'Identifique quais segmentos são lados completos de cada triângulo.', 'diagnosis');
    add('number', `Você percorreu ${r.small} m e ainda faltam ${r.remaining} m. Qual o comprimento da rampa inteira, em metros?`, [], String(r.whole), `${r.small}+${r.remaining}=${r.whole} m. Somamos comprimentos sobre a mesma reta da rampa.`, 'Some o trecho percorrido ao trecho restante.', 'whole');
    add('choice', 'Associe os lados correspondentes e justifique a semelhança.', [`Hipotenusas: ${r.small}↔${r.whole}; alturas: ${r.height}↔h; AA`, `Hipotenusas: ${r.small}↔${r.remaining}; alturas: ${r.height}↔h`, `Hipotenusa: ${r.small}↔h; altura: ${r.height}↔${r.whole}`], `Hipotenusas: ${r.small}↔${r.whole}; alturas: ${r.height}↔h; AA`, 'Ambos os triângulos são retângulos e têm o mesmo ângulo de inclinação. As hipotenusas se correspondem.', 'Diferencie o tipo de lado de seu valor numérico.', 'correspondence');
    add('proof', 'Monte a proporção pequena/grande.', [`${r.small}/${r.whole}=${r.height}/h`, `${r.small}/${r.remaining}=${r.height}/h`, `${r.small}/h=${r.height}/${r.whole}`], `${r.small}/${r.whole}=${r.height}/h`, `${r.small}h=${r.whole * r.height}. Multiplicamos em cruz lados correspondentes.`, 'Use a mesma ordem nos dois quocientes.', 'ratio');
    add('number', 'Resolva a proporção: qual a altura total h, em metros?', [], String(r.solution), `h=${r.height}×${r.whole}/${r.small}=${r.solution} m. A altura cresce na mesma razão que a hipotenusa.`, 'Isole h na igualdade obtida no passo anterior.', 'height');
  } else if (nodeIndex === 5) {
    const p = variant === 0 ? 'P' : variant === 1 ? 'Q' : 'V';
    const e = variant === 0 ? 'E' : variant === 1 ? 'F' : 'W';
    const f = variant === 0 ? 'D' : variant === 1 ? 'G' : 'Z';
    add('proof', `Onde deve ficar ${p} na base ${b}${c}?`, [`No interior de ${b}${c}`, `No vértice ${b}`, `Fora do segmento ${b}${c}`], `No interior de ${b}${c}`, 'O interior assegura um paralelogramo com lados de comprimento positivo.', 'Evite os extremos: a figura não pode degenerar.', 'interior');
    add('proof', `Justifique que ${a}${e}${p}${f} é paralelogramo.`, [`${a}${e} ∥ ${p}${f} e ${e}${p} ∥ ${f}${a}, pela construção`, `${a}${e}=${e}${p} porque parece losango`, `${e}${f} ∥ ${b}${c} por simetria`], `${a}${e} ∥ ${p}${f} e ${e}${p} ∥ ${f}${a}, pela construção`, 'Há dois pares de lados opostos paralelos; essa é a definição de paralelogramo.', 'AE está sobre AB, AD sobre AC: use as paralelas construídas.', 'parallelogram');
    add('proof', `Compare △${b}${e}${p} com △${b}${a}${c}. Qual correspondência e critério são válidos?`, [`${b}↔${b}, ${e}↔${a}, ${p}↔${c}; AA por ${e}${p} ∥ ${a}${c}`, `${b}↔${a}, ${e}↔${b}, ${p}↔${c}; LLL pela aparência`, 'Não é possível comparar triângulos de tamanhos diferentes'], `${b}↔${b}, ${e}↔${a}, ${p}↔${c}; AA por ${e}${p} ∥ ${a}${c}`, 'O ângulo em B é comum; a paralela EP a AC fornece o segundo par angular. São semelhantes por AA.', 'Use a ordem B-E-P ↔ B-A-C.', 'similarity');
    add('proof', `Como ${a}${b}=${a}${c}, que igualdade segue da semelhança?`, [`${b}${e}/${b}${a}=${e}${p}/${a}${c}, logo ${b}${e}=${e}${p}`, `${a}${e}=${a}${f} em qualquer posição de ${p}`, `${b}${p}=${p}${c} sempre`], `${b}${e}/${b}${a}=${e}${p}/${a}${c}, logo ${b}${e}=${e}${p}`, 'Os denominadores BA e AC são congruentes; portanto os numeradores BE e EP também são congruentes.', 'Escolha os lados do triângulo menor que correspondem aos lados congruentes do maior.', 'length');
    add('proof', `Reescreva o perímetro do paralelogramo ${a}${e}${p}${f}.`, [`2(${a}${e}+${e}${p}), pois lados opostos são congruentes`, `4${a}${e}, porque todo paralelogramo é losango`, `2${b}${c}, pois a base está fixa`], `2(${a}${e}+${e}${p}), pois lados opostos são congruentes`, 'AE=PF e EP=FA. Assim, AE+EP+PF+FA=2(AE+EP).', 'Some os quatro lados antes de substituir qualquer medida.', 'perimeter');
    add('proof', `Substitua ${e}${p} e use adição de segmentos.`, [`${a}${e}+${e}${p}=${a}${e}+${e}${b}=${a}${b}`, `${a}${e}+${e}${p}=${b}${c}`, `${a}${e}+${e}${p}=2${a}${b}`], `${a}${e}+${e}${p}=${a}${e}+${e}${b}=${a}${b}`, 'E pertence a AB, portanto AE+EB=AB. A igualdade EP=BE foi demonstrada, não suposta.', 'Troque EP por BE e observe onde está E.', 'sum');
    add('proof', 'Conclua a tese do boss.', [`Perímetro=2${a}${b}=${a}${b}+${a}${c}, pois ${a}${b}=${a}${c}`, `Perímetro=${b}${c}`, 'O perímetro depende da posição do ponto na base'], `Perímetro=2${a}${b}=${a}${b}+${a}${c}, pois ${a}${b}=${a}${c}`, 'O perímetro é a soma dos lados congruentes do triângulo original, independentemente do ponto interior escolhido.', 'Finalize usando a hipótese isósceles.', 'conclusion');
  }
  return steps.map((step, index) => {
    const rotate = (choices: string[]) => {
      const offset = (nodeIndex + variant + index) % Math.max(1, choices.length);
      return [...choices.slice(offset), ...choices.slice(0, offset)];
    };
    return { ...step, options: rotate(step.options), ...(step.reasons ? { reasons: rotate(step.reasons) } : {}),
      id: `ifsp:${nodeIndex}:${variant}:${index}`, nodeIndex, variant };
  });
}
