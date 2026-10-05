# Auditoria pedagógica

Banco final: 48 questões. Distribuição: {"A":4,"B":4,"C":6,"D":19,"E":3,"F":0,"G":12}. Cinco provas de reconstrução (F) e duas quests com onze etapas. Não há LLM em runtime.

| ID | skill | classe | figura |
|---|---|---|---|
| q-median | median-bisector-altitude | C: identificação de hipótese | — |
| q-lal | lal | A: reconhecimento textual | — |
| q-correspondence | congruence | D: aplicação | — |
| q-isosceles | isosceles | D: aplicação | — |
| q-segment | fundamentals | A: reconhecimento textual | — |
| q-bisector | median-bisector-altitude | E: justificativa | — |
| q-altitude | median-bisector-altitude | A: reconhecimento textual | — |
| q-opv | segments-angles | D: aplicação | — |
| q-congruence-similarity | congruence | A: reconhecimento textual | — |
| q-drawing | fundamentals | E: justificativa | — |
| f-vertices | fundamentals | B: leitura de figura | triangle |
| f-side | fundamentals | B: leitura de figura | triangle |
| f-no-mark | fundamentals | G: transferência | triangle |
| f-ticks | fundamentals | B: leitura de figura | isosceles |
| f-equal-measures | fundamentals | D: aplicação | — |
| f-scale | fundamentals | G: transferência | — |
| f-given | fundamentals | C: identificação de hipótese | — |
| f-counterexample | fundamentals | E: justificativa | triangle |
| f-midpoint-given | fundamentals | D: aplicação | — |
| f-extension | fundamentals | G: transferência | — |
| q-triangle | triangles | C: identificação de hipótese | — |
| q-cevian | cevians | B: leitura de figura | median |
| q-inverse | inverse-isosceles | D: aplicação | — |
| q-lll | lll | C: identificação de hipótese | — |
| q-ala | ala | C: identificação de hipótese | — |
| q-special | isosceles-cevians | D: aplicação | isosceles |
| q-exterior | exterior-angle | C: identificação de hipótese | — |
| q-opv-variant-1 | segments-angles | D: aplicação | opv |
| q-opv-variant-2 | segments-angles | D: aplicação | opv |
| q-opv-variant-3 | segments-angles | D: aplicação | opv |
| q-opv-variant-4 | segments-angles | D: aplicação | opv |
| q-opv-variant-5 | segments-angles | D: aplicação | opv |
| q-opv-variant-6 | segments-angles | D: aplicação | opv |
| q-opv-variant-7 | segments-angles | D: aplicação | opv |
| q-opv-variant-8 | segments-angles | D: aplicação | opv |
| q-opv-variant-9 | segments-angles | D: aplicação | opv |
| q-opv-variant-10 | segments-angles | D: aplicação | opv |
| q-opv-variant-11 | segments-angles | D: aplicação | opv |
| q-opv-variant-12 | segments-angles | D: aplicação | opv |
| q-correspondence-0-0 | congruence | G: transferência | — |
| q-correspondence-0-1 | congruence | G: transferência | — |
| q-correspondence-0-2 | congruence | G: transferência | — |
| q-correspondence-1-0 | congruence | G: transferência | — |
| q-correspondence-1-1 | congruence | G: transferência | — |
| q-correspondence-1-2 | congruence | G: transferência | — |
| q-correspondence-2-0 | congruence | G: transferência | — |
| q-correspondence-2-1 | congruence | G: transferência | — |
| q-correspondence-2-2 | congruence | G: transferência | — |

ALA: etapas E/E/C/D/D/D. LAL: E/E/C/D/D. Ambos agora têm hipóteses de colinearidade, ordem dos pontos e figuras marcadas. A figura não é prova: o enunciado também informa todas as relações utilizadas.

OPV, base do isósceles, ALA e ceviana especial tiveram suas hipóteses e correspondências conferidas. LLL passou a usar uma cópia no mesmo semiplano e argumento de mediatriz; inclui caso colinear auxiliar, sem depender de soma angular presumida. Dependências explícitas rejeitam conclusão antes da justificativa, omissão e duplicação, e aceitam inversão de hipóteses independentes. A interface usa blocos fixos: não aceita demonstrações livres digitadas. Alternos internos e paralelogramos não existem no currículo publicado e não foram adicionados.

Limite pedagógico: as variações de correspondência são isomorfismos de vértices; as OPV mudam coeficientes e resposta por equação determinística. A engine intercala habilidades e tipos de raciocínio para evitar que uma família numérica ocupe toda a sessão. As novas questões incluem leitura de marcas, hipótese, contraexemplo e transferência de representação; não equivalem a um redesenho integral do currículo.
