import { AssessmentQuestion, QuestionCondition } from "./types";

export function evaluateCondition(
  condition: QuestionCondition,
  parentResponse: unknown
): boolean {
  if (condition.contains && Array.isArray(parentResponse)) {
    return condition.contains.some((v) => parentResponse.includes(v));
  }

  if (condition.equals !== undefined) {
    return parentResponse === condition.equals;
  }

  if (condition.notEquals !== undefined) {
    return parentResponse !== condition.notEquals;
  }

  if (condition.gt !== undefined) {
    return Number(parentResponse) > condition.gt;
  }

  if (condition.lt !== undefined) {
    return Number(parentResponse) < condition.lt;
  }

  return true;
}

export function shouldShowQuestion(
  question: AssessmentQuestion,
  responses: Record<string, unknown>
): boolean {
  if (!question.parentQuestionId || !question.condition) {
    return true;
  }

  const parentKey = findParentKey(question.parentQuestionId, responses);
  if (!parentKey) return false;

  const parentResponse = responses[parentKey];
  return evaluateCondition(question.condition, parentResponse);
}

function findParentKey(
  parentQuestionId: string,
  responses: Record<string, unknown>
): string | null {
  for (const key of Object.keys(responses)) {
    if (key.includes(parentQuestionId) || key === parentQuestionId) {
      return key;
    }
  }
  return null;
}

export function filterVisibleQuestions(
  questions: AssessmentQuestion[],
  responses: Record<string, unknown>
): AssessmentQuestion[] {
  return questions.filter((q) => shouldShowQuestion(q, responses));
}

export function getResponseValue(
  responses: Record<string, unknown>,
  key: string
): unknown {
  return responses[key] ?? null;
}

export function setResponseValue(
  responses: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> {
  return { ...responses, [key]: value };
}

export function validateRequiredQuestions(
  questions: AssessmentQuestion[],
  responses: Record<string, unknown>
): { valid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  for (const question of questions) {
    if (!question.isRequired) continue;
    if (!shouldShowQuestion(question, responses)) continue;

    const value = responses[question.questionKey];
    if (value === undefined || value === null || value === "") {
      missingKeys.push(question.questionKey);
    }

    if (Array.isArray(value) && value.length === 0) {
      missingKeys.push(question.questionKey);
    }
  }

  return { valid: missingKeys.length === 0, missingKeys };
}