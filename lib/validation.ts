export function validateAnswer(selected: string, correctAnswer: string): boolean {
  return selected.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}
