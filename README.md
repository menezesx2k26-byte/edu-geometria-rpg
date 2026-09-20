# 🎮 Geometria RPG

Experiência mobile-first de **Geometria Euclidiana e Analítica** organizada como uma campanha única, com progressão, feedback matemático e domínio baseado em evidência.

Cada missão ensina, propõe uma decisão, registra uma tentativa e desbloqueia o próximo passo sem transformar simples leitura em “domínio”.

## 🗺️ Campanha principal

### 🛡️ Ala da Congruência

- correspondência;
- OPV;
- LAL;
- ALA;
- checkpoint;
- Boss Proof.

### 🧭 Passagem das Paralelas

- famílias angulares;
- relações entre retas;
- paralelogramo;
- conexões com provas.

### ⚒️ Forja Analítica

- plano cartesiano;
- equações gerais;
- SPD, SPI e SI;
- crossover entre geometria e álgebra;
- modelagem métrica.

## 🚪 Entrada principal

```text
/map
```

A navegação principal foi reduzida a:

- **Caminho**;
- **Perfil**;
- **Conquistas**.

Conteúdos auxiliares continuam preservados na Biblioteca da Academia.

## 🧠 Motor adaptativo V4

A progressão mantém:

- XP;
- nível;
- estrelas;
- sequência por dias;
- quests;
- conquistas;
- revisão espaçada.

Mas o domínio H1–H15 é calculado separadamente a partir de evidências.

O motor considera dimensões como:

- correção;
- justificação;
- independência;
- verificação.

Dados V1/V2/V3 são migrados para V4 sem apagar a origem necessária à recuperação.

Documentação:

```text
docs/adaptive-engine.md
```

## 🎯 Regra de domínio

**Leitura não concede domínio.**

Somente tentativas matemáticas registradas alteram o perfil de competência.

“Continuar jornada” aponta para a próxima missão principal incompleta.

Revisões e recomendações adaptativas aparecem como rotas secundárias e não bloqueiam arbitrariamente a campanha.

## 🧱 Stack

- React;
- TypeScript;
- Vite;
- Vitest;
- Playwright;
- SPA estática.

Não há backend obrigatório para o runtime principal.

## 🚀 Desenvolvimento

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
npm run preview
```

Saída:

```text
dist/
```

## ✅ Qualidade

```bash
npm run test
npm run test:e2e
npm run qa
```

O relatório de aceite está em:

```text
QA_REPORT.md
```

## ☁️ Deploy

Repositório atual:

```text
menezesx2k26-byte/edu-geometria-rpg
```

Produção:

```text
https://geometria-rpg.pages.dev
```

Preview QA:

```text
https://qa-preview.geometria-rpg.pages.dev
```

Configuração:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
```

`public/_redirects` aplica fallback da SPA para permitir acesso direto a rotas internas.

## 🧩 Arquitetura

```text
src/data        conteúdo declarativo
src/engine      regras e avaliação
src/state       progresso persistido
src/components  UI reutilizável
src/pages       mapa, campanhas e laboratórios
src/types       contratos de domínio
```

## 🧪 Garantias do motor

A implementação separa:

- progresso narrativo;
- XP/recompensas;
- evidência matemática;
- domínio por habilidade;
- seleção adaptativa;
- migração de estado.

Essa separação reduz o risco de recompensas visuais mascararem lacunas matemáticas.

---

**Status:** motor adaptativo V4 integrado, campanha principal ativa e documentação alinhada ao repositório atual. 🧠