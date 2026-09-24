# Relatório — APS: Testes Automatizados, Adequação e Análise de Mutação

## 1. Introdução

### Escolha Tecnológica

| Item | Escolha | Justificativa |
|---|---|---|
| **Linguagem** | JavaScript (Node.js) | Linguagem amplamente utilizada, com ecossistema maduro para testes |
| **Framework de Teste** | Jest | Framework completo (test runner + assertions + mocking + cobertura), sem necessidade de bibliotecas adicionais, boa integração com Stryker |
| **Ferramenta de Mutação** | StrykerJS (`@stryker-mutator/jest-runner`) | Ferramenta líder em análise de mutação para JavaScript, com suporte nativo a Jest, relatórios HTML detalhados e configuração simples |

---

## 2. Projeto dos Testes

### 2.1 Classes de Equivalência Identificadas

Para cada parâmetro de entrada da função `evaluateScholarship`, foram identificadas as seguintes classes:

| Parâmetro | Classe | Intervalo | Resultado Esperado |
|---|---|---|---|
| `age` | Classe válida (aprovação) | `age >= 18` | Contribui para APPROVED |
| | Classe de revisão | `16 <= age <= 17` | Contribui para MANUAL_REVIEW |
| | Classe de rejeição | `age < 16` | Contribui para REJECTED |
| `gpa` | Classe válida (aprovação) | `7.0 <= gpa <= 10.0` | Contribui para APPROVED |
| | Classe de revisão | `6.0 <= gpa < 7.0` | Contribui para MANUAL_REVIEW |
| | Classe de rejeição | `0.0 <= gpa < 6.0` | Contribui para REJECTED |
| | Classe inválida (abaixo) | `gpa < 0.0` | Lança exceção |
| | Classe inválida (acima) | `gpa > 10.0` | Lança exceção |
| `attendanceRate` | Classe válida (aprovação) | `80.0 <= rate <= 100.0` | Contribui para APPROVED |
| | Classe de revisão | `75.0 <= rate < 80.0` | Contribui para MANUAL_REVIEW |
| | Classe de rejeição | `0.0 <= rate < 75.0` | Contribui para REJECTED |
| | Classe inválida (abaixo) | `rate < 0.0` | Lança exceção |
| | Classe inválida (acima) | `rate > 100.0` | Lança exceção |
| `hasRequiredCourses` | Classe válida | `true` | Sem impacto negativo |
| | Classe de rejeição | `false` | Contribui para REJECTED |
| `disciplinaryRecord` | Classe válida | `false` | Sem impacto negativo |
| | Classe de rejeição | `true` | Contribui para REJECTED |

### 2.2 Valores Limite Considerados

| Parâmetro | Valor | Tipo | Resultado |
|---|---|---|---|
| `age` | 15 | Logo abaixo do limite de rejeição (16) | REJECTED |
| `age` | 16 | Limite inferior da faixa de revisão | MANUAL_REVIEW |
| `age` | 17 | Limite superior da faixa de revisão | MANUAL_REVIEW |
| `age` | 18 | Primeiro valor fora da faixa de revisão | APPROVED |
| `gpa` | 5.9 | Logo abaixo do limite de rejeição (6.0) | REJECTED |
| `gpa` | 6.0 | Limite inferior da faixa de revisão | MANUAL_REVIEW |
| `gpa` | 6.9 | Logo abaixo do limite de aprovação (7.0) | MANUAL_REVIEW |
| `gpa` | 7.0 | Limite inferior para aprovação | APPROVED |
| `gpa` | 0.0 | Extremo inferior válido | REJECTED (válido) |
| `gpa` | 10.0 | Extremo superior válido | APPROVED (válido) |
| `gpa` | -0.1 | Logo abaixo do mínimo válido | Exceção |
| `gpa` | 10.1 | Logo acima do máximo válido | Exceção |
| `attendanceRate` | 74.9 | Logo abaixo do limite de rejeição (75.0) | REJECTED |
| `attendanceRate` | 75.0 | Limite inferior da faixa de revisão | MANUAL_REVIEW |
| `attendanceRate` | 79.9 | Logo abaixo do limite de aprovação (80.0) | MANUAL_REVIEW |
| `attendanceRate` | 80.0 | Limite inferior para aprovação | APPROVED |
| `attendanceRate` | 0.0 | Extremo inferior válido | REJECTED (válido) |
| `attendanceRate` | 100.0 | Extremo superior válido | APPROVED (válido) |
| `attendanceRate` | -0.1 | Logo abaixo do mínimo válido | Exceção |
| `attendanceRate` | 100.1 | Logo acima do máximo válido | Exceção |

