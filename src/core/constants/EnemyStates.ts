import { EnemyAnimationData, EnemyAnimations } from "./EnemyAnimations";

export interface EnemyState {
  speed: number;
  animation: EnemyAnimationData;
}

export class EnemyStates {
  static readonly Idle: EnemyState = {
    speed: 0,
    animation: EnemyAnimations.Idle,
  };
  static readonly Walk: EnemyState = {
    speed: 2,
    animation: EnemyAnimations.Walk,
  };
  static readonly Run: EnemyState = {
    speed: 7,
    animation: EnemyAnimations.Run,
  };
}
