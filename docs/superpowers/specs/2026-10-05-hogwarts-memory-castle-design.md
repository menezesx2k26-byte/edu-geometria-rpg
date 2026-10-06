# Hogwarts Memory Castle — Design

**Status:** proposta para revisão  
**Base:** `hotfix/avaliacao-ifsp-2026-10-05` / PR #19  
**Objetivo imediato:** transformar a trilha única da 1ª Avaliação de Geometria Euclidiana Plana em um palácio mental navegável, sem substituir o motor adaptativo, as atividades já implementadas ou a fonte oficial.

## 1. Problema

A rota `/avaliacao-ifsp` já cobre as seis famílias da prova antiga e resolve a falha de treino em loop, mas o conteúdo continua abstrato e pouco memorável. O estudante precisa lembrar rapidamente, sob pressão de prova, qual ferramenta geométrica usar e por quê.

A solução não deve adicionar outra trilha paralela. Deve converter a trilha existente em uma sequência espacial estável na qual cada ambiente representa uma família de raciocínio.

## 2. Princípio pedagógico

O castelo é um **índice espacial da matemática**.

Cada sala deve satisfazer quatro condições:

1. possuir um objeto visual fixo que represente a estrutura geométrica;
2. associar esse objeto a uma pergunta matemática específica;
3. exigir a cadeia `DADO → PROPRIEDADE → CONCLUSÃO`;
4. terminar com recuperação ativa sem a narrativa entregar a resposta.

A narrativa nunca substitui uma justificativa formal. "É mágico", "parece simétrico" ou "o desenho mostra" não são fundamentos aceitos.

## 3. Estrutura da jornada

A rota permanece única. O estudante percorre seis ambientes na mesma ordem das seis famílias do PR #19.

### Sala 1 — Salão dos Retratos Mutáveis
**Conteúdo:** verdadeiro/falso, definições e contraexemplos.

Os retratos tentam mudar de moldura e de classificação. O estudante decide se uma afirmação continua verdadeira quando a figura muda.

Âncoras:
- quadrado dentro da família dos paralelogramos;
- paralelogramo que não é quadrado;
- equilátero como caso particular de isósceles, conforme a convenção adotada;
- trapézio versus paralelogramo;
- diagonais do losango.

Memória operacional:
- afirmação universal verdadeira → justificar pela definição/propriedade;
- afirmação universal falsa → produzir um contraexemplo.

### Sala 2 — Escadaria das Diagonais
**Conteúdo:** diagonais de um paralelogramo se interceptam em seus pontos médios.

A escadaria tem dois lances diagonais que se cruzam em O. O ponto O é visualmente destacado, mas **não aparece como ponto médio por aparência**.

Roteiro recuperável:
- dado: lados opostos paralelos;
- paralelas + transversais → pares de ângulos congruentes;
- propriedade de lados opostos do paralelogramo;
- congruência de triângulos opostos;
- partes correspondentes → (AO=OC) e (BO=OD);
- conclusão: O é ponto médio de ambas as diagonais.

A sala deve permitir tocar nos pares de ângulos e lados antes de escolher a congruência.

### Sala 3 — Ponte das Quatro Torres
**Conteúdo:** soma das diagonais de um quadrilátero menor que a soma dos lados.

Cada diagonal é uma ponte que tenta atravessar duas torres. A única ferramenta disponível é a desigualdade triangular.

Roteiro recuperável:
- obter duas desigualdades para AC;
- obter duas desigualdades para BD;
- somar as quatro;
- reconhecer o fator 2;
- dividir por 2.

O visual deve reforçar "cada diagonal pode ser comparada por dois caminhos laterais", evitando decorar a expressão final sem entender sua origem.

### Sala 4 — Sala Precisa das Cevianas
**Conteúdo:** construção de mediana relativa a C e altura relativa a A.

A sala muda de forma conforme o comando, mas conserva o triângulo.

Âncoras:
- mediana → **ponto médio** do lado oposto;
- altura → **perpendicular** à reta do lado oposto, inclusive em prolongamento.

A interação deve separar explicitamente:
1. localizar/construir o ponto ou reta necessária;
2. traçar a ceviana;
3. nomear a definição usada.

### Sala 5 — Aula de Poções da Rampa
**Conteúdo:** semelhança e erro de correspondência no problema de Gimli.

Dois recipientes/triângulos semelhantes representam o trecho pequeno e a rampa inteira. O erro é tratado como "ingredientes correspondentes misturados".

Roteiro recuperável:
- isolar os dois triângulos completos;
- marcar correspondência de vértices;
- identificar que 6 m é somente o trecho restante;
- obter hipotenusa maior (2+6=8);
- montar (2/1=8/h);
- concluir (h=4).

Regra pedagógica:
nenhuma proporção pode ser montada antes de o estudante indicar quais lados são correspondentes.

### Sala 6 — Câmara do Paralelogramo Isósceles
**Conteúdo:** isósceles + paralelas, fechamento da avaliação.

É o boss da rota. A sala combina ferramentas de salas anteriores.

Roteiro recuperável:
- reconhecer o quadrilátero formado pelas paralelas;
- usar paralelismo para produzir semelhanças;
- obter a igualdade de segmentos necessária;
- reescrever o semiperímetro do paralelogramo como soma de segmentos do lado do triângulo;
- usar (AB=AC);
- concluir o perímetro pedido.

O sistema deve mostrar quais salas anteriores foram reutilizadas, mas não fornecer o passo seguinte automaticamente.

## 4. Gramática de demonstração

Toda atividade demonstrativa usa a mesma estrutura visível:

- **DADO** — o que a questão realmente fornece;
- **PROPRIEDADE** — qual definição/teorema autorizado conecta os dados;
- **CONCLUSÃO** — o que esse passo permite afirmar.

