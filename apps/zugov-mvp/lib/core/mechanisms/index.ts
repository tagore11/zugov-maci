import type { Mechanism, MechanismId } from "../types";
import { approval } from "./approval";
import { ranked } from "./ranked";
import { quadratic } from "./quadratic";
import { consent } from "./consent";
import { allocate } from "./allocate";

export const MECHANISMS: Record<MechanismId, Mechanism<any>> = {
  approval,
  ranked,
  quadratic,
  consent,
  allocate,
};

export const MECHANISM_ORDER: MechanismId[] = ["approval", "ranked", "quadratic", "consent", "allocate"];

export function getMechanism(id: MechanismId): Mechanism<any> {
  const mechanism = MECHANISMS[id];
  if (!mechanism) throw new Error(`Bilinmeyen mekanizma: ${id}`);
  return mechanism;
}

export * from "./shared";
export type { ApprovalShape } from "./approval";
export type { RankedShape } from "./ranked";
export type { QuadraticShape } from "./quadratic";
export type { ConsentShape } from "./consent";
export type { AllocateShape } from "./allocate";
