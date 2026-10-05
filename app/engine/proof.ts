import type { Proof } from "../types/geometry";
export function validateProofOrder(proof: Proof, order: string[]) {
  if (
    order.length !== proof.steps.length ||
    new Set(order).size !== order.length
  )
    return false;
  const seen = new Set<string>();
  for (const id of order) {
    const step = proof.steps.find((s) => s.id === id);
    if (!step || !step.dependsOn.every((dependency) => seen.has(dependency)))
      return false;
    seen.add(id);
  }
  return true;
}