### 2.3 Decisões/Branches Relevantes do Código

O código-fonte possui 12 pontos de decisão:

| ID | Linha | Condição | Branch True | Branch False |
|---|---|---|---|---|
| D1 | 27 | `age < 16` | REJECTED (motivo idade) | Avalia D2 |
| D2 | 29 | `age <= 17` | MANUAL_REVIEW (motivo idade) | Continua |
| D3 | 34 | `gpa < 6.0` | REJECTED (motivo GPA) | Avalia D4 |
| D4 | 36 | `gpa < 7.0` | MANUAL_REVIEW (motivo GPA) | Continua |
| D5 | 41 | `attendanceRate < 75.0` | REJECTED (motivo frequência) | Avalia D6 |
| D6 | 43 | `attendanceRate < 80.0` | MANUAL_REVIEW (motivo frequência) | Continua |
| D7 | 48 | `!hasRequiredCourses` | REJECTED (motivo cursos) | Continua |
| D8 | 53 | `disciplinaryRecord` | REJECTED (motivo disciplina) | Continua |
| D9 | 58 | `rejectionReasons.length > 0` | Retorna REJECTED | Avalia D10 |
| D10 | 62 | `reviewReasons.length > 0` | Retorna MANUAL_REVIEW | Retorna APPROVED |
| V1 | 73 | `gpa < 0 \|\| gpa > 10` | Lança Error | Continua |
| V2 | 77 | `attendanceRate < 0 \|\| attendanceRate > 100` | Lança Error | Continua |

### 2.4 Cobertura de Decisões pelos Testes

| Decisão | Testes que exercitam Branch True | Testes que exercitam Branch False |
|---|---|---|
| D1 (`age < 16`) | `age=15 → REJECTED`, `age=10 → REJECTED (múltiplos)` | `age=16 → REVIEW`, `age=18 → APPROVED` |
| D2 (`age <= 17`) | `age=16 → REVIEW`, `age=17 → REVIEW` | `age=18 → APPROVED`, candidato ideal |
| D3 (`gpa < 6.0`) | `gpa=5.0 → REJECTED`, `gpa=5.9 → REJECTED` | `gpa=6.0 → REVIEW`, `gpa=7.0 → APPROVED` |
| D4 (`gpa < 7.0`) | `gpa=6.0 → REVIEW`, `gpa=6.5 → REVIEW`, `gpa=6.9 → REVIEW` | `gpa=7.0 → APPROVED`, candidato ideal |
| D5 (`rate < 75`) | `rate=70 → REJECTED`, `rate=74.9 → REJECTED` | `rate=75 → REVIEW`, `rate=80 → APPROVED` |
| D6 (`rate < 80`) | `rate=75 → REVIEW`, `rate=77 → REVIEW`, `rate=79.9 → REVIEW` | `rate=80 → APPROVED`, candidato ideal |
| D7 (`!hasReq`) | `hasReq=false → REJECTED` | Candidato ideal, testes de limite |
| D8 (`discip`) | `discip=true → REJECTED` | Candidato ideal, testes de limite |
| D9 (`rej > 0`) | Todos os testes REJECTED | Testes APPROVED, REVIEW |
| D10 (`rev > 0`) | Todos os testes MANUAL_REVIEW | Testes APPROVED |
| V1 (`gpa inv`) | `gpa=-0.1`, `gpa=10.1` | `gpa=0.0`, `gpa=10.0` (extremos válidos) |
| V2 (`rate inv`) | `rate=-0.1`, `rate=100.1` | `rate=0.0`, `rate=100.0` (extremos válidos) |

