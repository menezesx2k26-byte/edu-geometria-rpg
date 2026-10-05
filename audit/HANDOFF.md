# Entrega para validação humana

- Base publicada: `f639114ba78eeff2719dc833cfdf3362e52e50e9`.
- Branch de revisão no GitHub: `fix/production-debug-qa`, baseada na produção exata.
- Branch local: `fix/production-debug-qa`, em `/workspace/geometria-production`.
- SHA final: obtido com `git rev-parse fix/production-debug-qa`, também informado na resposta final.
- Não houve push em main nem deploy. Apenas a branch de revisão foi publicada no GitHub. Esta branch corrige a versão publicada; não substitui automaticamente a arquitetura mais nova do GitHub main.
- Preview do executor: `http://localhost:3000/#training`. Sem forwarding suportado neste ambiente; não é um link externo acessível no computador do usuário.
- Para validação fora do executor, buscar a branch de revisão no GitHub ou importar o bundle entregue, instalar dependências e rodar o servidor local.

```sh
git fetch /caminho/geometria-rpg-qa.bundle fix/production-debug-qa:fix/production-debug-qa
git switch fix/production-debug-qa
npm ci
npm run build
npm run start -- --host 0.0.0.0
```

Validação sugerida: abrir Treino, responder dez questões, iniciar nova sessão, sair/voltar e recarregar no meio; conferir continuidade e variedade. Marcar capítulos não aumenta domínio. Na prova OPV, inverter as duas primeiras hipóteses deve ser aceito; antecipar a subtração deve ser rejeitado. As duas quests mostram hipóteses e figuras marcadas. Progresso v1 é preservado em sua chave original.

Inventário, causas, arquivos, testes e limites: `audit/QA_REPORT.md`. Evidências JSON/texto são versionadas; capturas PNG e ZIP são artefatos regeneráveis. Não há P0/P1 conhecido aberto após revisão e correções; permanecem pendentes o preview externo suportado e a decisão de publicação humana.
