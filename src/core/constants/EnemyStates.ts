import { CharacterState } from "../components/CharacterStateComponent";
import { EnemyAnimationData, EnemyAnimations } from "./EnemyAnimations";

type EnemyStateKey = "Idle" | "Walk" | "Run" | "Damaged";

export interface EnemyState extends CharacterState {
  name: EnemyStateKey;
  animation: EnemyAnimationData;
  nextState?: EnemyState;
}

export class EnemyStates {
  static readonly Idle: EnemyState = {
    name: "Idle",
    speed: 0,
    animation: EnemyAnimations.Idle,
  };
  static readonly Walk: EnemyState = {
    name: "Walk",
    speed: 2,
    animation: EnemyAnimations.Walk,
  };
  static readonly Run: EnemyState = {
    name: "Run",
    speed: 7,
    animation: EnemyAnimations.Run,
  };
  static readonly Damaged: EnemyState = {
    name: "Damaged",
    speed: 0,
    animation: EnemyAnimations.ReactionHit,
    nextState: EnemyStates.Idle,
  };
}
