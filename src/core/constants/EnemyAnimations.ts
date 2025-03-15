import { AnimationData } from "../components/AnimationComponent";

export type EnemyAnimationKey = "idle" | "walk" | "run";

export interface EnemyAnimationData extends AnimationData<EnemyAnimationKey> {
  type: "attack" | "idle" | "movement";
}

export class EnemyAnimations {
  static readonly Idle: EnemyAnimationData = {
    actionName: "idle",
    type: "idle",
  };
  static readonly Walk: EnemyAnimationData = {
    actionName: "walk",
    type: "movement",
  };
  static readonly Run: EnemyAnimationData = {
    actionName: "run",
    type: "movement",
  };
}
