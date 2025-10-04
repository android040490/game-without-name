import { EnemyState } from "../components/EnemyStateComponent";
import { EnemyAnimationData, EnemyAnimations } from "./EnemyAnimations";

export const EnemyStateToAnimationMap: Partial<
  Record<EnemyState, () => EnemyAnimationData>
> = {
  [EnemyState.Idle]: EnemyAnimations.Idle,
  [EnemyState.ChaseWalk]: EnemyAnimations.Walk,
  [EnemyState.ChaseRun]: EnemyAnimations.Run,
  [EnemyState.Damaged]: EnemyAnimations.ReactionHit,
  [EnemyState.Scream]: EnemyAnimations.Scream,
  [EnemyState.StandUp]: EnemyAnimations.StandUp,
  [EnemyState.Attack]: EnemyAnimations.Attack,
  [EnemyState.Dying]: EnemyAnimations.Dying,
};
