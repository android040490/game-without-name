import { AnimationData } from "../components/AnimationComponent";

export type EnemyAnimationKey =
  | "idle"
  | "walk"
  | "run"
  | "reaction:hit"
  | "dying";

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
  static readonly ReactionHit: EnemyAnimationData = {
    actionName: "reaction:hit",
    type: "idle",
    repetitions: 1,
    timeScale: 2,
  };
  static readonly Dying: EnemyAnimationData = {
    actionName: "dying",
    type: "idle",
    repetitions: 1,
  };
}
