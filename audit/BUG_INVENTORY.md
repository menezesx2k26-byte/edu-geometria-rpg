# Inventário anterior aos fixes — 2026-10-05

## Identidade de produção e drift

- Site `appgprj_6a7b7d2ac9648191814302afd9b25e2e`, público, versão 1.
- Versão `appgprj_6a7b7d2ac9648191814302afd9b25e2e~appgver_0da3b23eef4c8191a2e1a5eafa43a55d`.
- Deploy `appgdep_6a7b7dce15248191b55575e19597a3f8`, succeeded, 2026-08-11.
- Fonte publicada: `https://git.chatgpt-team.site/c86fafa1-135b-45b5-a9d2-b437577ab145/appgprj_6a7b7d2ac9648191814302afd9b25e2e.git`, branch `main`, SHA `f639114ba78eeff2719dc833cfdf3362e52e50e9`. HEAD remoto conferido por Git.
- Mesmo commit existe no histórico de `menezesx2k26-byte/edu-geometria-rpg`.
- GitHub main: `d67f3f15c309c77402d55fe9fb1343afb4f90bcf`. Tem nova arquitetura Vite/React Router e engine adaptativa v4; produção continua Vinext/RSC, sem essa engine. Não transplantar nova stack.
- HTML publicado identifica `GeometryApp-B5NPD-ap.js`, CSS `index.DVT5n-ow.css`, chunk `index-BxCrE16p.js`. Captura original em `/workspace/scratch/production.html`; versão/arquivo SHA256 `e32a3720cfd1ce4a8ad79a0628a162e0bc065bf592a1dc509c05c4860a43a9db`.
- Base dos fixes: worktree do SHA publicado, branch `fix/production-debug-qa`.

| ID | área | bug | reprodução | causa | severidade | fix planejado |
|---|---|---|---|---|---|---|
| GEO-01 | Treino | Mesmas dez, mesma ordem, loop infinito | Entrar, responder 10, avançar; sair/voltar | `questions[index]`, módulo 10, índice local reinicia no mount; banco só 10 | P1 | Fila por sessão, ciclo sem repetição, histórico persistido e seleção adaptativa |
| GEO-02 | Alternativas | Posição correta constante | Repetir questão/prova de etapas | `correctIndex` e ordem original sempre usados | P1 | Fisher–Yates seeded por sessão; IDs estáveis de alternativas |
| GEO-03 | Sessão | Reload/sair perde posição e feedback | Responder parcialmente, reload | Estado local de Treino sem persistência; view também local | P1 | Sessão e resposta transacionais no progresso; URL hash navegável |
| GEO-04 | Domínio | Leitura e autoavaliação dão domínio | Marcar seção (+20), clicar Sei (+10) indefinidamente | Incrementos sem evidência matemática | P1 | Separar estudo/confiança de domínio; recompensas limitadas por evidência |
| GEO-05 | Provas | Farming e ordens válidas recusadas | Repetir Verificar; trocar as duas hipóteses OPV | Comparação exata de array; callback a cada clique | P1 | Dependências explícitas, aceitação topológica; recompensa só primeira solução |
| GEO-06 | LLL | Prova afirma que ângulos são sempre somas | Cópia G em semiplano oposto; CG externo ao ângulo em C | Semiplanos opostos não garantem decomposição por soma; degeneração não tratada | P0 | Prova por mediatrizes usando teorema do isósceles; sem desenho presuntivo |
| GEO-07 | Exercícios | OPV não justificado por hipóteses explícitas | Primeiro passo ALA/LAL | Apenas “retas se cruzam”, sem informar colinearidade/semirretas opostas; nenhuma figura marcada | P0 | Hipóteses completas e SVG geométrico com marcas |
| GEO-08 | Persistência | JSON inválido pode ser sobrescrito por vazio | Salvar valor inválido na chave v1, abrir | catch silencioso seguido de escrita initialProgress | P0 | Migração validada v2, chave v1 intacta, cópia de segurança para v2 inválido |
| GEO-09 | Skills | Não há filtros; habilidades compartilhando aula bloqueiam progressão individual | Todos recebem questões avançadas; estudar inverso/cevianas | Treino ignora skills; studySection usa id da aula, não skill selecionada | P1 | Elegibilidade por pré-requisitos estudados/evidência; studiedSkills separado |
| GEO-10 | Revisão | Não existe espaçamento/confiança registrada | Errei/Sei não influencia Treino | Review só chama changeMastery | P1 | dueAt e confidence por skill/questão; prioridade adaptativa explícita |
| GEO-11 | Pedagogia | Treino só textual | Todas as 10 originais | Sem SVG; currículo com pouca aplicação/transferência | P1 | Questões B/C/D/E/G com marcas, hipóteses e cálculo verificável |
| GEO-12 | Navegação | Back/deep link/reload não retomam área | Trocar seis abas, voltar/reload | `view` exclusivamente React state | P2 | Hash semântico, back/forward, skill persistida |

## Auditoria de causa

Não há seed, queue, recentlySeen, scheduler, error tags, confidence, timestamps, revisão espaçada, nem fallback adaptativo em produção. Apenas `questions: { attempts, correct }`, mastery e proofAttempts são persistidos na chave `geometria-rpg-progress-v1`. useMemo calcula domínio e última skill; não seleciona perguntas. Não há closure obsoleta nem RNG causando o bug: ordem fixa e banco pequeno explicam integralmente a repetição. A key por question.id reseta escolha apenas ao avançar; ela não resolve reentrada. XP, estrelas, conquistas e streak não existem nesta versão; auditar como ausentes, sem inventar produto novo. Alternos internos e paralelogramos também não constam no currículo/proof bank publicado.

## Classificação pedagógica antes

q-median C; q-lal A; q-correspondence D; q-isosceles D; q-segment A; q-bisector E; q-altitude A; q-opv D; q-congruence-similarity A; q-drawing E. Nenhuma B/F/G.
ALA etapas: E/E/C/D/D/D. LAL etapas: E/E/C/D/D. Provas: F, cinco reconstruções fixas. Exercícios não apresentam figura real (banners decorativos não são figuras de hipótese).

## Achado da revisão independente

GEO-13, P1: migração aceitava fila com index=fila.length e completed=false; UI ficava sem questão nem recuperação. Reproduzido por Node a partir de uma fila válida. Regressão inicialmente falhou; corrigida validação de conclusão/respostas/opções. Hook faz backup e recupera progresso compatível com trainingSession=null. Revisão independente confirmou correção (16/16 unitários).