**Resultado**: Todas as 12 decisões são exercitadas em ambas as direções (True e False).

---

## 3. Análise de Mutação

### 3.1 Score de Mutação Inicial

| Métrica | Valor |
|---|---|
| **Total de mutantes** | 94 |
| **Killed** | 88 |
| **Survived** | 3 |
| **No Coverage** | 3 |
| **Mutation Score (total)** | **93.62%** |
| **Mutation Score (covered)** | **96.70%** |

### 3.2 Análise Individual dos Mutantes Sobreviventes

#### Mutante 1 — `ConditionalExpression` (linha 84)

```diff
- if (require.main === module) {
+ if (true) {
```

**Classificação: MUTANTE EQUIVALENTE**

**Justificativa**: Este mutante altera o bloco de exemplo de uso (`if (require.main === module)`), que é executado apenas quando o arquivo é chamado diretamente como script via `node ScholarshipEligibilityEvaluator.js`. Durante os testes, o arquivo é importado via `require()`, portanto `require.main !== module` e o bloco nunca é executado. A mutação para `if (true)` faria o bloco de exemplo executar durante os testes, mas sua saída (um `console.log`) não afeta o retorno de nenhuma função testada. Nenhum teste deveria (nem poderia de forma significativa) detectar essa mutação, pois ela não altera o comportamento observável do sistema sob teste.

#### Mutante 2 — `ConditionalExpression` (linha 84)

```diff
- if (require.main === module) {
+ if (false) {
```

**Classificação: MUTANTE EQUIVALENTE**

**Justificativa**: Similar ao Mutante 1, mas com `if (false)`. O bloco de exemplo já não é executado durante os testes (pois `require.main !== module`), então mudar para `if (false)` mantém exatamente o mesmo comportamento durante a execução dos testes. O comportamento observável do sistema é idêntico — nenhuma função exportada é afetada.

#### Mutante 3 — `EqualityOperator` (linha 84)

```diff
- if (require.main === module) {
+ if (require.main !== module) {
```

**Classificação: MUTANTE EQUIVALENTE**

**Justificativa**: Inverter a comparação de `===` para `!==` faria o bloco de exemplo executar quando o arquivo é importado (nos testes) e não executar quando chamado diretamente. Porém, o bloco contém apenas uma chamada a `evaluateScholarship` com `console.log` do resultado — não modifica estado global nem altera o comportamento das funções exportadas. A suíte de testes invoca `evaluateScholarship` diretamente, sem depender deste bloco. O `console.log` adicional é um efeito colateral sem observabilidade nos testes. Portanto, este mutante é equivalente.

### 3.3 Mutantes sem Cobertura (No Coverage)

Os 3 mutantes "No Coverage" estão todos dentro do bloco `if (require.main === module)` (linhas 84-93):

1. **BlockStatement** (linha 84): Remoção do corpo do bloco de exemplo
2. **BooleanLiteral** (linha 89): `true` → `false` no argumento `hasRequiredCourses` do exemplo
3. **BooleanLiteral** (linha 90): `false` → `true` no argumento `disciplinaryRecord` do exemplo

Todos são **ruído** — mutações em código de exemplo que não é executado durante os testes e não faz parte da lógica de negócio. A especificação da atividade antecipa explicitamente este cenário: *"Ferramentas de mutação geram mutantes em trechos irrelevantes do arquivo (blocos de exemplo de uso, por exemplo). Identificar e descartar esse ruído faz parte da análise."*

### 3.4 Score de Mutação Final

