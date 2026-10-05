# Geometria RPG — auditoria, correções e QA

Data: 2026-10-05. Base: produção Sites `f639114ba78eeff2719dc833cfdf3362e52e50e9`; GitHub main observado `d67f3f15c309c77402d55fe9fb1343afb4f90bcf`. Branch de correção: `fix/production-debug-qa`. Não houve deploy, alteração da audiência ou atualização de main.

## Resumo executivo

Produção publica o app original Vinext/React com dez questões fixas, não o app Vite/React Router e a engine v4 do GitHub main. O bug foi reproduzido no site e no checkout exato: sequência idêntica, repetição da primeira após dez respostas, reset na reentrada. A seleção ignorava inteiramente o histórico.

Foi mantida a stack, os assets e a identidade navy/dourado/RPG. O banco tem 48 questões: quatro A, quatro B, seis C, dezenove D, três E, doze G; cinco provas F e onze etapas de quests. IDs originais foram mantidos. Equações OPV têm solução calculada deterministicamente, sem LLM.

A fila é criada uma vez por sessão, persiste com respostas/posição/opções e termina explicitamente. A seleção prioriza revisão vencida/erro/confiança baixa e, fora dessas exceções, menor exposição; intercala habilidades e formas de raciocínio. Fisher–Yates seeded embaralha opções por ID. Não há `sort(Math.random)` nem recomposição por render.

Estudar capítulos libera leitura, sem premiar domínio. Primeira recuperação correta rende +10; correção recupera +5; repetição imediata correta rende zero. Recuperação correta de revisão vencida rende +5 e amplia o intervalo de 1 até 30 dias; repetição imediata não posterga a revisão. Provas premiam a primeira reconstrução; repetir Verificar é bloqueado e novas tentativas não acumulam recompensa indevida. Valores legados compatíveis de mastery são preservados.

## Bugs e causas raiz

O inventário completo anterior aos fixes está em [BUG_INVENTORY.md](BUG_INVENTORY.md), incluindo reprodução, severidade e causa de cada GEO-01…13.

| ID | estado final | correção |
|---|---|---|
| GEO-01,03 | corrigidos | Scheduler explícito e sessão persistida; histórico de exposição/acerto/erro/timestamp/skill/resultado |
| GEO-02 | corrigido | IDs de opções estáveis, shuffle seeded; resposta correta independe da posição exibida |
| GEO-04,05 | corrigidos | Estudo/confiança separados de domínio; recompensa limitada; validação topológica das provas |
| GEO-06 P0 | corrigido | LLL por cópia no mesmo semiplano e mediatriz; retirada da soma angular injustificada |
| GEO-07 P0 | corrigido | Hipóteses de colinearidade/ordem e relações dadas explícitas; figuras com marcas nas duas quests |
| GEO-08 P0 | corrigido | Migração v2; v1 intacto; backup antes de recuperar v2 inválido; versão futura não sobrescrita |
| GEO-09,10,11 | corrigidos | studiedSkills independente; elegibilidade por pré-requisitos; confiança/prazos alimentam seleção; classificação e questões B/C/D/E/G |
| GEO-12 | corrigido | Seis hashes navegáveis, back/forward, reload, parâmetro de skill e scroll por área |
| GEO-13 P1 | corrigido após revisão | Snapshot com `index=queue.length, completed=false` travava Treino. Migração valida conclusão, respostas e opções; salva backup e recupera progresso compatível descartando só a sessão inválida |

DAG das provas verifica presença única de todos os passos e dependências satisfeitas antes de cada inferência. OPV aceita hipóteses iniciais invertidas; isósceles admite reflexividade/definição independentes após construção; ceviana especial admite conclusão de ponto médio e ângulos em ordem equivalente. Saltos, duplicação e omissão são recusados.

## Arquivos alterados

- `app/engine/training.ts`: seleção, distribuição por skill/família, opções, início/resposta/avanço da sessão.
- `app/engine/progress.ts`: migração, validação, evidência de domínio, exposição e intervalos.
- `app/engine/proof.ts`: verificador de dependências.
- `app/hooks/useProgress.ts`, `app/types/geometry.ts`: schema v2, transações síncronas de persistência, backup/recuperação e proteção de schema futuro.
- `app/components/TrainingPage.tsx`, `GeometryApp.tsx`: sessão persistida, fim explícito, navegação por hash, estudo sem domínio, confiança, shuffle também nas quests.
- `app/components/ProofBlock.tsx`, `GeometryFigure.tsx`: prova topológica, ajuda rastreada, botão idempotente, figuras acessíveis.
- `app/content/exercises.ts`, `proofs.ts`: conteúdo variado, hipóteses precisas e prova LLL corrigida.
- `app/globals.css`: contenção de fórmulas/textos, alvos de toque e espaço seguro da navegação; sem mudança de tema/layout.
- `LessonCards.tsx`, `db/index.ts`: correções de tipos preexistentes (ícone equivalente e binding DB opcional); nenhum backend novo.
- `package.json`, lock, `tsconfig.json`, `app/env.d.ts`, `eslint.config.mjs`, `.gitignore`, `playwright.config.ts`: testes/types e exclusão de artefatos gerados.
- `README.md`: links para auditoria e instruções de validação.
- `tests/engine.test.mjs`, `tests/e2e/app.spec.ts`, `audit/*`: regressões e evidências.

