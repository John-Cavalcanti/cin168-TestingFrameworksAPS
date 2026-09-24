const {
  evaluateScholarship,
  Status,
  EvaluationResult,
} = require("../ScholarshipEligibilityEvaluator");

// ============================================================================
// Helper: parâmetros padrão para um candidato ideal (APPROVED)
// ============================================================================
const IDEAL = {
  age: 20,
  gpa: 8.5,
  attendanceRate: 92.0,
  hasRequiredCourses: true,
  disciplinaryRecord: false,
};

/** Chama evaluateScholarship mesclando overrides com os valores ideais. */
function evaluate(overrides = {}) {
  const p = { ...IDEAL, ...overrides };
  return evaluateScholarship(
    p.age,
    p.gpa,
    p.attendanceRate,
    p.hasRequiredCourses,
    p.disciplinaryRecord
  );
}

// ============================================================================
// TESTES
// ============================================================================

describe("ScholarshipEligibilityEvaluator", () => {
  // --------------------------------------------------------------------------
  // 1. Casos APPROVED
  // --------------------------------------------------------------------------
  describe("APPROVED cases", () => {
    test("deve aprovar candidato ideal (todos os critérios ótimos)", () => {
      const result = evaluate();
      expect(result.status).toBe(Status.APPROVED);
      expect(result.reasons).toEqual([
        "Applicant meets all scholarship requirements.",
      ]);
    });

    test("deve aprovar com valores mínimos exatos para aprovação (age=18, gpa=7.0, attendance=80.0)", () => {
      const result = evaluate({ age: 18, gpa: 7.0, attendanceRate: 80.0 });
      expect(result.status).toBe(Status.APPROVED);
      expect(result.reasons).toEqual([
        "Applicant meets all scholarship requirements.",
      ]);
    });

    test("deve aprovar candidato com valores altos (age=50, gpa=10.0, attendance=100.0)", () => {
      const result = evaluate({ age: 50, gpa: 10.0, attendanceRate: 100.0 });
      expect(result.status).toBe(Status.APPROVED);
      expect(result.reasons).toEqual([
        "Applicant meets all scholarship requirements.",
      ]);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Casos REJECTED
  // --------------------------------------------------------------------------
  describe("REJECTED cases", () => {
    test("deve rejeitar por idade menor que 16", () => {
      const result = evaluate({ age: 15 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Applicant is younger than the minimum age."
      );
    });

    test("deve rejeitar por GPA abaixo de 6.0", () => {
      const result = evaluate({ gpa: 5.0 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "GPA is below the minimum required."
      );
    });

    test("deve rejeitar por frequência abaixo de 75%", () => {
      const result = evaluate({ attendanceRate: 70.0 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Attendance rate is below the minimum required."
      );
    });

    test("deve rejeitar por cursos obrigatórios não completados", () => {
      const result = evaluate({ hasRequiredCourses: false });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Required courses have not been completed."
      );
    });

    test("deve rejeitar por registro disciplinar", () => {
      const result = evaluate({ disciplinaryRecord: true });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Applicant has a disciplinary record."
      );
    });

    test("deve rejeitar com múltiplos motivos simultâneos", () => {
      const result = evaluate({
        age: 10,
        gpa: 2.0,
        attendanceRate: 50.0,
        hasRequiredCourses: false,
        disciplinaryRecord: true,
      });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toHaveLength(5);
      expect(result.reasons).toContain(
        "Applicant is younger than the minimum age."
      );
      expect(result.reasons).toContain(
        "GPA is below the minimum required."
      );
      expect(result.reasons).toContain(
        "Attendance rate is below the minimum required."
      );
      expect(result.reasons).toContain(
        "Required courses have not been completed."
      );
      expect(result.reasons).toContain(
        "Applicant has a disciplinary record."
      );
    });

    test("REJECTED deve ter prioridade sobre MANUAL_REVIEW quando ambos existem", () => {
      // age=16 geraria REVIEW, mas gpa=3.0 gera REJECTION → resultado deve ser REJECTED
      const result = evaluate({ age: 16, gpa: 3.0 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "GPA is below the minimum required."
      );
      // reviewReasons existem, mas não aparecem no resultado REJECTED
      expect(result.reasons).not.toContain(
        "Applicant is under 18 and requires manual review."
      );
    });
  });

  // --------------------------------------------------------------------------
  // 3. Casos MANUAL_REVIEW
  // --------------------------------------------------------------------------
  describe("MANUAL_REVIEW cases", () => {
    test("deve encaminhar para revisão manual por idade entre 16 e 17", () => {
      const result = evaluate({ age: 17 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Applicant is under 18 and requires manual review."
      );
    });

    test("deve encaminhar para revisão manual por GPA entre 6.0 e 6.9", () => {
      const result = evaluate({ gpa: 6.5 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "GPA is in the manual review range."
      );
    });

    test("deve encaminhar para revisão manual por frequência entre 75% e 79.9%", () => {
      const result = evaluate({ attendanceRate: 77.0 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Attendance rate is in the manual review range."
      );
    });

    test("deve acumular múltiplos motivos de revisão manual", () => {
      const result = evaluate({ age: 16, gpa: 6.5, attendanceRate: 76.0 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toHaveLength(3);
      expect(result.reasons).toContain(
        "Applicant is under 18 and requires manual review."
      );
      expect(result.reasons).toContain(
        "GPA is in the manual review range."
      );
      expect(result.reasons).toContain(
        "Attendance rate is in the manual review range."
      );
    });
  });

  // --------------------------------------------------------------------------
  // 4. Entradas inválidas / Validação
  // --------------------------------------------------------------------------
  describe("Invalid inputs (validation)", () => {
    test("deve lançar erro para GPA negativo", () => {
      expect(() => evaluate({ gpa: -0.1 })).toThrow(
        "GPA must be between 0 and 10."
      );
    });

    test("deve lançar erro para GPA maior que 10", () => {
      expect(() => evaluate({ gpa: 10.1 })).toThrow(
        "GPA must be between 0 and 10."
      );
    });

    test("deve lançar erro para frequência negativa", () => {
      expect(() => evaluate({ attendanceRate: -0.1 })).toThrow(
        "Attendance rate must be between 0 and 100."
      );
    });

    test("deve lançar erro para frequência maior que 100", () => {
      expect(() => evaluate({ attendanceRate: 100.1 })).toThrow(
        "Attendance rate must be between 0 and 100."
      );
    });

    test("validação de GPA é executada antes das regras de negócio", () => {
      // Mesmo que age seja inválida (< 16), a validação de GPA deve ocorrer primeiro
      expect(() =>
        evaluateScholarship(10, -1.0, 90.0, true, false)
      ).toThrow("GPA must be between 0 and 10.");
    });

    test("validação de frequência é executada antes das regras de negócio", () => {
      // GPA válido mas frequência inválida → deve lançar erro de frequência
      expect(() =>
        evaluateScholarship(10, 5.0, 101.0, true, false)
      ).toThrow("Attendance rate must be between 0 and 100.");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Valores limite
  // --------------------------------------------------------------------------
  describe("Boundary values", () => {
    // --- Idade ---
    test("age = 15 → REJECTED (logo abaixo do limite de 16)", () => {
      const result = evaluate({ age: 15 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Applicant is younger than the minimum age."
      );
    });

    test("age = 16 → MANUAL_REVIEW (limite inferior da faixa de revisão)", () => {
      const result = evaluate({ age: 16 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Applicant is under 18 and requires manual review."
      );
    });

    test("age = 17 → MANUAL_REVIEW (limite superior da faixa de revisão)", () => {
      const result = evaluate({ age: 17 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Applicant is under 18 and requires manual review."
      );
    });

    test("age = 18 → APPROVED (primeiro valor fora da faixa de revisão)", () => {
      const result = evaluate({ age: 18 });
      expect(result.status).toBe(Status.APPROVED);
    });

    // --- GPA ---
    test("gpa = 5.9 → REJECTED (logo abaixo do limite de 6.0)", () => {
      const result = evaluate({ gpa: 5.9 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "GPA is below the minimum required."
      );
    });

    test("gpa = 6.0 → MANUAL_REVIEW (limite inferior da faixa de revisão)", () => {
      const result = evaluate({ gpa: 6.0 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "GPA is in the manual review range."
      );
    });

    test("gpa = 6.9 → MANUAL_REVIEW (logo abaixo do limite de 7.0)", () => {
      const result = evaluate({ gpa: 6.9 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "GPA is in the manual review range."
      );
    });

    test("gpa = 7.0 → APPROVED (limite inferior para aprovação)", () => {
      const result = evaluate({ gpa: 7.0 });
      expect(result.status).toBe(Status.APPROVED);
    });

    // --- Frequência ---
    test("attendanceRate = 74.9 → REJECTED (logo abaixo de 75.0)", () => {
      const result = evaluate({ attendanceRate: 74.9 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Attendance rate is below the minimum required."
      );
    });

    test("attendanceRate = 75.0 → MANUAL_REVIEW (limite inferior da faixa de revisão)", () => {
      const result = evaluate({ attendanceRate: 75.0 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Attendance rate is in the manual review range."
      );
    });

    test("attendanceRate = 79.9 → MANUAL_REVIEW (logo abaixo de 80.0)", () => {
      const result = evaluate({ attendanceRate: 79.9 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toContain(
        "Attendance rate is in the manual review range."
      );
    });

    test("attendanceRate = 80.0 → APPROVED (limite inferior para aprovação)", () => {
      const result = evaluate({ attendanceRate: 80.0 });
      expect(result.status).toBe(Status.APPROVED);
    });

    // --- Limites de validação (extremos válidos) ---
    test("gpa = 0.0 → válido (não lança erro), resulta em REJECTED", () => {
      const result = evaluate({ gpa: 0.0 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "GPA is below the minimum required."
      );
    });

    test("gpa = 10.0 → válido (não lança erro), resulta em APPROVED", () => {
      const result = evaluate({ gpa: 10.0 });
      expect(result.status).toBe(Status.APPROVED);
    });

    test("attendanceRate = 0.0 → válido (não lança erro), resulta em REJECTED", () => {
      const result = evaluate({ attendanceRate: 0.0 });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toContain(
        "Attendance rate is below the minimum required."
      );
    });

    test("attendanceRate = 100.0 → válido (não lança erro), resulta em APPROVED", () => {
      const result = evaluate({ attendanceRate: 100.0 });
      expect(result.status).toBe(Status.APPROVED);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Decisões e fluxos combinados
  // --------------------------------------------------------------------------
  describe("Decisions and combined flows", () => {
    test("rejeição apenas por cursos mantém apenas o motivo de cursos", () => {
      const result = evaluate({ hasRequiredCourses: false });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons).toEqual([
        "Required courses have not been completed.",
      ]);
    });

    test("rejeição apenas por disciplina mantém apenas o motivo de disciplina", () => {
      const result = evaluate({ disciplinaryRecord: true });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons).toEqual([
        "Applicant has a disciplinary record.",
      ]);
    });

    test("duas rejeições acumulam exatamente 2 motivos", () => {
      const result = evaluate({
        hasRequiredCourses: false,
        disciplinaryRecord: true,
      });
      expect(result.status).toBe(Status.REJECTED);
      expect(result.reasons).toHaveLength(2);
      expect(result.reasons).toContain(
        "Required courses have not been completed."
      );
      expect(result.reasons).toContain(
        "Applicant has a disciplinary record."
      );
    });

    test("age e GPA na faixa de review acumulam 2 motivos de revisão", () => {
      const result = evaluate({ age: 17, gpa: 6.5 });
      expect(result.status).toBe(Status.MANUAL_REVIEW);
      expect(result.reasons).toHaveLength(2);
      expect(result.reasons).toContain(
        "Applicant is under 18 and requires manual review."
      );
      expect(result.reasons).toContain(
        "GPA is in the manual review range."
      );
    });

    test("EvaluationResult contém as propriedades corretas", () => {
      const result = evaluate();
      expect(result).toBeInstanceOf(EvaluationResult);
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("reasons");
    });

    test("Status contém os valores estáticos corretos", () => {
      expect(Status.APPROVED).toBe("APPROVED");
      expect(Status.REJECTED).toBe("REJECTED");
      expect(Status.MANUAL_REVIEW).toBe("MANUAL_REVIEW");
    });
  });
});