Após análise, todos os 3 mutantes sobreviventes foram classificados como equivalentes. A suíte original já mata todos os mutantes relevantes (aqueles que alteram a lógica de negócio).

Para o score final, configuramos o Stryker para excluir o bloco de exemplo (linhas 83-94), eliminando o ruído:

| Métrica | Inicial | Final |
|---|---|---|
| **Total de mutantes** | 94 | 88 |
| **Killed** | 88 | 88 |
| **Survived** | 3 | 0 |
| **No Coverage** | 3 | 0 |
| **Mutation Score (total)** | **93.62%** | **100.00%** |
| **Mutation Score (covered)** | **96.70%** | **100.00%** |

**Diferença explicada**: Os 6 mutantes eliminados (3 survived + 3 no coverage) eram todos no bloco `if (require.main === module)`, que é código de exemplo de uso e não faz parte da lógica de negócio do sistema. A suíte original já era completa em relação à lógica de negócio.

---

## 4. Análise de Adequação

### 4.1 Como os Testes Foram Derivados da Especificação (Funcional)

Os testes foram projetados a partir de duas técnicas funcionais:

- **Classes de equivalência**: Para cada parâmetro, foram identificadas partições que produzem comportamentos distintos (aprovação, revisão, rejeição, exceção). Cada classe é representada por pelo menos um caso de teste.
- **Análise de valor limite**: Para cada fronteira entre classes (ex: `gpa=5.9` vs `gpa=6.0`, `gpa=6.9` vs `gpa=7.0`), foram testados valores nos dois lados do limite para garantir que a transição de comportamento ocorre exatamente no ponto correto.

Os testes verificam não apenas o `status` retornado, mas também a lista de `reasons`, que é parte da saída observável do sistema.

### 4.2 Como os Testes Cobrem a Estrutura do Código (Estrutural)

A análise estrutural identificou 12 pontos de decisão no código. Cada um foi exercitado em ambas as direções (True e False):
- **Cobertura de statements**: 94.59% (as únicas linhas não cobertas são o bloco de exemplo `if (require.main === module)`)
- **Cobertura de branches**: 96.66%
- **Cobertura de funções**: 100%

### 4.3 O Que a Análise de Mutação Revelou que a Cobertura Não Revelou

A análise de mutação confirmou que a suíte é robusta para a lógica de negócio. Enquanto a cobertura indicava 94.59% de statements, a análise de mutação revelou que os 5.41% não cobertos (e os mutantes correspondentes) eram todos no bloco de exemplo — **ruído**, não lacunas. Ambas as métricas convergiram na mesma conclusão: a suíte cobre completamente a lógica de negócio.

Num cenário mais típico, a análise de mutação teria revelado situações onde a cobertura é exercitada mas não verificada adequadamente (testes que executam código sem fazer assertions significativas). A verificação explícita de `reasons` em todos os testes preveniu essa lacuna.

### 4.4 Limitações da Suíte

1. **Tipagem dinâmica**: Os testes não verificam o comportamento para entradas de tipos inesperados (ex: `age` como string, `gpa` como `null`, `attendanceRate` como `undefined`). O sistema não inclui validação de tipos.
2. **Concorrência**: Não aplicável neste sistema síncrono, mas numa versão assíncrona seria uma lacuna.
3. **Testes de integração**: A suíte é composta exclusivamente de testes unitários. Não há testes de integração com sistemas externos.
4. **Valores de ponto flutuante**: Apesar de testarmos limites como 5.9 e 6.0, não exploramos problemas de precisão de ponto flutuante (ex: `0.1 + 0.2 !== 0.3`).

### 4.5 Por Que Alta Cobertura Não Garante Ausência de Defeitos

Alta cobertura (mesmo 100%) indica apenas que todas as linhas/branches foram **executadas**, não que foram **verificadas**. Um teste pode executar uma linha sem fazer nenhuma assertion sobre seu resultado. A análise de mutação complementa a cobertura ao verificar se a suíte é sensível a alterações no código — mas mesmo ela tem limitações:

- **Mutantes equivalentes** podem inflar falsamente a aparência de lacunas
- Ambas as métricas são cegas a **defeitos de omissão** (funcionalidades que deveriam existir mas não foram implementadas)
- Não detectam problemas de **requisitos incorretos** (se a especificação estiver errada, os testes refletem a especificação errada)
- Não cobrem propriedades emergentes como performance, segurança ou usabilidade

---

## 5. Respostas às Perguntas do Enunciado

### 1. Quais classes de equivalência foram identificadas?

Foram identificadas 15 classes de equivalência para os 5 parâmetros do sistema: 3 para `age` (rejeição, revisão, aprovação), 4 para `gpa` (2 inválidas + rejeição/revisão/aprovação), 4 para `attendanceRate` (mesma estrutura), 2 para `hasRequiredCourses` (true/false) e 2 para `disciplinaryRecord` (true/false). Ver Seção 2.1.

### 2. Quais valores limite foram considerados?

20 valores-limite, cobrindo ambos os lados de cada fronteira entre classes de equivalência, incluindo os extremos válidos dos intervalos de validação (0.0 e 10.0 para GPA, 0.0 e 100.0 para frequência). Ver Seção 2.2.

### 3. Quais decisões importantes do código foram testadas?

Todas as 12 decisões do código foram testadas em ambos os branches (True e False): 8 regras de negócio (idade, GPA, frequência, cursos, disciplina + decisão final), 2 decisões de validação e 2 decisões de resultado final. Ver Seções 2.3 e 2.4.

### 4. Qual foi o score de mutação inicial e final? O que explica a diferença?

- **Inicial**: 93.62% (88/94 killed)
- **Final**: 100.00% (88/88 killed, após exclusão do bloco de exemplo)

A diferença é explicada pela remoção de 6 mutantes de ruído no bloco `if (require.main === module)` — código de exemplo que não faz parte da lógica de negócio.

### 5. A cobertura de código e o score de mutação apontaram para as mesmas lacunas? Se divergiram, por quê?

Sim, convergiram. Ambas identificaram o bloco `if (require.main === module)` como a única área não coberta/com mutantes sobreviventes. Não houve divergência significativa porque a suíte foi projetada para verificar `reasons` (não apenas `status`), o que previne o cenário comum de "cobertura alta mas mutantes sobreviventes" causado por assertions insuficientes.

### 6. Quais mutantes você classificou como equivalentes, e com base em que argumento?

3 mutantes foram classificados como equivalentes, todos na linha 84 (`if (require.main === module)`). O argumento é que este bloco é código de exemplo que nunca é executado durante os testes e cujo comportamento (um `console.log`) não afeta as funções exportadas. Ver Seção 3.2.

### 7. A suíte pode ser considerada adequada? Por quê?

Sim, a suíte pode ser considerada adequada para o escopo da lógica de negócio do sistema:
- 100% de mutation score sobre a lógica de negócio
- Todas as classes de equivalência representadas
- Todos os valores-limite testados
- Todas as decisões exercitadas em ambas as direções
- Verificação de `reasons` em todos os testes

As limitações residem em aspectos fora do escopo (tipagem, integração, performance).

### 8. Que tipos de defeito nenhuma das duas métricas — cobertura e score de mutação — seria capaz de revelar?

- **Defeitos de omissão**: Funcionalidades ausentes (ex: se houvesse uma regra de renda familiar não implementada)
- **Defeitos de requisitos**: Se a especificação definir limites errados (ex: GPA mínimo deveria ser 7.0 e não 6.0)
- **Defeitos não-funcionais**: Performance, segurança, usabilidade, acessibilidade
- **Defeitos de concorrência**: Race conditions em versões assíncronas
- **Defeitos de configuração/ambiente**: Comportamento que varia conforme ambiente de execução