## Testes e evidências

Os logs originais das regressões RED e execuções finais ficam em `audit/evidence/`.

- Unitários: scheduler, dez IDs distintos, próximo ciclo favorece restantes, pool pequeno/vazio/esgotado, determinismo, revisão/erro/confiança, diversidade skill/família, shuffle/ID correto em cem seeds, reload/duplo envio, mastery/clamp/provas, migração v1/v2/futura e sessão inválida.
- E2E: onze cenários por viewport; IDs semânticos (`data-question-id`, `data-option-id`, testids), sessões consecutivas, reload antes/depois da resposta, reentrada, fechar/reabrir aba, estudo/desbloqueio, progresso antigo, seis áreas, back/deep link, prova em ordem equivalente, JSON inválido/futuro, fila inválida recuperada, onze etapas de quests e cinco provas.
- Execução visual/console: quatro viewports × seis áreas e cinco provas, fórmulas sem erros KaTeX, rede/console sem falhas. Capturas de viewport e página inteira em `audit/evidence/*.png` (artefatos locais regeneráveis, não versionados).
- Resoluções: 360×800, 390×844, 412×915 e 1366×768, Chromium real via Playwright. Inspeção visual confirmou tema/assets preservados, alternativas legíveis, abas horizontais roláveis, SVGs com marcas e conteúdo alcançável acima da navegação ao rolar.
- Diagnóstico do scheduler existe somente em dev. Verificado que a string “Diagnóstico do treino” não consta nos bundles de produção.
- Todas as 99 fórmulas do conteúdo/provas/revisão foram renderizadas com KaTeX `throwOnError:true` sem erro.

Comandos reproduzíveis:

```sh
npm ci
npx playwright install chromium
npm test
npm run typecheck
npm run lint
npm run start -- --host 0.0.0.0
# outro terminal:
npm run test:e2e
node audit/console-qa.mjs
```

`npm test` inclui build, unitários e dois testes SSR existentes. Testes devem rodar contra o servidor de produção recém-iniciado; um servidor antigo mantém manifest em memória após rebuild. Rodadas intermediárias tiveram falhas reais e estão registradas: validação de deadline/revisão/diversidade/snapshot ainda não implementadas, HTML SSR substituído por loading e seletor E2E ambíguo durante hidratação. Foram corrigidas; não foram marcadas como passadas. Uma execução concorrente de duas suítes Playwright compartilhou o diretório padrão de artefatos e falhou no teardown de trace (ENOENT); a rodada final foi executada sequencialmente para eliminar esse conflito.

## Resultado da execução final

| Verificação | Resultado | Evidência |
|---|---|---|
| Build + unitários + SSR | Passou; 16 unitários e 2 SSR | `evidence/full-test.txt` |
| Typecheck e lint | Passaram | `evidence/typecheck.txt`, `evidence/lint.txt` |
| E2E completo, quatro resoluções | 44/44 passaram | `evidence/e2e-final.txt` |
| Revalidação após ajustes de texto/figura | 4/4 passaram | `evidence/e2e-proofs-final.txt` |
| Console, rede, overflow e KaTeX | Zero falhas nas quatro resoluções | `evidence/console-final.txt`, `evidence/console-qa.json` |
| Revisão independente | P1 de snapshot corrigido e revalidado | `CODE_REVIEW.md` |

## Pendências e preview

Nenhum P0/P1 conhecido dos achados permanece aberto após correções e revisão independente. Provas livres digitadas, currículo de paralelogramos/alternos internos, XP, estrelas, conquistas e streak não existem na versão publicada; não foram criados como parte deste trabalho.

Preview local: `http://localhost:3000/#training`, no executor desta sessão. Este ambiente não disponibiliza ferramenta de forwarding/preview externo. O endereço loopback não deve ser apresentado como acessível no navegador do usuário. As operações Sites disponíveis publicam em produção; não foram usadas para contornar a proibição de deploy. URL externa de preview permanece pendente de um ambiente de preview suportado.

O drift de produção continua intencionalmente: o site atual ainda é `f639114`; o GitHub main ainda é `d67f3f1`. Esta branch parte da produção exata e não deve ser mesclada automaticamente sobre main, pois main contém outra arquitetura. Commit final e resumo da execução ficam em `audit/HANDOFF.md` e na entrega do assistente.