Exemplo:

`AB ∥ CD`  
→ ângulos alternos internos congruentes  
→ `∠BAO = ∠DCO`

Essa gramática deve aparecer como "grimório" ou "pergaminho de prova", mas os rótulos matemáticos permanecem explícitos.

## 5. Escada de ajuda

A ajuda deve ser graduada e registrada apenas quando aberta.

- **Pista 1 — olhar:** indica a região relevante da figura.
- **Pista 2 — ferramenta:** pergunta qual definição/propriedade poderia ser usada.
- **Pista 3 — conexão:** revela a relação intermediária, sem dar a conclusão final.
- **Solução comentada:** somente após tentativa ou abandono explícito.

A redução de autonomia continua alimentando o motor de domínio existente.

## 6. Fluxo de sessão

Manter as regras do PR #19:

- seis famílias na primeira rodada;
- erro não bloqueia a progressão;
- apenas erros retornam na rodada seguinte;
- máximo de três rodadas;
- sessão persistida localmente;
- tentativa registrada via `recordAttempt`.

Alteração proposta:
cada questão ganha metadados de "sala", "âncora visual" e "passos do grimório". O estado da sessão continua independente da camada narrativa.

## 7. Arquitetura proposta

A implementação deve decompor o atual `EvaluationTrainingPage.tsx`, que concentra conteúdo, estado e renderização.

### Conteúdo declarativo
Extrair as seis questões e seus metadados para um arquivo de dados dedicado.

Cada atividade deve declarar:
- id;
- sala;
- conceito-alvo;
- prompt;
- opções/afirmações;
- pista;
- explicação;
- `skillIds`;
- `masteryDimensions`;
- passos de prova;
- âncoras visuais.

### Motor da sessão
Extrair a máquina de rodada para um módulo testável sem React:
- estado inicial;
- registrar acerto/erro;
- avançar;
- formar fila de remediação;
- encerrar após três rodadas;
- recuperar estado persistido inválido com segurança.

### Componentes visuais
Criar componentes pequenos e reutilizáveis:
- cabeçalho/placa da sala;
- mapa linear do castelo;
- grimório `DADO → PROPRIEDADE → CONCLUSÃO`;
- figura geométrica da atividade;
- escada de pistas;
- feedback.

A narrativa não deve vazar para o motor matemático.

## 8. Relação com os repositórios canônicos

Fonte de autoridade:
1. materiais oficiais do professor;
2. `edu-geometria-tutor`;
3. `edu-geometria-euclidiana`;
4. conteúdo do próprio `edu-geometria-rpg`.

Antes de aceitar uma justificativa formal, a implementação deve usar somente propriedades já autorizadas no corpus canônico.

Para a prova das diagonais, a fonte curricular já registra `parallelogram.diagonals` como propriedade autorizada, com dependências formais. Semelhança, mediana e altura também devem seguir a nomenclatura do corpus.

## 9. Direção visual

O ambiente deve evocar uma escola de magia e um castelo antigo, sem depender de imagens oficiais, logos, brasões, stills de filmes ou assets licenciados.

Requisitos:
- mobile-first;
- figura geométrica sempre mais importante que a decoração;
- contraste alto;
- animação curta e funcional;
- nada de efeitos que escondam medidas, rótulos ou relações;
- a sala muda, mas a notação matemática permanece estável.

## 10. Testes

### Unitários
- progressão de rodada sem repetição imediata;
- remediação somente de erros;
- limite de três rodadas;
- recuperação de `localStorage` corrompido;
- dica só conta quando aberta;
- metadados de todas as seis salas completos;
- sequência do grimório sem conclusão circular.

### Integração
- cada sala registra tentativa com os `skillIds` e dimensões corretos;
- concluir uma questão avança para a próxima sala;
- erro retorna somente no fechamento;
- refresh preserva sala/rodada;
- reset limpa apenas a sessão da avaliação.

### E2E
- percurso completo em 390 px;
- teclado em todas as alternativas e pistas;
- ausência de overflow;
- nenhuma violação axe séria/crítica;
- ciclo com erros, remediação e encerramento;
- usuário consegue reconstruir a prova das diagonais sem receber (AO=OC) como dado.

## 11. Não objetivos

- criar um segundo app;
- substituir o motor adaptativo;
- reescrever `edu-geometria-euclidiana`;
- introduzir login/backend;
- reproduzir cenários ou personagens protegidos visualmente;
- adicionar conteúdo fora da avaliação antes de fechar esta trilha;
- transformar narrativa em evidência de domínio.

## 12. Critérios de aceite

A proposta está pronta quando:

1. `/avaliacao-ifsp` continua sendo uma única trilha;
2. as seis famílias estão mapeadas para seis locais estáveis do castelo;
3. cada sala tem uma âncora espacial inequívoca;
4. demonstrações exigem `DADO → PROPRIEDADE → CONCLUSÃO`;
5. o aluno nunca é obrigado a inferir pela aparência da figura;
6. a camada narrativa pode ser removida sem alterar o resultado matemático;
7. erro não causa loop;
8. domínio continua baseado em tentativas registradas;
9. o fluxo funciona em mobile e teclado;
10. a prova antiga pode ser revisada mentalmente percorrendo o castelo na ordem das salas.

## 13. Sequência mental final

Ao entrar na prova, o estudante deve conseguir percorrer mentalmente:

**Retratos → Escadaria → Ponte → Sala Precisa → Poções → Câmara**

e recuperar, nessa ordem:

**definição/contraexemplo → congruência no paralelogramo → desigualdade triangular → ponto médio/perpendicular → correspondência em semelhança → síntese com paralelas e isósceles**.
