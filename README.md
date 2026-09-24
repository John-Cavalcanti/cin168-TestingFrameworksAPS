# Scholarship Eligibility Evaluator — Suíte de Testes

**APS — Testes Automatizados, Adequação e Análise de Mutação**
Disciplina: CIn168 — Testes de Software

---

## Tecnologias

| Item | Escolha |
|---|---|
| Linguagem | JavaScript (Node.js) |
| Framework de Testes | [Jest](https://jestjs.io/) |
| Ferramenta de Mutação | [StrykerJS](https://stryker-mutator.io/) (`@stryker-mutator/jest-runner`) |

## Pré-requisitos

- Node.js >= 18
- npm

## Instalação

```bash
npm install
```

## Executar os testes

```bash
npm test
```

## Executar testes com cobertura

```bash
npm run test:coverage
```

## Executar análise de mutação

```bash
npm run mutation
```

O relatório HTML será gerado em `reports/mutation/mutation.html`.

## Estrutura do Projeto

```
cin168-TestingFrameworksAPS/
├── ScholarshipEligibilityEvaluator.js       # Sistema-base (NÃO alterar)
├── __tests__/
│   └── ScholarshipEligibilityEvaluator.test.js  # Suíte de testes (42 testes)
├── reports/
│   ├── mutation-initial/                    # Relatório Stryker — 1ª execução (93.62%)
│   └── mutation-final/                      # Relatório Stryker — 2ª execução (100.00%)
├── docs/
│   └── relatorio.md                         # Relatório escrito (análise completa)
├── stryker.config.mjs                       # Configuração do StrykerJS
├── package.json
├── .gitignore
└── README.md
```

## Configuração

### Jest
O Jest é configurado com as opções padrão. Os testes estão em `__tests__/` e são detectados automaticamente.

### StrykerJS
A configuração do Stryker está em `stryker.config.mjs`:
- **Target**: `ScholarshipEligibilityEvaluator.js` (linhas 1-80 e 96-102)
- **Exclusão**: Linhas 83-94 (bloco de exemplo `if (require.main === module)`) são excluídas por serem ruído para análise de mutação
- **Test Runner**: Jest
- **Reporters**: HTML, clear-text, progress

## Relatórios de Mutação

| Execução | Score | Killed | Survived | No Coverage | Relatório |
|---|---|---|---|---|---|
| **Inicial** (sem exclusões) | 93.62% | 88 | 3 | 3 | `reports/mutation-initial/` |
| **Final** (com exclusão do bloco de exemplo) | 100.00% | 88 | 0 | 0 | `reports/mutation-final/` |

> Para reproduzir a execução **inicial** (sem exclusões), altere `stryker.config.mjs` para:
> ```js
> mutate: ["ScholarshipEligibilityEvaluator.js"],
> ```

## Relatório Escrito

O relatório completo da análise está em [`docs/relatorio.md`](docs/relatorio.md) e inclui:
- Classes de equivalência identificadas
- Valores limite considerados
- Decisões/branches do código analisados
- Scores de mutação (inicial e final)
- Análise individual dos mutantes sobreviventes
- Análise de adequação da suíte
- Respostas às 8 perguntas do enunciado