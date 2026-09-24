/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: [
    // Incluir apenas as linhas de lógica de negócio, excluindo o bloco
    // de exemplo de uso (linhas 83-94) que é ruído para análise de mutação
    "ScholarshipEligibilityEvaluator.js:1-80",
    "ScholarshipEligibilityEvaluator.js:96-102",
  ],
  testRunner: "jest",
  jest: {
    configFile: undefined,
  },
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "perTest",
  thresholds: { high: 80, low: 60, break: null },
};

